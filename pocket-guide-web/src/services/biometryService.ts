/**
 * biometryService.ts - Serviço de autenticação biométrica
 * 
 * Funcionalidades:
 * - WebAuthn / FIDO2 authentication
 * - PIN fallback authentication
 * - Device credential management
 * - Secure local storage
 */

import { AuthUser } from '../types'

export interface BiometricCredential {
  id: string
  name: string
  type: 'fingerprint' | 'face' | 'pin'
  created: Date
  lastUsed?: Date
  publicKey?: string
}

export interface BiometricAuthResult {
  success: boolean
  user?: AuthUser
  method: 'fingerprint' | 'face' | 'pin'
  error?: string
}

class BiometryService {
  private readonly CREDENTIALS_KEY = 'biometric-credentials'
  private readonly PIN_KEY = 'biometric-pin'
  private readonly ATTEMPTS_KEY = 'pin-attempts'

  /**
   * Verifica se o dispositivo suporta WebAuthn
   */
  isWebAuthnAvailable(): boolean {
    return !!(window.PublicKeyCredential || window.navigator?.credentials)
  }

  /**
   * Verifica se o dispositivo suporta biometria
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      if (!this.isWebAuthnAvailable()) {
        return false
      }

      // Check for platform authenticator
      const available = await (window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.() ??
        Promise.resolve(false))

      return available
    } catch (error) {
      console.error('Erro ao verificar biometria:', error)
      return false
    }
  }

  /**
   * Registra credencial biométrica
   */
  async registerBiometric(_user: AuthUser, credentialName: string): Promise<boolean> {
    try {
      if (!this.isWebAuthnAvailable()) {
        throw new Error('WebAuthn não disponível neste dispositivo')
      }

      // Mock: Simula registro de credencial
      const credential: BiometricCredential = {
        id: `credential_${Date.now()}`,
        name: credentialName,
        type: 'fingerprint',
        created: new Date(),
      }

      // Salva credencial
      this.saveCredential(credential)

      // Log
      console.log(`Credencial biométrica registrada: ${credentialName}`)

      return true
    } catch (error) {
      console.error('Erro ao registrar biometria:', error)
      throw error
    }
  }

  /**
   * Autentica com biometria
   */
  async authenticateWithBiometric(user: AuthUser): Promise<BiometricAuthResult> {
    try {
      if (!this.isWebAuthnAvailable()) {
        return {
          success: false,
          method: 'fingerprint',
          error: 'WebAuthn não disponível',
        }
      }

      const credentials = this.getCredentials()

      if (credentials.length === 0) {
        return {
          success: false,
          method: 'fingerprint',
          error: 'Nenhuma credencial registrada',
        }
      }

      // Mock: Simula autenticação bem-sucedida
      // Em produção, isso seria uma chamada real ao WebAuthn
      const credential = credentials[0]
      credential.lastUsed = new Date()
      this.saveCredential(credential)

      return {
        success: true,
        user,
        method: credential.type as 'fingerprint' | 'face',
      }
    } catch (error) {
      console.error('Erro ao autenticar com biometria:', error)
      return {
        success: false,
        method: 'fingerprint',
        error: (error as Error).message,
      }
    }
  }

  /**
   * Autentica com PIN
   */
  async authenticateWithPIN(
    user: AuthUser,
    pin: string
  ): Promise<BiometricAuthResult> {
    try {
      // Verifica limite de tentativas
      const attempts = this.getAttempts()
      if (attempts >= 5) {
        return {
          success: false,
          method: 'pin',
          error: 'Muitas tentativas. Tente novamente mais tarde.',
        }
      }

      // Recupera PIN salvo (hash em produção)
      const savedPin = localStorage.getItem(this.PIN_KEY)

      // Valida PIN
      if (!savedPin || this.hashPin(pin) !== savedPin) {
        this.incrementAttempts()
        return {
          success: false,
          method: 'pin',
          error: 'PIN incorreto',
        }
      }

      // Reset tentativas
      localStorage.removeItem(this.ATTEMPTS_KEY)

      return {
        success: true,
        user,
        method: 'pin',
      }
    } catch (error) {
      console.error('Erro ao autenticar com PIN:', error)
      return {
        success: false,
        method: 'pin',
        error: (error as Error).message,
      }
    }
  }

