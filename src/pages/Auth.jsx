import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })

  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user])

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (form.password !== form.confirm) {
        setError('Passwords do not match')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
      } else {
        const { error } = await signUp(form.email, form.password, form.fullName)
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <span className="text-3xl">🛍️</span>
            <span className="text-brand-500">ShopFin</span>
          </Link>
          <h1 className="text-xl font-bold mt-4">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to continue shopping'
              : 'Join ShopFin for a personalized experience'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                className="input"
                type="text"
                required
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={update('fullName')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="input"
              type="email"
              required
              placeholder="jane@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPwd ? 'text' : 'password'}
                required
                placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                value={form.password}
                onChange={update('password')}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                className="input"
                type={showPwd ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.confirm}
                onChange={update('confirm')}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {loading
              ? 'Please wait…'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-brand-600 hover:text-brand-700 font-semibold"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to ShopFin's Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
