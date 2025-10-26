/**
 * usePersistentAuth Hook
 * 
 * Hook customizado que estende useAuth() com funcionalidades de persistência
 * - Verifica sessão salva ao iniciar
 * - Oferece informações sobre expiração do token
 * - Gerencia renovação automática de token
 */

import { useAuth } from '../contexts/AuthContext'
import * as tokenStorage from '../services/tokenStorage'
import { useEffect, useState } from 'react'
import { debug } from '../utils/debug'

interface PersistentAuthState {
  user: ReturnType<typeof useAuth>['user']
  isLoading: ReturnType<typeof useAuth>['isLoading']
  isAuthenticated: ReturnType<typeof useAuth>['isAuthenticated']
  error: ReturnType<typeof useAuth>['error']
  tokenExpiresIn: number
  sessionInfo: ReturnType<typeof tokenStorage.getSessionInfo>
  hasValidSession: boolean
}

export const usePersistentAuth = (): PersistentAuthState & {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
} => {
  const auth = useAuth()
  const [tokenExpiresIn, setTokenExpiresIn] = useState(0)

  // Atualiza informações de expiração do token a cada minuto
  useEffect(() => {
    const updateTokenExpiry = () => {
      const expiresIn = tokenStorage.getTokenExpiresIn()
      setTokenExpiresIn(expiresIn)

      // Se token vai expirar em menos de 5 minutos, avisa
      if (expiresIn > 0 && expiresIn < 300) {
        debug.warn(`Token expirará em ${expiresIn} segundos`)
      }

      // Se token expirou, faz logout
      if (expiresIn === 0 && auth.isAuthenticated) {
        debug.warn('Token expirou, fazendo logout automático')
        auth.signOut().catch((err) => debug.error('Erro ao fazer logout automático:', err))
      }
    }

    updateTokenExpiry()

    // Atualiza a cada 30 segundos
    const interval = setInterval(updateTokenExpiry, 30000)

    return () => clearInterval(interval)
  }, [auth])

  const sessionInfo = tokenStorage.getSessionInfo()

  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    tokenExpiresIn,
    sessionInfo,
    hasValidSession: tokenStorage.hasValidSession(),
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
  }
}
