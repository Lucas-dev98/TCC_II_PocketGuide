import * as tokenStorage from './tokenStorage'
import type { Trip } from '../types'
import type { ItineraryItem } from './itineraryGenerator'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.trim() || ''
const BACKEND_REQUIRED = true
const REQUEST_TIMEOUT_MS = 12000
const ITINERARY_REQUEST_TIMEOUT_MS = 70000

const isBackendEnabledByConfig = (): boolean => {
  return Boolean(BACKEND_URL)
}

interface ItineraryGeneratePayload {
  destination: string
  days: number
  tags: string[]
  budget: string
  budgetMinPerDay?: number
  budgetMaxPerDay?: number
  budgetCurrency?: string
  travelers?: number
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

type UnknownRecord = Record<string, unknown>

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

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const toIntOrDefault = (value: unknown, fallback: number): number => {
  const parsed = toNumberOrUndefined(value)
  return parsed === undefined ? fallback : Math.trunc(parsed)
}

const extractArraySegments = (text: string): string[] => {
  const segments: string[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === '\\') {
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '[') {
      if (depth === 0) start = i
      depth++
      continue
    }

    if (ch === ']') {
      depth--
      if (depth === 0 && start >= 0) {
        segments.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }

  return segments
}

const parseUnknownJson = (value: string): unknown => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const attempts = [
    trimmed,
    trimmed.replace(/""/g, '"'),
  ]

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate)
    } catch {
      // try next variant
    }
  }

  return null
}

const parseLegacyItineraryString = (value: string): unknown[] => {
  const parsed = parseUnknownJson(value)
  if (Array.isArray(parsed)) return parsed

  if (parsed && typeof parsed === 'object') {
    const obj = parsed as UnknownRecord
    if (Array.isArray(obj.items)) return obj.items
    if (Array.isArray(obj.itinerary)) return obj.itinerary
  }

  if (typeof parsed === 'string') {
    const nested = parseUnknownJson(parsed)
    if (Array.isArray(nested)) return nested
    if (nested && typeof nested === 'object') {
      const obj = nested as UnknownRecord
      if (Array.isArray(obj.items)) return obj.items
      if (Array.isArray(obj.itinerary)) return obj.itinerary
    }
  }

  const segments = extractArraySegments(value)
  if (segments.length === 0) return []

  const merged: unknown[] = []
  for (const segment of segments) {
    const segmentParsed = parseUnknownJson(segment)
    if (Array.isArray(segmentParsed)) merged.push(...segmentParsed)
  }

  return merged
}

const normalizeItineraryItem = (value: unknown): ItineraryItem | null => {
  if (!value || typeof value !== 'object') return null
  const raw = value as UnknownRecord

  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const time = typeof raw.time === 'string' ? raw.time.trim() : '09:00'
  if (!name) return null

  const locationRaw = raw.location && typeof raw.location === 'object' ? (raw.location as UnknownRecord) : null
  const lat = locationRaw ? toNumberOrUndefined(locationRaw.lat) : undefined
  const lng = locationRaw ? toNumberOrUndefined(locationRaw.lng) : undefined

  return {
    day: toIntOrDefault(raw.day, 1),
    time,
    name,
    duration: toIntOrDefault(raw.duration, 120),
    reason: typeof raw.reason === 'string' ? raw.reason : '',
    tip: typeof raw.tip === 'string' ? raw.tip : '',
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category : 'Exploration',
    location:
      lat !== undefined && lng !== undefined
        ? { lat, lng }
        : undefined,
  }
}

const normalizeItineraryPayload = (itinerary: unknown): ItineraryItem[] => {
  let source: unknown[] = []

  if (Array.isArray(itinerary)) {
    source = itinerary
  } else if (itinerary && typeof itinerary === 'object') {
    const obj = itinerary as UnknownRecord
    if (Array.isArray(obj.items)) source = obj.items
    else if (Array.isArray(obj.itinerary)) source = obj.itinerary
  } else if (typeof itinerary === 'string') {
    source = parseLegacyItineraryString(itinerary)
  }

  return source
    .map(normalizeItineraryItem)
    .filter((item): item is ItineraryItem => item !== null)
}

const normalizeTripItinerary = (trip: Trip): Trip => {
  return {
    ...trip,
    itinerary: normalizeItineraryPayload(trip.itinerary),
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = tokenStorage.getToken()
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
  return (payload.items || []).map(normalizeTripItinerary)
}

export async function createTripInBackend(tripData: Partial<Trip>): Promise<Trip> {
  const payload = {
    ...tripData,
    budget: tripData.budget ?? tripData.budgetPerDay,
    itinerary: normalizeItineraryPayload(tripData.itinerary),
  }

  const created = await request<Trip>('/api/v1/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return normalizeTripItinerary(created)
}

export async function updateTripInBackend(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
  const payload = {
    ...tripData,
    budget: tripData.budget ?? tripData.budgetPerDay,
    itinerary: normalizeItineraryPayload(tripData.itinerary),
  }

  const updated = await request<Trip>(`/api/v1/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return normalizeTripItinerary(updated)
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
