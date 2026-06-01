import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { PRODUCTS, CATEGORIES, searchProducts, getProductsByCategory } from '../data/products'
import ProductCard from '../components/ProductCard'
import clsx from 'clsx'

const SORT_OPTIONS = [
  { value: 'default',     label: 'Featured' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Best Rated' },
  { value: 'reviews',     label: 'Most Reviews' },
]

export default function Products() {
  const [params, setParams] = useSearchParams()
  const q      = params.get('q') || ''
  const cat    = params.get('cat') || 'all'
  const sort   = params.get('sort') || 'default'

  const products = useMemo(() => {
    let list = q ? searchProducts(q) : getProductsByCategory(cat)
    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price)
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price)
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating)
      case 'reviews':    return [...list].sort((a, b) => b.reviewCount - a.reviewCount)
      default:           return list
    }
  }, [q, cat, sort])

  function setParam(key, value) {
    const next = new URLSearchParams(params)
    next.set(key, value)
    setParams(next)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {q
            ? `Search results for "${q}"`
            : cat !== 'all'
            ? CATEGORIES.find((c) => c.id === cat)?.label || 'Products'
            : 'All Products'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {products.length} {products.length === 1 ? 'result' : 'results'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filter */}
        <aside className="lg:w-52 flex-shrink-0">
          <div className="card p-4 sticky top-20">
            <h2 className="font-semibold text-sm flex items-center gap-1.5 mb-3">
              <SlidersHorizontal size={15} /> Categories
            </h2>
            <ul className="space-y-1">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setParam('cat', c.id)}
                    className={clsx(
                      'w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2',
                      cat === c.id
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 bg-white border border-gray-100 rounded-xl px-4 py-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="text-sm border-none bg-transparent focus:outline-none font-medium text-gray-700"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-lg">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
