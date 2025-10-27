/**
 * Sentry Initialization Service
 * 
 * Configura e gerencia Sentry para crash reporting
 * - Captura erros não tratados
 * - Rastreia performance
 * - Coleta breadcrumbs
 * - Envia eventos para Sentry dashboard
 */

import * as Sentry from '@sentry/react'
import { debug } from '../utils/debug'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''
const ENV = import.meta.env.MODE
const VERSION = '1.0.0'

/**
 * Inicializa Sentry
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    debug.warn('⚠️ Sentry DSN não configurado - crash reporting desativado')
    return
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENV,
      release: VERSION,
      
      // Rastreamento de Performance
      tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,

      // Capturar erros
      
      // Breadcrumbs
      maxBreadcrumbs: 50,
      attachStacktrace: true,

      // Antes de enviar
      beforeSend(event, hint) {
        // Filtrar erros de desenvolvimento
        if (ENV !== 'production') {
          return null
        }

        // Não enviar erros de rede (muito ruído)
        if (hint.originalException instanceof TypeError) {
          const message = String(hint.originalException)
          if (message.includes('Failed to fetch') || message.includes('Network')) {
            return null
          }
        }

        return event
      },

      // Configurar contexto
      initialScope: {
        tags: {
          environment: ENV,
          version: VERSION,
        },
        contexts: {
          react: {
            version: '18.x',
          },
        },
      },
    })

    debug.log('✅ Sentry inicializado com sucesso')
  } catch (error) {
    debug.error('❌ Erro ao inicializar Sentry:', error)
  }
}

/**
 * Define contexto do usuário
 */
export function setSentryUser(userId: string, email?: string, username?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username,
  })
}

/**
 * Limpa contexto do usuário (logout)
 */
export function clearSentryUser(): void {
  Sentry.setUser(null)
}

/**
 * Registra breadcrumb customizado
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  Sentry.captureMessage(message, level)
  
  if (data) {
    Sentry.addBreadcrumb({
      message,
      data,
      level,
      timestamp: Date.now() / 1000,
    })
  }
}

/**
 * Captura erro manualmente
 */
export function captureError(
  error: Error | string,
  context?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'error'
): void {
  try {
    if (typeof error === 'string') {
      Sentry.captureMessage(error, level)
    } else {
      Sentry.captureException(error, {
        level,
        contexts: context ? { custom: context } : undefined,
      })
    }

    debug.error('Error captured by Sentry:', error)
  } catch (err) {
    debug.error('Error capturing to Sentry:', err)
  }
}

/**
 * Captura eventos customizados
 */
export function captureEvent(
  message: string,
  data?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  Sentry.captureMessage(message, level)

  if (data) {
    Sentry.setContext('custom_event', data)
  }
}

/**
 * Rastreia ação do usuário
 */
export function trackUserAction(
  action: string,
  properties?: Record<string, any>
): void {
  addBreadcrumb(`User action: ${action}`, properties, 'info')
}

/**
 * Rastreia navegação
 */
export function trackNavigation(
  from: string,
  to: string,
  properties?: Record<string, any>
): void {
  addBreadcrumb(
    `Navigation: ${from} → ${to}`,
    {
      from,
      to,
      ...properties,
    },
    'info'
  )
}

/**
 * Rastreia API calls
 */
export function trackApiCall(
  method: string,
  url: string,
  status?: number,
  duration?: number
): void {
  const level = status && status >= 400 ? 'error' : 'info'
  addBreadcrumb(
    `API: ${method} ${url}`,
    {
      method,
      url,
      status,
      duration,
    },
    level
  )
}

/**
 * Retorna instância do Sentry
 */
export function getSentry(): typeof Sentry {
  return Sentry
}
