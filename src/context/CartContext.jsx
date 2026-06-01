import React, { createContext, useContext, useEffect, useReducer } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'shopfin_cart'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.qty || 1) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: action.qty || 1 }],
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'SET_QTY':
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.qty } : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'LOAD':
      return { ...state, items: action.items }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 49 ? 0 : 5.99
  const total = subtotal + tax + shipping

  function addToCart(product, qty = 1) {
    dispatch({ type: 'ADD', product, qty })
  }
  function removeFromCart(id) {
    dispatch({ type: 'REMOVE', id })
  }
  function setQty(id, qty) {
    dispatch({ type: 'SET_QTY', id, qty })
  }
  function clearCart() {
    dispatch({ type: 'CLEAR' })
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        tax,
        shipping,
        total,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
