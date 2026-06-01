import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, CheckCircle, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const STEPS = ['Shipping', 'Payment', 'Review']

function FormField({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input id={id} className="input" {...props} />
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, tax, shipping, total, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [ship, setShip] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [pay, setPay] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  function handleShipNext(e) {
    e.preventDefault()
    setStep(1)
  }

  function handlePayNext(e) {
    e.preventDefault()
    setStep(2)
  }

  function formatCard(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(val) {
    const v = val.replace(/\D/g, '').slice(0, 4)
    return v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
  }

  async function handlePlaceOrder() {
    setLoading(true)
    // Simulate order processing
    await new Promise((r) => setTimeout(r, 1500))
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`

    // Save to localStorage for Orders page
    const orders = JSON.parse(localStorage.getItem('shopfin_orders') || '[]')
    orders.unshift({
      id: orderId,
      date: new Date().toISOString(),
      items: [...items],
      subtotal,
      tax,
      shipping,
      total,
      ship,
      status: 'Processing',
    })
    localStorage.setItem('shopfin_orders', JSON.stringify(orders))

    clearCart()
    navigate(`/order-confirmation/${orderId}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-brand-600' : 'text-gray-500'}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
                <Truck size={20} className="text-brand-500" /> Shipping Address
              </h2>
              <form onSubmit={handleShipNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name" id="fullName" required
                    value={ship.fullName}
                    onChange={(e) => setShip({ ...ship, fullName: e.target.value })}
                  />
                  <FormField
                    label="Email" id="email" type="email" required
                    value={ship.email}
                    onChange={(e) => setShip({ ...ship, email: e.target.value })}
                  />
                </div>
                <FormField
                  label="Street Address" id="address" required
                  placeholder="123 Main Street"
                  value={ship.address}
                  onChange={(e) => setShip({ ...ship, address: e.target.value })}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FormField
                    label="City" id="city" required
                    value={ship.city}
                    onChange={(e) => setShip({ ...ship, city: e.target.value })}
                  />
                  <FormField
                    label="State" id="state" required
                    placeholder="CA"
                    value={ship.state}
                    onChange={(e) => setShip({ ...ship, state: e.target.value })}
                  />
                  <FormField
                    label="ZIP Code" id="zip" required
                    placeholder="94105"
                    value={ship.zip}
                    onChange={(e) => setShip({ ...ship, zip: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3 text-base">
                  Continue to Payment →
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-1">
                <CreditCard size={20} className="text-brand-500" /> Payment Details
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-5">
                <Lock size={12} /> Secured with SSL encryption
              </p>
              <form onSubmit={handlePayNext} className="space-y-4">
                <FormField
                  label="Name on Card" id="cardName" required
                  placeholder="Jane Doe"
                  value={pay.cardName}
                  onChange={(e) => setPay({ ...pay, cardName: e.target.value })}
                />
                <FormField
                  label="Card Number" id="cardNumber" required
                  placeholder="4242 4242 4242 4242"
                  value={pay.cardNumber}
                  onChange={(e) => setPay({ ...pay, cardNumber: formatCard(e.target.value) })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Expiry" id="expiry" required
                    placeholder="MM/YY"
                    value={pay.expiry}
                    onChange={(e) => setPay({ ...pay, expiry: formatExpiry(e.target.value) })}
                  />
                  <FormField
                    label="CVV" id="cvv" required
                    placeholder="123"
                    maxLength={4}
                    value={pay.cvv}
                    onChange={(e) => setPay({ ...pay, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="btn-secondary flex-1 py-3"
                  >
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-3 text-base">
                    Review Order →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
                <CheckCircle size={20} className="text-brand-500" /> Review Your Order
              </h2>

              {/* Shipping summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold mb-1">Shipping to:</p>
                    <p className="text-gray-700">{ship.fullName}</p>
                    <p className="text-gray-600">{ship.address}</p>
                    <p className="text-gray-600">{ship.city}, {ship.state} {ship.zip}</p>
                  </div>
                  <button onClick={() => setStep(0)} className="text-brand-600 text-xs hover:underline">Edit</button>
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold mb-1">Paying with:</p>
                    <p className="text-gray-700">Card ending in {pay.cardNumber.slice(-4)}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-brand-600 text-xs hover:underline">Edit</button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-3"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 text-base"
                >
                  {loading ? 'Placing Order…' : `Place Order · $${total.toFixed(2)}`}
                </button>
              </div>
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
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
