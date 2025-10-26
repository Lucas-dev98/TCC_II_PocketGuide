/**
 * Offline Sync Service
 * 
 * Gerencia fila de requisições que devem ser sincronizadas quando conexão voltar
 * - Detecta status de conexão
 * - Enfileira requisições offline
 * - Sincroniza automaticamente quando volta online
 * - Oferece callbacks de status
 */

import { debug } from '../utils/debug'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface OfflineRequest {
  id: string
  method: RequestMethod
  url: string
  body?: unknown
  timestamp: number
  retryCount: number
  maxRetries: number
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  queueSize: number
  lastSyncTime: number | null
}

type SyncCallback = (status: SyncStatus) => void
type RequestCallback = (request: OfflineRequest, success: boolean) => void

const STORAGE_KEY = 'offline_queue'
const MAX_RETRIES = 3

class OfflineSyncService {
  private queue: OfflineRequest[] = []
  private isOnline: boolean = navigator.onLine
  private isSyncing: boolean = false
  private lastSyncTime: number | null = null
  private syncCallbacks: Set<SyncCallback> = new Set()
  private requestCallbacks: Set<RequestCallback> = new Set()

  constructor() {
    this.loadQueueFromStorage()
    this.setupConnectivityListeners()
  }

  /**
   * Setup listeners para mudanças de conectividade
   */
  private setupConnectivityListeners(): void {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Verifica conectividade a cada 5 segundos
    setInterval(() => this.checkConnectivity(), 5000)
  }

  /**
   * Quando volta online
   */
  private handleOnline(): void {
    debug.log('📡 Voltou online - sincronizando fila...')
    this.isOnline = true
    this.notifyStatusChange()

    // Aguarda um pouco e depois sincroniza
    setTimeout(() => this.syncQueue(), 500)
  }

  /**
   * Quando fica offline
   */
  private handleOffline(): void {
    debug.warn('📵 Ficou offline - requisições serão enfileiradas')
    this.isOnline = false
    this.notifyStatusChange()
  }

  /**
   * Verifica conectividade fazendo requisição leve
   */
  private checkConnectivity(): void {
    // Faz ping para endpoint leve
    fetch('/manifest.json', { method: 'HEAD' })
      .then(() => {
        if (!this.isOnline) {
          this.handleOnline()
        }
      })
      .catch(() => {
        if (this.isOnline) {
          this.handleOffline()
        }
      })
  }

  /**
   * Adiciona requisição à fila
   */
  public enqueueRequest(
    method: RequestMethod,
    url: string,
    body?: unknown
  ): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const request: OfflineRequest = {
      id,
      method,
      url,
      body,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    }

    this.queue.push(request)
    this.saveQueueToStorage()
    this.notifyStatusChange()

    debug.log(`📦 Requisição enfileirada [${id}]: ${method} ${url}`)

    // Se online, sincroniza imediatamente
    if (this.isOnline && !this.isSyncing) {
      this.syncQueue()
    }

    return id
  }

  /**
   * Sincroniza a fila de requisições
   */
  public async syncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) {
      return
    }

    this.isSyncing = true
    this.notifyStatusChange()

    debug.log(`🔄 Iniciando sincronização de ${this.queue.length} requisições`)

    while (this.queue.length > 0) {
      const request = this.queue[0]

      try {
        // Tenta fazer requisição
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        // Sucesso - remove da fila
        this.queue.shift()
        this.saveQueueToStorage()
        this.requestCallbacks.forEach((cb) => cb(request, true))

        debug.log(`✅ Requisição sincronizada [${request.id}]`)
      } catch (error) {
        request.retryCount++

        if (request.retryCount >= request.maxRetries) {
          // Limite de retentativas atingido
          this.queue.shift()
          this.requestCallbacks.forEach((cb) => cb(request, false))

          debug.error(`❌ Falha ao sincronizar [${request.id}]:`, error)
        } else {
          // Tenta novamente
          debug.warn(
            `⚠️ Retry ${request.retryCount}/${request.maxRetries} [${request.id}]`
          )
          break // Para de processar, vai tentar novamente depois
        }
      }
    }

    this.lastSyncTime = Date.now()
    this.isSyncing = false
    this.notifyStatusChange()

    debug.log('✨ Sincronização concluída')
  }

  /**
   * Carrega fila do localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
        debug.log(`Fila carregada do armazenamento: ${this.queue.length} requisições`)
      }
    } catch (error) {
      debug.error('Erro ao carregar fila:', error)
      this.queue = []
    }
  }

  /**
   * Salva fila no localStorage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue))
    } catch (error) {
      debug.error('Erro ao salvar fila:', error)
    }
  }

  /**
   * Limpa a fila
   */
  public clearQueue(): void {
    this.queue = []
    this.saveQueueToStorage()
    this.notifyStatusChange()
    debug.log('Fila de sincronização limpa')
  }

  /**
   * Retorna status atual
   */
  public getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueSize: this.queue.length,
      lastSyncTime: this.lastSyncTime,
    }
  }

  /**
   * Retorna fila inteira (para debug)
   */
  public getQueue(): OfflineRequest[] {
    return [...this.queue]
  }

  /**
   * Subscribe para mudanças de status
   */
  public onStatusChange(callback: SyncCallback): () => void {
    this.syncCallbacks.add(callback)
    // Retorna função para unsubscribe
    return () => this.syncCallbacks.delete(callback)
  }

  /**
   * Subscribe para eventos de requisição
   */
  public onRequestSync(callback: RequestCallback): () => void {
    this.requestCallbacks.add(callback)
    return () => this.requestCallbacks.delete(callback)
  }

  /**
   * Notifica todos os subscribers sobre mudança de status
   */
  private notifyStatusChange(): void {
    const status = this.getStatus()
    this.syncCallbacks.forEach((cb) => {
      try {
        cb(status)
      } catch (error) {
        debug.error('Erro em callback de status:', error)
      }
    })
  }
}

// Singleton
export const offlineSyncService = new OfflineSyncService()
