import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, ShoppingCart, ArrowLeft, Plus, Minus, MessageCircle, Truck, RotateCcw } from 'lucide-react'
import { getProductById, PRODUCTS } from '../data/products'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import { openIntercom } from '../lib/intercom'
import clsx from 'clsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = getProductById(id)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">
          Back to Products
        </button>
      </div>
    )
  }

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  function handleAddToCart() {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to={`/products?cat=${product.category}`} className="hover:text-brand-600 capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {discount && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={
                    s <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6 pb-6 border-b border-gray-100">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Perks */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck size={16} className="text-brand-500" />
              Free shipping on orders over $49
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RotateCcw size={16} className="text-brand-500" />
              30-day hassle-free returns
            </div>
          </div>

          {/* Quantity + Add to cart */}
          {product.inStock ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base transition-all',
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-md'
                )}
              >
                <ShoppingCart size={18} />
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { addToCart(product, qty); navigate('/cart') }}
                className="w-full py-3 rounded-xl font-bold text-base border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-500 text-center py-4 rounded-xl font-medium">
              Currently out of stock
            </div>
          )}

          {/* Ask Fin */}
          <button
            onClick={() => openIntercom(`Hi! I have a question about ${product.name}.`)}
            className="mt-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <MessageCircle size={16} />
            Ask Fin AI about this product
          </button>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
