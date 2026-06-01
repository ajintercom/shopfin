import React from 'react'
import { Link } from 'react-router-dom'
import { Package, MessageCircle } from 'lucide-react'
import { openIntercom } from '../lib/intercom'

const STATUS_COLORS = {
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped:    'bg-blue-100 text-blue-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
}

export default function Orders() {
  const orders = JSON.parse(localStorage.getItem('shopfin_orders') || '[]')

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
        <p className="text-gray-500 mb-6">Your order history will appear here</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-gray-900">{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.Processing}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  )}
                </div>
              ))}
              {order.items.length > 4 && (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">
                  +{order.items.length - 4}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => openIntercom(`Hi, I have a question about order ${order.id}.`)}
                className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-200"
              >
                <MessageCircle size={15} />
                Track / Support
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
