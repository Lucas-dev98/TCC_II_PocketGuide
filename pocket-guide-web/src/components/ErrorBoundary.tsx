/**
 * Error Boundary Component
 * 
 * Captura erros React que acontecem durante rendering
 * e exibe uma UI de recuperação
 */

import React, { ErrorInfo, ReactNode } from 'react'
import { captureError } from '../services/sentryService'
import { debug } from '../utils/debug'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log para debug
    debug.error('ErrorBoundary caught error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Enviar para Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      type: 'react_error_boundary',
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Se existe fallback customizado, usar
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      // Fallback padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8">
            {/* Ícone de erro */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0-12a9 9 0 110 18 9 9 0 010-18z"
                  />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Oops! Algo deu errado
            </h1>

            {/* Mensagem */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              Desculpe, encontramos um erro inesperado. Já notificamos nosso time e
              estamos trabalhando para corrigir isso.
            </p>

            {/* Erro em desenvolvimento */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                  <strong>Erro:</strong> {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 flex-col">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => {
                  window.location.href = '/'
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Voltar ao Início
              </button>
            </div>

            {/* Suporte */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Se o problema persistir, entre em contato com{' '}
              <a
                href="mailto:support@pocketguide.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                support@pocketguide.com
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
