import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, signInWithGoogle, signOut as firebaseSignOut } from '../services/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'

interface AuthContextType {
  user: FirebaseUser | null
  isLoading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignInWithGoogle = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer login'
      setError(message)
      console.error('Erro no login:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      await firebaseSignOut()
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer logout'
      setError(message)
      console.error('Erro no logout:', err)
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
