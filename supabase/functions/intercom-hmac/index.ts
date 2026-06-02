/**
 * Supabase Edge Function: intercom-hmac
 * Generates a signed HS256 JWT for Intercom JWT authentication.
 * The secret never leaves the server — only the token is returned.
 *
 * Set secret: supabase secrets set INTERCOM_SECRET=<your_secret>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function generateJwt(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const header = base64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const now = Math.floor(Date.now() / 1000)
  const claims = base64url(encoder.encode(JSON.stringify({ ...payload, iat: now, exp: now + 3600 })))
  const data = `${header}.${claims}`

  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const sigB64 = base64url(new Uint8Array(sig))

  return `${data}.${sigB64}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const secret = Deno.env.get('INTERCOM_SECRET')
    if (!secret) {
      return new Response(JSON.stringify({ error: 'INTERCOM_SECRET not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = await generateJwt(
      {
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      },
      secret
    )

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
