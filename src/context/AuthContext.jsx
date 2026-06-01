import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  bootIntercomUser,
  bootIntercomAnon,
  shutdownIntercom,
  fetchIntercomJwt,
} from '../lib/intercom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  async function syncIntercom(session) {
    if (!session?.user) {
      bootIntercomAnon()
      return
    }
    const { user } = session
    const jwt = await fetchIntercomJwt(user.id, user.email, session.access_token)
    bootIntercomUser(
      {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        created_at: user.created_at,
      },
      jwt
    )
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      syncIntercom(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      syncIntercom(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    shutdownIntercom()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
