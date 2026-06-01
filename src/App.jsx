import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import Auth from './pages/Auth'
import { injectIntercomScript, updateIntercom } from './lib/intercom'

function AppInner() {
  const location = useLocation()

  // Update Intercom on every page change (tracks page views)
  useEffect(() => {
    updateIntercom()
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                       element={<Home />} />
          <Route path="/products"               element={<Products />} />
          <Route path="/product/:id"            element={<ProductDetail />} />
          <Route path="/cart"                   element={<Cart />} />
          <Route path="/checkout"               element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders"                 element={<Orders />} />
          <Route path="/auth"                   element={<Auth />} />
          <Route path="*"                       element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  // Inject the Intercom script once on mount
  useEffect(() => {
    injectIntercomScript()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  )
}
