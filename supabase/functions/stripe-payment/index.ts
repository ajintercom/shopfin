/**
 * Supabase Edge Function: stripe-payment
 * Creates a Stripe PaymentIntent server-side.
 * The Stripe secret key never touches the browser.
 *
 * Set secret: supabase secrets set STRIPE_SECRET_KEY=sk_test_...
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'usd', metadata = {} } = await req.json()

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create PaymentIntent via Stripe REST API
    const body = new URLSearchParams({
      amount: Math.round(amount * 100).toString(), // cents
      currency,
      'automatic_payment_methods[enabled]': 'true',
    })
    // Attach metadata
    Object.entries(metadata).forEach(([k, v]) => {
      body.append(`metadata[${k}]`, String(v))
    })

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const intent = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: intent.error?.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ clientSecret: intent.client_secret }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
