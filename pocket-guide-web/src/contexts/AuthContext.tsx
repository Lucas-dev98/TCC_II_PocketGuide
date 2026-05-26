import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, handleAuthError, isFirebaseConfigured, signInWithGoogle, signOut as firebaseSignOut } from '../services/firebase'
import { getRedirectResult, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import * as tokenStorage from '../services/tokenStorage'
import { debug } from '../utils/debug'

interface AuthContextType {
  user: FirebaseUser | null
  isLoading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fallbackAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  error: null,
  signInWithGoogle: async () => {
    throw new Error('AuthProvider não está disponível no momento')
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
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      tokenStorage.clearToken()
      setUser(null)
      setIsLoading(false)
      return undefined
    }

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

    let authStateResolved = false
    let redirectResolved = false

    const syncLoadingState = () => {
      if (authStateResolved && redirectResolved) {
        setIsLoading(false)
      }
    }

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
        // Evita limpar sessão cedo demais durante o retorno do redirect.
        if (redirectResolved) {
          tokenStorage.clearToken()
        }
      }

      authStateResolved = true
      syncLoadingState()
    })

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user)
          result.user.getIdToken().then((token) => {
            tokenStorage.saveToken(token)
            tokenStorage.saveUser({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            })
          })
        }
      })
      .catch((err) => {
        const message = handleAuthError(err)
        setError(message)
      })
      .finally(() => {
        redirectResolved = true

        if (!authStateResolved && auth.currentUser) {
          setUser(auth.currentUser)
          authStateResolved = true
        }

        syncLoadingState()
      })

    return unsubscribe
  }, [])

  const handleSignInWithGoogle = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const signedInUser = await signInWithGoogle()

      // Quando popup retorna usuário imediatamente, persistimos já aqui
      // para não depender apenas do callback assíncrono do observer.
      if (signedInUser) {
        setUser(signedInUser)
        const token = await signedInUser.getIdToken()
        tokenStorage.saveToken(token)
        tokenStorage.saveUser({
          uid: signedInUser.uid,
          email: signedInUser.email,
          displayName: signedInUser.displayName,
          photoURL: signedInUser.photoURL,
        })
        setIsLoading(false)
      }

      // No fluxo por redirect, o estado final será concluído no useEffect.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fazer login'
      setError(message)
      setIsLoading(false)
      debug.error('Erro no login:', err)
      throw err
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
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAuthenticated: !!user || tokenStorage.hasValidSession(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
