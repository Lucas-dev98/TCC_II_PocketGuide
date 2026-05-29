import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, deleteCurrentUser, getCurrentUser, loginUser, logoutUser, registerUser, updateCurrentUser } from '../services/authApi'
import * as tokenStorage from '../services/tokenStorage'
import { debug } from '../utils/debug'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  updateProfile: (payload: { name?: string; email?: string; password?: string }) => Promise<void>
  deleteAccount: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fallbackAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  signIn: async () => {
    throw new Error('AuthProvider não está disponível no momento')
  },
  signUp: async () => {
    throw new Error('AuthProvider não está disponível no momento')
  },
  updateProfile: async () => {
    throw new Error('AuthProvider não está disponível no momento')
  },
  deleteAccount: async () => {
    throw new Error('AuthProvider não está disponível no momento')
  },
  signInWithGoogle: async () => {
    throw new Error('Login com Google não está disponível nesta versão')
  },
  signOut: async () => {},
  isAuthenticated: false,
}

let warnedAboutMissingAuthProvider = false

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    if (typeof window !== 'undefined' && !warnedAboutMissingAuthProvider) {
      console.warn('⚠️ useAuth used outside AuthProvider, falling back to local safe state')
      warnedAboutMissingAuthProvider = true
    }

    return fallbackAuthContext
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const recoverSession = async () => {
      try {
        if (!tokenStorage.hasValidSession()) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const current = await getCurrentUser()
        setUser(current)
        tokenStorage.saveUser({
          uid: current.uid,
          email: current.email,
          displayName: current.displayName,
          photoURL: null,
        })
      } catch (err) {
        debug.error('Erro ao recuperar sessão:', err)
        tokenStorage.clearToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    recoverSession()

    return undefined
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const loggedIn = await loginUser({ email, password })
      setUser(loggedIn)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer login'
      setError(message)
      debug.error('Erro no login:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (name: string, email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const created = await registerUser({ name, email, password })
      setUser(created)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao criar conta'
      setError(message)
      debug.error('Erro no cadastro:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (payload: { name?: string; email?: string; password?: string }) => {
    try {
      setError(null)
      const updated = await updateCurrentUser(payload)
      setUser(updated)
      tokenStorage.saveUser({
        uid: updated.uid,
        email: updated.email,
        displayName: updated.displayName,
        photoURL: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao atualizar perfil'
      setError(message)
      throw err
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setError(null)
      await deleteCurrentUser()
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao excluir conta'
      setError(message)
      throw err
    }
  }

  const handleSignInWithGoogle = async () => {
    throw new Error('Login com Google não está disponível nesta versão')
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      logoutUser()
      setUser(null)
      debug.log('Logout realizado, sessão limpa')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer logout'
      setError(message)
      debug.error('Erro no logout:', err)
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    updateProfile: handleUpdateProfile,
    deleteAccount: handleDeleteAccount,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAuthenticated: !!user && tokenStorage.hasValidSession(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
