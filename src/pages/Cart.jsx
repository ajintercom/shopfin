import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, subtotal, tax, shipping, total, removeFromCart, setQty } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={16} /> Start Shopping
        </Link>
      </div>
    )
  }

  function handleCheckout() {
    if (!user) {
      navigate('/auth?redirect=/checkout')
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/product/${item.id}`} className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.id}`}
                  className="font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-brand-600 font-bold mt-1">${item.price.toFixed(2)}</p>

                <div className="flex items-center gap-4 mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQty(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Add ${(49 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <button
              onClick={handleCheckout}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2 py-3 text-base"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium mt-3"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
