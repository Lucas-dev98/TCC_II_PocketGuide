/**
 * useOfflineSync Hook
 * 
 * Hook que monitora status de sincronização offline
 * - Detecta mudanças de conectividade
 * - Monitora fila de requisições
 * - Oferece informações em tempo real
 */

import { useState, useEffect } from 'react'
import {
  offlineSyncService,
  SyncStatus,
  OfflineRequest,
} from '../services/offlineSyncService'

export const useOfflineSync = () => {
  const [status, setStatus] = useState<SyncStatus>(offlineSyncService.getStatus())
  const [queue, setQueue] = useState<OfflineRequest[]>(offlineSyncService.getQueue())

  useEffect(() => {
    // Monitora mudanças de status
    const unsubscribeStatus = offlineSyncService.onStatusChange((newStatus) => {
      setStatus(newStatus)
      setQueue(offlineSyncService.getQueue())
    })

    return unsubscribeStatus
  }, [])

  return {
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    queueSize: status.queueSize,
    lastSyncTime: status.lastSyncTime,
    queue,
    syncNow: () => offlineSyncService.syncQueue(),
    clearQueue: () => offlineSyncService.clearQueue(),
  }
}
