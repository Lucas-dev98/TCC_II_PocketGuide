import { auth } from './firebase'
import type { Trip } from '../types'
import type { ItineraryItem } from './itineraryGenerator'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.trim() || ''
const BACKEND_REQUIRED = import.meta.env.PROD
const BACKEND_ENABLED_FLAG = String(import.meta.env.VITE_USE_BACKEND_API || '').toLowerCase()
const REQUEST_TIMEOUT_MS = 12000
const ITINERARY_REQUEST_TIMEOUT_MS = 70000

const parseEnvBoolean = (value: string): boolean => {
  return value === '1' || value === 'true' || value === 'yes' || value === 'on'
}

const isBackendEnabledByConfig = (): boolean => {
  // In production, backend remains enabled whenever URL exists.
  if (import.meta.env.PROD) {
    return Boolean(BACKEND_URL)
  }

  // In development, only enable backend when explicitly requested.
  return Boolean(BACKEND_URL) && parseEnvBoolean(BACKEND_ENABLED_FLAG)
}

interface ItineraryGeneratePayload {
  destination: string
  days: number
  tags: string[]
  budget: string
  language: string
  groupType: string
  season?: string
  tripScope?: string
  async?: boolean
}

interface ItineraryGenerateResponse {
  items: ItineraryItem[]
  queued?: boolean
  jobId?: string
}

export interface BackendHealthResponse {
  status: string
  app?: string
  env?: string
  services?: {
    cache?: boolean
    firebaseAuth?: boolean
  }
  time?: string
}

export interface ItineraryJobStatusResponse {
  jobId: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  error?: string
  result?: {
    items: ItineraryItem[]
    provider: string
    generatedAt: string
  }
  updatedAt: string
}

type RetryOptions = {
  retries?: number
  retryDelayMs?: number
  timeoutMs?: number
}

export class ApiRequestError extends Error {
  status?: number
  code: 'network' | 'timeout' | 'http' | 'config'

  constructor(message: string, code: 'network' | 'timeout' | 'http' | 'config', status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await auth?.currentUser?.getIdToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const toFriendlyHttpMessage = (status: number, fallback: string): string => {
  if (status === 401) return 'Sessão inválida. Faça login novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status === 429) return 'Muitas requisições. Tente novamente em instantes.'
  if (status >= 500) return 'Servidor indisponível no momento. Tente novamente.'
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}, retryOptions: RetryOptions = {}): Promise<T> {
  if (!BACKEND_URL) {
    throw new ApiRequestError('Backend URL não configurada.', 'config')
  }

  const retries = retryOptions.retries ?? 0
  const retryDelayMs = retryOptions.retryDelayMs ?? 350
  const timeoutMs = retryOptions.timeoutMs ?? REQUEST_TIMEOUT_MS

  const authHeader = await getAuthHeader()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...(init.headers as Record<string, string> | undefined),
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(`${BACKEND_URL}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      })

      if (!response.ok) {
        let message = `HTTP ${response.status}`
        try {
          const payload = await response.json()
          if (payload?.message) message = payload.message
        } catch {
          // noop
        }

        throw new ApiRequestError(
          toFriendlyHttpMessage(response.status, message),
          'http',
          response.status
        )
      }

      if (response.status === 204) {
        return {} as T
      }

      return response.json() as Promise<T>
    } catch (error) {
      const canRetry = attempt < retries

      if (error instanceof ApiRequestError) {
        // Retry only server-side failures.
        if (canRetry && (error.status || 0) >= 500) {
          await sleep(retryDelayMs * (attempt + 1))
          continue
        }
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        if (canRetry) {
          await sleep(retryDelayMs * (attempt + 1))
          continue
        }
        throw new ApiRequestError('Tempo de conexão esgotado com o backend.', 'timeout')
      }

      if (error instanceof TypeError) {
        if (canRetry) {
          await sleep(retryDelayMs * (attempt + 1))
          continue
        }
        throw new ApiRequestError('Não foi possível conectar ao backend local.', 'network')
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new ApiRequestError('Falha ao processar requisição de backend.', 'network')
}

export const isBackendApiEnabled = (): boolean => isBackendEnabledByConfig()

export const isBackendRequired = (): boolean => BACKEND_REQUIRED

export const getBackendBaseUrl = (): string => BACKEND_URL

export const mapBackendErrorToUserMessage = (error: unknown): string => {
  if (error instanceof ApiRequestError) {
    return error.message
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('failed to fetch')) {
      return 'Backend indisponível. Verifique se a API está ativa em http://127.0.0.1:8080.'
    }
    return error.message
  }

  return 'Erro inesperado ao comunicar com o backend.'
}

export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  return request<BackendHealthResponse>('/health', { method: 'GET' }, { retries: 1, retryDelayMs: 300 })
}

export async function listTripsFromBackend(): Promise<Trip[]> {
  const payload = await request<{ items: Trip[] }>('/api/v1/trips', { method: 'GET' }, { retries: 2, retryDelayMs: 350 })
  return payload.items || []
}

export async function createTripInBackend(tripData: Partial<Trip>): Promise<Trip> {
  const payload = {
    ...tripData,
    budget: tripData.budget ?? tripData.budgetPerDay,
  }

  return request<Trip>('/api/v1/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTripInBackend(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
  const payload = {
    ...tripData,
    budget: tripData.budget ?? tripData.budgetPerDay,
  }

  return request<Trip>(`/api/v1/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteTripInBackend(tripId: string): Promise<void> {
  await request(`/api/v1/trips/${tripId}`, { method: 'DELETE' })
}

export async function generateItineraryInBackend(payload: ItineraryGeneratePayload): Promise<ItineraryItem[]> {
  const result = await request<ItineraryGenerateResponse>('/api/v1/itineraries/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, { retries: 1, retryDelayMs: 500, timeoutMs: ITINERARY_REQUEST_TIMEOUT_MS })

  return result.items || []
}

export async function generateItineraryJobInBackend(payload: ItineraryGeneratePayload): Promise<ItineraryGenerateResponse> {
  return request<ItineraryGenerateResponse>('/api/v1/itineraries/generate', {
    method: 'POST',
    body: JSON.stringify({ ...payload, async: true }),
  }, { retries: 1, retryDelayMs: 500, timeoutMs: ITINERARY_REQUEST_TIMEOUT_MS })
}

export async function getItineraryJobStatus(jobId: string): Promise<ItineraryJobStatusResponse> {
  return request<ItineraryJobStatusResponse>(`/api/v1/itineraries/jobs/${jobId}`, {
    method: 'GET',
  }, { retries: 2, retryDelayMs: 500 })
}
