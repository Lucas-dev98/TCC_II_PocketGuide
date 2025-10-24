import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, signInWithGoogle, signOut as firebaseSignOut } from '@/services/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'

interface AuthContextType {
  user: FirebaseUser | null
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      console.error('Sign in error:', err)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      setError(message)
      console.error('Sign out error:', err)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
