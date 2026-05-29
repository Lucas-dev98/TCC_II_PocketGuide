import * as tokenStorage from './tokenStorage'
import { getBackendBaseUrl } from './backendApi'

export interface AuthUser {
  id: string
  uid: string
  email: string
  name: string
  displayName: string
  createdAt?: string
  updatedAt?: string
}

interface AuthResponse {
  token: string
  expiresIn: number
  user: AuthUser
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

interface ForgotPasswordPayload {
  email: string
}

interface ResetPasswordPayload {
  token: string
  newPassword: string
}

interface ForgotPasswordResponse {
  message: string
  resetToken?: string
}

interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
}

const AUTH_TIMEOUT_MS = 12000

const authRequest = async <T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> => {
  const baseUrl = getBackendBaseUrl()
  if (!baseUrl) {
    throw new Error('Backend URL não configurada (VITE_BACKEND_URL).')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (authenticated) {
    const token = tokenStorage.getToken()
    if (!token) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS)

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const payload = await response.json()
        if (payload?.message) {
          message = payload.message
        }
      } catch {
        // ignore body parse errors
      }
      throw new Error(message)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json() as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
}

const persistSession = (payload: AuthResponse): AuthUser => {
  const normalizedUser: AuthUser = {
    ...payload.user,
    uid: payload.user.id,
    displayName: payload.user.name,
  }

  tokenStorage.saveToken(payload.token, payload.expiresIn)
  tokenStorage.saveUser({
    uid: normalizedUser.uid,
    email: normalizedUser.email,
    displayName: normalizedUser.displayName,
    photoURL: null,
  })
  return normalizedUser
}

export const registerUser = async (data: RegisterPayload): Promise<AuthUser> => {
  const payload = await authRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return persistSession(payload)
}

export const loginUser = async (data: LoginPayload): Promise<AuthUser> => {
  const payload = await authRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return persistSession(payload)
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const user = await authRequest<AuthResponse['user']>('/api/v1/auth/me', { method: 'GET' }, true)
  return {
    ...user,
    uid: user.id,
    displayName: user.name,
  }
}

export const updateCurrentUser = async (data: UpdateUserPayload): Promise<AuthUser> => {
  const user = await authRequest<AuthResponse['user']>('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true)

  return {
    ...user,
    uid: user.id,
    displayName: user.name,
  }
}

export const deleteCurrentUser = async (): Promise<void> => {
  await authRequest('/api/v1/users/me', { method: 'DELETE' }, true)
  tokenStorage.clearToken()
}

export const logoutUser = (): void => {
  tokenStorage.clearToken()
}

export const requestPasswordReset = async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
  return authRequest<ForgotPasswordResponse>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const resetPassword = async (data: ResetPasswordPayload): Promise<{ message: string }> => {
  return authRequest<{ message: string }>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
