import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Lock, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function FormField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={id} className="input" {...props} />
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total } = useCart()
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  async function handleCheckout(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const origin = window.location.origin

      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          items,
          total,
          customerEmail: ship.email,
          successUrl: `${origin}/order-confirmation/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/cart`,
        }),
      })

      const data = await res.json()

      if (data.url) {
        // Redirect to Stripe hosted checkout
        window.location.href = data.url
      } else {
        setError(data.error || 'Payment setup failed. Please try again.')
      }
    } catch (err) {
      setError('Could not connect to payment service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
              <Truck size={20} className="text-brand-500" /> Shipping & Contact
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
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

              {/* Payment info notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-2">
                <Lock size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">Secure payment via Stripe</p>
                  <p className="text-xs mt-0.5">You'll be redirected to Stripe's secure payment page to complete your purchase.</p>
                  <p className="text-xs mt-1 font-medium">Test card: <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code> · Any future date · Any CVC</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 mt-2"
              >
                <CreditCard size={18} />
                {loading ? 'Redirecting to payment…' : `Pay $${total.toFixed(2)} securely`}
              </button>
            </form>
          </div>
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
