import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Truck, CheckCircle, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const STEPS = ['Shipping', 'Payment', 'Review']

function FormField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id} className="input" {...props} />
    </div>
  )
}

// Inner payment form using Stripe hooks
function StripePaymentForm({ clientSecret, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/order-confirmation/pending' },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-xl">
        <PaymentElement />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="btn-secondary flex-1 py-3">
          ← Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn-primary flex-1 py-3 text-base"
        >
          {loading ? 'Processing…' : 'Pay Now'}
        </button>
      </div>
    </form>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total, clearCart } = useCart()
  const { user, session } = useAuth()
  const [step, setStep] = useState(0)
  const [clientSecret, setClientSecret] = useState('')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [ship, setShip] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  async function handleShipNext(e) {
    e.preventDefault()
    setLoadingIntent(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
          metadata: { email: ship.email, name: ship.fullName },
        }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setStep(1)
      } else {
        alert('Payment setup failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Payment setup failed: ' + err.message)
    } finally {
      setLoadingIntent(false)
    }
  }

  function handlePaymentSuccess(paymentIntentId) {
    // Save order to localStorage
    const orderId = `ORD-${paymentIntentId.slice(-8).toUpperCase()}`
    const orders = JSON.parse(localStorage.getItem('shopfin_orders') || '[]')
    orders.unshift({
      id: orderId,
      paymentIntentId,
      date: new Date().toISOString(),
      items: [...items],
      subtotal, tax, shipping, total, ship,
      status: 'Processing',
    })
    localStorage.setItem('shopfin_orders', JSON.stringify(orders))
    clearCart()
    navigate(`/order-confirmation/${orderId}`)
  }

  const stripeOptions = clientSecret
    ? { clientSecret, appearance: { theme: 'stripe' } }
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-brand-600' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
                <Truck size={20} className="text-brand-500" /> Shipping Address
              </h2>
              <form onSubmit={handleShipNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" id="fullName" required value={ship.fullName} onChange={(e) => setShip({...ship, fullName: e.target.value})} />
                  <FormField label="Email" id="email" type="email" required value={ship.email} onChange={(e) => setShip({...ship, email: e.target.value})} />
                </div>
                <FormField label="Street Address" id="address" required placeholder="123 Main St" value={ship.address} onChange={(e) => setShip({...ship, address: e.target.value})} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FormField label="City" id="city" required value={ship.city} onChange={(e) => setShip({...ship, city: e.target.value})} />
                  <FormField label="State" id="state" required placeholder="CA" value={ship.state} onChange={(e) => setShip({...ship, state: e.target.value})} />
                  <FormField label="ZIP" id="zip" required placeholder="94105" value={ship.zip} onChange={(e) => setShip({...ship, zip: e.target.value})} />
                </div>
                <button type="submit" disabled={loadingIntent} className="btn-primary w-full py-3 text-base">
                  {loadingIntent ? 'Setting up payment…' : 'Continue to Payment →'}
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Stripe Payment */}
          {step === 1 && clientSecret && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-1">
                <Lock size={20} className="text-brand-500" /> Payment
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-5">
                <Lock size={12} /> Secured by Stripe — your card details are encrypted
              </p>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep(0)}
                />
              </Elements>
              {/* Test card hint */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                <strong>Test mode:</strong> Use card <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code>, any future date, any CVC.
              </div>
            </div>
          )}

          {/* Step 2: not used with Stripe (payment is step 1 final) */}
          {step === 2 && (
            <div className="card p-6 text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold">Payment Successful!</h2>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-700">
                <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-3" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
