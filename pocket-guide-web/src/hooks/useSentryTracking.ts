/**
 * Hook for Sentry Integration
 */

import { useEffect } from 'react'
import { setSentryUser, clearSentryUser, trackUserAction } from '../services/sentryService'

/**
 * Hook que sincroniza user do AuthContext com Sentry
 */
export function useSentryUserTracking(userId?: string, email?: string, displayName?: string) {
  useEffect(() => {
    if (userId) {
      setSentryUser(userId, email, displayName)
    } else {
      clearSentryUser()
    }
  }, [userId, email, displayName])
}

/**
 * Hook que rastreia ações do usuário
 */
export function useSentryTracking(actionName: string, properties?: Record<string, any>) {
  useEffect(() => {
    trackUserAction(actionName, properties)
  }, [actionName, properties])
}
