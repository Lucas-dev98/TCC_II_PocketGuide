import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, signInWithGoogle, signOut as firebaseSignOut } from '../services/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import * as tokenStorage from '../services/tokenStorage'
import { debug } from '../utils/debug'
import { useI18n } from '../i18n/I18nContext'

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
  const { t } = useI18n()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Tenta recuperar sessão persistida
    const recoverSession = async () => {
      try {
        const storedUser = tokenStorage.getStoredUser()
        
        if (storedUser && tokenStorage.hasValidSession()) {
          // Se tem sessão válida no localStorage, tenta revalidar com Firebase
          debug.log('Sessão encontrada no localStorage, revalidando...')
        }
      } catch (err) {
        debug.error('Erro ao recuperar sessão:', err)
      }
    }
    
    recoverSession()

    // Monitora mudanças de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      
      // Se usuário fez login, salva no localStorage
      if (currentUser) {
        const idToken = currentUser.getIdToken()
        idToken.then((token) => {
          tokenStorage.saveToken(token)
          tokenStorage.saveUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          })
          debug.log('Token salvo no localStorage')
        })
      } else {
        // Se usuário fez logout, limpa localStorage
        tokenStorage.clearToken()
      }
      
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignInWithGoogle = async () => {
    try {
      setError(null)
      setIsLoading(true)
      await signInWithGoogle()
      // Token será salvo no onAuthStateChanged acima
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.errors.loginFailed')
      setError(message)
      debug.error('Erro no login:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      // Limpa token do localStorage antes de fazer logout no Firebase
      tokenStorage.clearToken()
      await firebaseSignOut()
      setUser(null)
      debug.log('Logout realizado, sessão limpa')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.errors.logoutFailed')
      setError(message)
      debug.error('Erro no logout:', err)
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