  /**
   * Define PIN para autenticação
   */
  setupPIN(pin: string): boolean {
    try {
      // Validação
      if (!pin || pin.length < 4) {
        throw new Error('PIN deve ter no mínimo 4 dígitos')
      }

      if (!/^\d{4,6}$/.test(pin)) {
        throw new Error('PIN deve conter apenas números')
      }

      // Salva PIN (hash em produção)
      localStorage.setItem(this.PIN_KEY, this.hashPin(pin))

      console.log('PIN configurado com sucesso')
      return true
    } catch (error) {
      console.error('Erro ao configurar PIN:', error)
      return false
    }
  }

  /**
   * Verifica se PIN está configurado
   */
  isPINSetup(): boolean {
    return !!localStorage.getItem(this.PIN_KEY)
  }

  /**
   * Remove PIN
   */
  removePIN(): boolean {
    try {
      localStorage.removeItem(this.PIN_KEY)
      localStorage.removeItem(this.ATTEMPTS_KEY)
      console.log('PIN removido')
      return true
    } catch (error) {
      console.error('Erro ao remover PIN:', error)
      return false
    }
  }

  /**
   * Obtém lista de credenciais
   */
  getCredentials(): BiometricCredential[] {
    try {
      const data = localStorage.getItem(this.CREDENTIALS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erro ao obter credenciais:', error)
      return []
    }
  }

  /**
   * Remove credencial
   */
  removeCredential(credentialId: string): boolean {
    try {
      const credentials = this.getCredentials()
      const filtered = credentials.filter(c => c.id !== credentialId)
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Erro ao remover credencial:', error)
      return false
    }
  }

  /**
   * Limpa todas as credenciais
   */
  clearAllCredentials(): boolean {
    try {
      localStorage.removeItem(this.CREDENTIALS_KEY)
      return true
    } catch (error) {
      console.error('Erro ao limpar credenciais:', error)
      return false
    }
  }

  // ==================== Private Methods ====================

  /**
   * Salva credencial
   */
  private saveCredential(credential: BiometricCredential): void {
    try {
      const credentials = this.getCredentials()
      const existing = credentials.findIndex(c => c.id === credential.id)

      if (existing >= 0) {
        credentials[existing] = credential
      } else {
        credentials.push(credential)
      }

      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials))
    } catch (error) {
      console.error('Erro ao salvar credencial:', error)
    }
  }

  /**
   * Hash simples para PIN (em produção usar bcrypt ou similar)
   */
  private hashPin(pin: string): string {
    // Mock hash - em produção usar biblioteca criptográfica
    let hash = 0
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Converte para 32-bit
    }
    return `hash_${Math.abs(hash)}`
  }

  /**
   * Obtém tentativas de PIN
   */
  private getAttempts(): number {
    try {
      const data = localStorage.getItem(this.ATTEMPTS_KEY)
      if (!data) return 0

      const { count, timestamp } = JSON.parse(data)
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      // Reset se passou 5 minutos
      if (now - timestamp > fiveMinutes) {
        localStorage.removeItem(this.ATTEMPTS_KEY)
        return 0
      }

      return count
    } catch (error) {
      return 0
    }
  }

  /**
   * Incrementa tentativas
   */
  private incrementAttempts(): void {
    try {
      const current = this.getAttempts()
      localStorage.setItem(
        this.ATTEMPTS_KEY,
        JSON.stringify({
          count: current + 1,
          timestamp: Date.now(),
        })
      )
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error)
    }
  }
}

// Singleton instance
export const biometryService = new BiometryService()
