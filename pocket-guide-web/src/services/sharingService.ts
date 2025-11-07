/**
 * sharingService.ts - Serviço de compartilhamento de viagens
 * 
 * Funcionalidades:
 * - Gera URLs compartilháveis para viagens
 * - Gerencia permissões de acesso (view, edit)
 * - Armazena registros de compartilhamento no localStorage
 * - Rastreia compartilhamentos para analytics
 */

import { Trip } from '../types'

export interface ShareRecord {
  id: string
  tripId: string
  sharedBy: string
  sharedAt: Date
  expiresAt?: Date
  permission: 'view' | 'edit'
  sharedWith?: string[]
}

export interface SharedTripData {
  trip: Trip
  sharedBy: {
    name: string
    email: string
  }
  permission: 'view' | 'edit'
  sharedAt: Date
}

class SharingService {
  private readonly SHARE_STORAGE_KEY = 'trip-shares'
  private readonly BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

  /**
   * Gera URL compartilhável para uma viagem
   */
  generateShareUrl(trip: Trip, permission: 'view' | 'edit' = 'view'): string {
    const shareId = this.generateShareId()
    const shareRecord: ShareRecord = {
      id: shareId,
      tripId: trip.id,
      sharedBy: this.getCurrentUserId(),
      sharedAt: new Date(),
      permission,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    }

    // Armazena registro de compartilhamento
    this.saveShareRecord(shareRecord)

    // Gera URL com share ID como parâmetro
    const shareUrl = `${this.BASE_URL}/share/${shareId}`
    
    // Rastreia compartilhamento
    this.trackShare(trip, permission)

    return shareUrl
  }

  /**
   * Obtém dados da viagem compartilhada via share ID
   */
  getSharedTrip(shareId: string): SharedTripData | null {
    const shareRecord = this.getShareRecord(shareId)
    
    if (!shareRecord) {
      return null
    }

    // Verifica se o compartilhamento expirou
    if (shareRecord.expiresAt && new Date() > shareRecord.expiresAt) {
      this.deleteShareRecord(shareId)
      return null
    }

    // Recupera dados da viagem do localStorage
    const tripData = this.getSharedTripData()
    
    if (!tripData) {
      return null
    }

    return {
      trip: tripData.trip,
      sharedBy: tripData.sharedBy,
      permission: shareRecord.permission,
      sharedAt: shareRecord.sharedAt,
    }
  }

  /**
   * Compartilha viagem com email específico
   */
  shareWithEmail(
    trip: Trip,
    email: string,
    permission: 'view' | 'edit' = 'view'
  ): string {
    const shareUrl = this.generateShareUrl(trip, permission)
    
    // Adiciona email à lista de compartilhados
    this.addSharedEmail(trip.id, email)
    
    // Registra a ação
    console.log(`Trip ${trip.id} compartilhada com ${email}`)
    
    return shareUrl
  }

  /**
   * Obtém lista de viagens compartilhadas do usuário
   */
  getMyShares(userId?: string): ShareRecord[] {
    const currentUserId = userId || this.getCurrentUserId()
    const shares = this.getAllShareRecords()
    
    return shares.filter(share => share.sharedBy === currentUserId)
  }

  /**
   * Revoga um compartilhamento
   */
  revokeShare(shareId: string): boolean {
    return this.deleteShareRecord(shareId)
  }

  /**
   * Valida se um compartilhamento é válido
   */
  isShareValid(shareId: string): boolean {
    const shareRecord = this.getShareRecord(shareId)
    
    if (!shareRecord) {
      return false
    }

    // Verifica se expirou
    if (shareRecord.expiresAt && new Date() > shareRecord.expiresAt) {
      this.deleteShareRecord(shareId)
      return false
    }

    return true
  }

  /**
   * Obtém permissão de compartilhamento
   */
  getSharePermission(shareId: string): 'view' | 'edit' | null {
    const shareRecord = this.getShareRecord(shareId)
    
    if (!shareRecord || !this.isShareValid(shareId)) {
      return null
    }

    return shareRecord.permission
  }

