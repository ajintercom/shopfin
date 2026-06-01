import React from 'react'
import { Link } from 'react-router-dom'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import clsx from 'clsx'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  function handleAdd(e) {
    e.preventDefault()
    addToCart(product)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {product.badge && (
            <span
              className={clsx(
                'absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full',
                product.badge === 'Out of Stock'
                  ? 'bg-gray-600 text-white'
                  : product.badge === 'Sale'
                  ? 'bg-red-500 text-white'
                  : product.badge === 'New'
                  ? 'bg-blue-500 text-white'
                  : 'bg-brand-500 text-white'
              )}
            >
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    star <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {product.rating} ({product.reviewCount.toLocaleString()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={clsx(
              'w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-colors',
              product.inStock
                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <ShoppingCart size={15} />
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  )
}
