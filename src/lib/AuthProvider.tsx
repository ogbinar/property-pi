'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import pb from '@/lib/pocketbase'

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: check if PocketBase has a valid session
  useEffect(() => {
    const updateAuth = () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser({
          id: pb.authStore.record.id,
          email: pb.authStore.record.email,
          name: pb.authStore.record.name || pb.authStore.record.email,
        })
      } else {
        setUser(null)
      }
    }

    updateAuth()
    pb.authStore.onChange(updateAuth)
    setIsLoading(false)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email, password)
      // pb.authStore is automatically updated by the SDK
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser({
          id: pb.authStore.record.id,
          email: pb.authStore.record.email,
          name: pb.authStore.record.name || pb.authStore.record.email,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    pb.authStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
