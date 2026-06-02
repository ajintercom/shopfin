import React, { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, MessageCircle } from 'lucide-react'
import { openIntercom } from '../lib/intercom'
import { useCart } from '../context/CartContext'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const sessionId = searchParams.get('session_id')

  // If coming from Stripe hosted checkout (success URL)
  const isStripeSuccess = orderId === 'success' && sessionId
  const displayId = isStripeSuccess
    ? `ORD-${sessionId.slice(-8).toUpperCase()}`
    : orderId

  useEffect(() => {
    if (isStripeSuccess) {
      // Save order and clear cart
      const orders = JSON.parse(localStorage.getItem('shopfin_orders') || '[]')
      const newOrderId = `ORD-${sessionId.slice(-8).toUpperCase()}`
      if (!orders.find((o) => o.id === newOrderId)) {
        orders.unshift({
          id: newOrderId,
          stripeSessionId: sessionId,
          date: new Date().toISOString(),
          status: 'Processing',
          items: [],
          total: 0,
        })
        localStorage.setItem('shopfin_orders', JSON.stringify(orders))
      }
      clearCart()
    }
  }, [isStripeSuccess])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="card p-10">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={44} className="text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your purchase. We'll send a confirmation email shortly.
        </p>

        <div className="bg-gray-50 rounded-xl py-4 px-6 mb-8 inline-block">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="font-mono font-bold text-lg text-gray-900">{displayId}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Package size={16} /> View My Orders
          </Link>
          <Link
            to="/products"
            className="btn-secondary flex items-center justify-center gap-2 py-3 px-6"
          >
            Continue Shopping
          </Link>
        </div>

        <button
          onClick={() => openIntercom(`Hi! I just placed order ${orderId} and have a question.`)}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mx-auto"
        >
          <MessageCircle size={15} />
          Questions about your order? Ask Fin AI
        </button>
      </div>
    </div>
  )
}