  /**
   * Copia URL para clipboard
   */
  async copyToClipboard(url: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error)
      return false
    }
  }

  /**
   * Compartilha via Web Share API se disponível
   */
  async shareViaWebShare(
    trip: Trip,
    shareUrl: string
  ): Promise<boolean> {
    if (!navigator.share) {
      return false
    }

    try {
      await navigator.share({
        title: `Viagem: ${trip.destination}`,
        text: `Conheça minha viagem para ${trip.destination}!`,
        url: shareUrl,
      })
      
      this.trackShare(trip, 'view', 'web-share')
      return true
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error)
      }
      return false
    }
  }

  // ==================== Private Methods ====================

  /**
   * Gera ID único para compartilhamento
   */
  private generateShareId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 11)
    return `${timestamp}-${random}`
  }

  /**
   * Obtém ID do usuário atual (mock - seria do Firebase)
   */
  private getCurrentUserId(): string {
    return localStorage.getItem('user-id') || 'anonymous'
  }

  /**
   * Obtém dados completos de uma viagem compartilhada
   * Nota: Trips não devem ser persistidos em localStorage, eles devem sempre vir do Firestore
   */
  private getSharedTripData(): { trip: Trip; sharedBy: { name: string; email: string } } | null {
    try {
      // Trips should come from Firestore, not localStorage
      // If accessed, return null and let the caller handle it
      console.warn(`⚠️ sharingService: getSharedTripData called but trips are not stored in localStorage`)
      return null
    } catch (error) {
      console.error('Erro ao recuperar dados de viagem:', error)
      return null
    }
  }

  /**
   * Salva registro de compartilhamento
   */
  private saveShareRecord(record: ShareRecord): void {
    try {
      const shares = this.getAllShareRecords()
      shares.push(record)
      localStorage.setItem(this.SHARE_STORAGE_KEY, JSON.stringify(shares))
    } catch (error) {
      console.error('Erro ao salvar registro de compartilhamento:', error)
    }
  }

  /**
   * Obtém registro de compartilhamento por ID
   */
  private getShareRecord(shareId: string): ShareRecord | null {
    try {
      const shares = this.getAllShareRecords()
      return shares.find(share => share.id === shareId) || null
    } catch (error) {
      console.error('Erro ao obter registro de compartilhamento:', error)
      return null
    }
  }

  /**
   * Obtém todos os registros de compartilhamento
   */
  private getAllShareRecords(): ShareRecord[] {
    try {
      const shares = localStorage.getItem(this.SHARE_STORAGE_KEY)
      if (!shares) {
        return []
      }
      
      return JSON.parse(shares).map((share: any) => ({
        ...share,
        sharedAt: new Date(share.sharedAt),
        expiresAt: share.expiresAt ? new Date(share.expiresAt) : undefined,
      }))
    } catch (error) {
      console.error('Erro ao obter registros de compartilhamento:', error)
      return []
    }
  }

  /**
   * Deleta registro de compartilhamento
   */
  private deleteShareRecord(shareId: string): boolean {
    try {
      const shares = this.getAllShareRecords()
      const filtered = shares.filter(share => share.id !== shareId)
      localStorage.setItem(this.SHARE_STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Erro ao deletar registro de compartilhamento:', error)
      return false
    }
  }

  /**
   * Adiciona email à lista de compartilhados
   */
  private addSharedEmail(tripId: string, email: string): void {
    try {
      const shares = this.getAllShareRecords()
      const share = shares.find(s => s.tripId === tripId)
      
      if (share) {
        if (!share.sharedWith) {
          share.sharedWith = []
        }
        if (!share.sharedWith.includes(email)) {
          share.sharedWith.push(email)
          localStorage.setItem(this.SHARE_STORAGE_KEY, JSON.stringify(shares))
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar email compartilhado:', error)
    }
  }

  /**
   * Rastreia compartilhamento para analytics
   */
  private trackShare(
    trip: Trip,
    permission: 'view' | 'edit',
    method: string = 'link'
  ): void {
    try {
      const eventData = {
        event: 'trip_shared',
        tripId: trip.id,
        destination: trip.destination,
        permission,
        method,
        timestamp: new Date().toISOString(),
      }

      // Integração com Sentry (se disponível)
      if ((window as any).__SENTRY__) {
        (window as any).__SENTRY__.captureMessage(
          `Trip shared: ${trip.destination}`,
          'info'
        )
      }

      console.log('Share tracked:', eventData)
    } catch (error) {
      console.error('Erro ao rastrear compartilhamento:', error)
    }
  }
}

// Singleton instance
export const sharingService = new SharingService()
