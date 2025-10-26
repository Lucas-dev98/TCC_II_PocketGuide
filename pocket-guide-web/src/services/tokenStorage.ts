/**
 * TokenStorage Service
 * 
 * Gerencia persistência de tokens de autenticação no localStorage
 * - Salva token após login
 * - Recupera token ao iniciar app
 * - Remove token ao fazer logout
 * - Valida expiração do token
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

interface StoredUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/**
 * Salva o token de autenticação no localStorage
 */
export const saveToken = (token: string, expiresIn: number = 3600): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    // Salva o tempo de expiração (em milisegundos)
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
  } catch (error) {
    console.error('Erro ao salvar token:', error)
  }
}

/**
 * Recupera o token do localStorage
 */
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    
    if (!token) return null
    
    // Verifica se token expirou
    if (isTokenExpired()) {
      clearToken()
      return null
    }
    
    return token
  } catch (error) {
    console.error('Erro ao recuperar token:', error)
    return null
  }
}

/**
 * Verifica se o token expirou
 */
export const isTokenExpired = (): boolean => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    
    if (!expiry) return true
    
    const expiryTime = parseInt(expiry, 10)
    return Date.now() > expiryTime
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error)
    return true
  }
}

/**
 * Salva dados do usuário no localStorage
 */
export const saveUser = (user: StoredUser): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error)
  }
}

/**
 * Recupera dados do usuário do localStorage
 */
export const getStoredUser = (): StoredUser | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY)
    
    if (!userJson) return null
    
    return JSON.parse(userJson) as StoredUser
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário:', error)
    return null
  }
}

/**
 * Remove token e dados do usuário do localStorage
 */
export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  } catch (error) {
    console.error('Erro ao limpar token:', error)
  }
}

/**
 * Verifica se existe uma sessão válida
 */
export const hasValidSession = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY)
  return token !== null && !isTokenExpired()
}

/**
 * Obtém informações da sessão
 */
export const getSessionInfo = () => {
  return {
    token: getToken(),
    user: getStoredUser(),
    isValid: hasValidSession(),
    expiresIn: getTokenExpiresIn(),
  }
}

/**
 * Retorna tempo até expiração em segundos
 */
export const getTokenExpiresIn = (): number => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    
    if (!expiry) return 0
    
    const expiryTime = parseInt(expiry, 10)
    const now = Date.now()
    
    if (now > expiryTime) return 0
    
    return Math.floor((expiryTime - now) / 1000)
  } catch (error) {
    console.error('Erro ao calcular expiração do token:', error)
    return 0
  }
}
