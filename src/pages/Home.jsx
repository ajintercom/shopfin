import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react'
import { PRODUCTS, CATEGORIES } from '../data/products'
import ProductCard from '../components/ProductCard'
import { openIntercom } from '../lib/intercom'

const HERO_BANNERS = [
  { title: 'Summer Deals',   sub: 'Up to 40% off Electronics', bg: 'from-gray-900 to-gray-700',     emoji: '💻', cat: 'electronics' },
  { title: 'New Arrivals',   sub: 'Fresh styles just landed',   bg: 'from-brand-700 to-brand-500',   emoji: '👕', cat: 'clothing' },
  { title: 'Home & Kitchen', sub: 'Upgrade your space',         bg: 'from-emerald-800 to-emerald-600', emoji: '🏠', cat: 'home' },
]

const PERKS = [
  { icon: Truck,        title: 'Free Shipping',       sub: 'On orders over $49' },
  { icon: RotateCcw,   title: 'Easy Returns',         sub: '30-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Payment',       sub: 'SSL-encrypted checkout' },
  { icon: Headphones,  title: 'AI Support 24/7',      sub: 'Fin AI agent always ready' },
]

export default function Home() {
  const navigate = useNavigate()
  const featured = PRODUCTS.filter((p) => p.badge === 'Best Seller').slice(0, 4)
  const newArrivals = PRODUCTS.filter((p) => p.badge === 'New').slice(0, 4)

  return (
    <div>
      {/* Hero banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {HERO_BANNERS.map((b) => (
            <div
              key={b.cat}
              className={`bg-gradient-to-br ${b.bg} text-white rounded-2xl p-6 flex flex-col justify-between min-h-[160px] cursor-pointer hover:opacity-95 transition-opacity`}
              onClick={() => navigate(`/products?cat=${b.cat}`)}
            >
              <div>
                <p className="text-sm font-medium opacity-80">{b.title}</p>
                <h2 className="text-xl font-bold mt-1">{b.sub}</h2>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button className="text-sm font-semibold underline">Shop now</button>
                <span className="text-4xl">{b.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perks bar */}
      <section className="bg-white border-y border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PERKS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <Icon size={22} className="text-brand-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <Link
              key={cat.id}
              to={`/products?cat=${cat.id}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all text-sm font-medium"
            >
              <span className="text-xl">{cat.emoji}</span>
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Best Sellers</h2>
          <Link
            to="/products"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">New Arrivals</h2>
            <Link
              to="/products?badge=New"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Fin AI support banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-indigo-600 to-brand-500 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Need help? Ask Fin AI</h3>
            <p className="text-sm opacity-90 mt-1">
              Our AI agent can help with order tracking, returns, product questions, and more — 24/7.
            </p>
          </div>
          <button
            onClick={() => openIntercom('Hi! I need help with my order.')}
            className="flex-shrink-0 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow"
          >
            Chat with Fin
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-sm py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ShopFin. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
