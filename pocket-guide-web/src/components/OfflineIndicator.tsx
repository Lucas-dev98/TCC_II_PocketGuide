/**
 * OfflineIndicator Component
 * 
 * Mostra status de conectividade e fila de sincronização
 * Aparece apenas quando offline ou quando há items na fila
 */

import React from 'react'
import { useOfflineSync } from '../hooks/useOfflineSync'

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, queueSize, syncNow, lastSyncTime } = useOfflineSync()

  // Não mostra nada se está online e fila vazia
  if (isOnline && queueSize === 0) {
    return null
  }

  // Se está offline
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <div className="text-xl">📵</div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Sem conexão</p>
            <p className="text-sm text-amber-700">
              Você está offline. As mudanças serão sincronizadas quando voltar online.
            </p>
            {queueSize > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {queueSize} ação{queueSize !== 1 ? 's' : ''} na fila
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Se está sincronizando
  if (isSyncing) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <div className="text-xl animate-spin">🔄</div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">Sincronizando</p>
            <p className="text-sm text-blue-700">
              Salvando {queueSize} mudança{queueSize !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Se tem items na fila (mas não está sincronizando - pode estar esperando)
  if (queueSize > 0) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-40">
        <div className="flex items-center gap-3">
          <div className="text-xl">✅</div>
          <div className="flex-1">
            <p className="font-semibold text-green-900">Sincronização completa</p>
            <p className="text-sm text-green-700">
              {lastSyncTime
                ? `Última sincronização: ${formatTimeAgo(lastSyncTime)}`
                : 'Pronto para sincronizar'}
            </p>
          </div>
          <button
            onClick={syncNow}
            className="ml-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
          >
            Sincronizar
          </button>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Formata tempo transcorrido
 */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'agora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`

  return `${Math.floor(seconds / 86400)}d atrás`
}
