/**
 * Intercom Fin integration with Identity Verification
 *
 * Identity Verification prevents user impersonation by signing the user's
 * email with your workspace secret (HMAC-SHA256). This MUST be done
 * server-side in production — use the Supabase edge function at
 * supabase/functions/intercom-hmac/index.ts
 *
 * For local development, the secret can be set in VITE_INTERCOM_SECRET
 * but DO NOT ship that env var to production.
 */

export const APP_ID = import.meta.env.VITE_INTERCOM_APP_ID || ''

/** Boot Intercom for an anonymous visitor */
export function bootIntercomAnon() {
  if (!APP_ID) return
  window.Intercom?.('boot', {
    api_base: 'https://api-iam.intercom.io',
    app_id: APP_ID,
  })
}

/**
 * Boot Intercom for a logged-in user with JWT authentication.
 * @param {object} user  - { id, email, name, created_at }
 * @param {string} jwt   - Signed JWT token generated server-side
 */
export function bootIntercomUser({ id, email, name, created_at }, jwt) {
  if (!APP_ID) return
  window.Intercom?.('boot', {
    api_base: 'https://api-iam.intercom.io',
    app_id: APP_ID,
    intercom_user_jwt: jwt,
    session_duration: 86400000, // 1 day
  })
}

/** Update Intercom session (e.g. after page change) */
export function updateIntercom() {
  window.Intercom?.('update')
}

/** Shutdown Intercom (e.g. on logout) */
export function shutdownIntercom() {
  window.Intercom?.('shutdown')
}

/** Open the messenger programmatically */
export function openIntercom(message) {
  if (message) {
    window.Intercom?.('showNewMessage', message)
  } else {
    window.Intercom?.('show')
  }
}

/**
 * Fetch HMAC from our Supabase edge function (production path).
 * Falls back to client-side HMAC only for local dev (insecure).
 */
/**
 * Fetch a signed Intercom JWT from the Supabase edge function.
 * Falls back to client-side generation for local dev only.
 */
export async function fetchIntercomJwt(userId, email, accessToken) {
  // Production path: call the Supabase edge function (secret stays server-side)
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const res = await fetch(`${supabaseUrl}/functions/v1/intercom-hmac`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, email }),
    })
    if (!res.ok) throw new Error('JWT endpoint failed')
    const data = await res.json()
    return data.token
  } catch {
    // Dev fallback: generate JWT client-side using VITE_INTERCOM_SECRET
    const secret = import.meta.env.VITE_INTERCOM_SECRET
    if (!secret) return null
    try {
      return await generateJwt({ user_id: userId, email }, secret)
    } catch {
      return null
    }
  }
}

/** Generate a HS256 JWT (used for local dev fallback only) */
async function generateJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims = { ...payload, iat: now, exp: now + 3600 }

  const encode = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const headerB64 = encode(header)
  const payloadB64 = encode(claims)
  const data = `${headerB64}.${payloadB64}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${data}.${sigB64}`
}

/** Inject the Intercom snippet script tag (idempotent) */
export function injectIntercomScript() {
  if (!APP_ID || window.Intercom) return
  ;(function () {
    var w = window
    var ic = w.Intercom
    if (typeof ic === 'function') {
      ic('reattach_activator')
      ic('update', w.intercomSettings)
    } else {
      var d = document
      var i = function () { i.c(arguments) }
      i.q = []
      i.c = function (args) { i.q.push(args) }
      w.Intercom = i
      var s = d.createElement('script')
      s.type = 'text/javascript'
      s.async = true
      s.src = `https://widget.intercom.io/widget/${APP_ID}`
      d.head.appendChild(s)
    }
  })()
}
