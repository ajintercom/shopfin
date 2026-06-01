import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, LogOut, Package, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { itemCount } = useCart()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <span className="font-bold text-xl text-brand-500">ShopFin</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden sm:flex">
            <div className="flex w-full rounded-lg overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 px-4 flex items-center transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm ml-1">Cart</span>
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <User size={20} />
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </button>
                {userOpen && (
                  <div
                    className="absolute right-0 mt-1 w-48 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                    onBlur={() => setUserOpen(false)}
                  >
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      onClick={() => setUserOpen(false)}
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1 px-3 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold transition-colors"
              >
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileOpen && (
          <div className="sm:hidden pb-3">
            <form onSubmit={handleSearch} className="flex rounded-lg overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-brand-500 px-4 flex items-center">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}
