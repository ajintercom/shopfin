/**
 * Supabase Edge Function: stripe-payment
 * Creates a Stripe Checkout Session and returns the hosted checkout URL.
 * No frontend Stripe library needed — just redirect the user to the URL.
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
    const { items, total, successUrl, cancelUrl, customerEmail } = await req.json()

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build line items from cart
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name, images: [item.image] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    // Build query string for Stripe Checkout Session
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('success_url', successUrl)
    params.append('cancel_url', cancelUrl)
    if (customerEmail) params.append('customer_email', customerEmail)

    lineItems.forEach((li: any, i: number) => {
      params.append(`line_items[${i}][price_data][currency]`, li.price_data.currency)
      params.append(`line_items[${i}][price_data][product_data][name]`, li.price_data.product_data.name)
      params.append(`line_items[${i}][price_data][unit_amount]`, li.price_data.unit_amount.toString())
      params.append(`line_items[${i}][quantity]`, li.quantity.toString())
    })

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const session = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: session.error?.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
