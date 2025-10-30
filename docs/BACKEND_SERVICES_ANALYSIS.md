# 🔌 ANÁLISE BACKEND/SERVIÇOS - APIs & Integrações

**Data**: 30 de Outubro, 2025  
**Status**: ✅ Análise Detalhada  
**Foco**: Firebase, Gemini AI, Mapbox, error handling, retry logic, API patterns

---

## 📊 Sumário Executivo

Os serviços são bem estruturados com bom error handling e retry logic. Há integração robusta com múltiplas APIs (Firebase, Gemini, Mapbox, Unsplash). Algumas oportunidades para melhorar tolerância a falhas.

**Nota Geral**: 7.5/10 - Bem implementado, alguns pontos de risco

---

## 🔥 Firebase Integration

### ✅ Firebase Service (firebase.ts - 166 linhas)

```typescript
// src/services/firebase.ts
// ✅ Avaliação: 8.5/10

// Pontos Fortes:
// 1. Config validation na inicialização
export const validateFirebaseConfig = (): boolean => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key])
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase config keys:', missingKeys)
    return false
  }
  
  console.info('✅ Firebase config validated successfully')
  return true
}

// 2. Error Mapping bem estruturado
export const handleFirestoreError = (error: unknown): string => {
  const errorMap: Record<string, string> = {
    'permission-denied': 'Você não tem permissão para acessar isso.',
    'not-found': 'Documento não encontrado.',
    'already-exists': 'Este documento já existe.',
    'resource-exhausted': 'Limite de requisições excedido.',
    'unavailable': 'Serviço indisponível no momento.',
  }
  return errorMap[fbError.code] || fbError.message || 'Erro ao acessar dados'
}

// 3. Auth Error Handling
export const handleAuthError = (error: unknown): string => {
  const errorMap: Record<string, string> = {
    'auth/popup-blocked': 'Pop-up foi bloqueado. Permita pop-ups.',
    'auth/popup-closed-by-user': 'Pop-up foi fechado.',
    'auth/invalid-credential': 'Email ou senha inválidos.',
  }
  // ... com fallback inteligente
}

// ⚠️ Melhorias Recomendadas:
// - Adicionar rate limiting detection
// - Implementar circuit breaker
// - Adicionar retry para erros transientes
// - Documentar security rules
```

### ✅ Firebase Auth Context

```typescript
// src/contexts/AuthContext.tsx
// ✅ Avaliação: 8/10

// Pontos Fortes:
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    // 1. Session Recovery
    const recoverSession = async () => {
      try {
        const storedUser = tokenStorage.getStoredUser()
        
        if (storedUser && tokenStorage.hasValidSession()) {
          debug.log('Sessão encontrada no localStorage, revalidando...')
        }
      } catch (err) {
        debug.error('Erro ao recuperar sessão:', err)
      }
    }
    
    recoverSession()
    
    // 2. Auth State Monitoring
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      
      if (currentUser) {
        // Salva token
        const idToken = currentUser.getIdToken()
        idToken.then((token) => {
          tokenStorage.saveToken(token)
          tokenStorage.saveUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          })
        })
      } else {
        tokenStorage.clearToken()
      }
    })
    
    return unsubscribe
  }, [])
}

// ⚠️ Observações:
// ✅ Session persistence implementado
// ✅ Token refresh automático
// ⚠️ Token expiration não documentado
// ⚠️ Sem logout timeout automático
```

### Firestore Store Integration

```typescript
// src/store/tripsStore.ts
// ✅ Avaliação: 8/10

export const useTripsStore = create<TripsStoreState>((set) => ({
  trips: [],
  isLoading: false,
  error: null,

  loadTrips: async (userId: string) => {
    try {
      set({ isLoading: true, error: null })
      
      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId)
      )
      
      const snapshot = await getDocs(q)
      const trips: Trip[] = []
      
      snapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data(),
        } as Trip)
      })
      
      set({ trips })
    } catch (error) {
      set({
        error: error instanceof Error 
          ? error.message 
          : 'Erro ao carregar viagens',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  addTrip: async (tripData) => {
    try {
      set({ isLoading: true, error: null })
      
      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      
      return docRef.id
    } catch (error) {
      set({ error: handleFirestoreError(error) })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  deleteTrip: async (tripId: string) => {
    try {
      set({ isLoading: true })
      await deleteDoc(doc(db, 'trips', tripId))
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
      }))
    } catch (error) {
      set({ error: handleFirestoreError(error) })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// ✅ Pontos Fortes:
// - Error handling estruturado
// - Loading state management
// - TypeScript type safety
// - Firestore transactions bien implementadas

// ⚠️ Oportunidades:
// - Sem cache local strategy
// - Sem offline support documentado
// - Sem pagination para listas grandes
```

---

## 🤖 Gemini AI Integration

### Gemini Itinerary Service (geminiItinerary.ts - 456 linhas)

```typescript
// src/services/geminiItinerary.ts
// ⚠️ Avaliação: 7/10

// Estrutura:
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Tipos bem definidos:
export interface ItineraryItem {
  day: number
  time: string
  name: string
  duration: number
  reason: string
  tip: string
  location?: Location
  category: string
}

export interface GeneratedItinerary {
  destination: string
  days: number
  itinerary: ItineraryItem[]
  tips: string[]
}

// Pontos Fortes:
// 1. Multi-language support
import { generateItineraryPrompt, getSystemInstruction, LanguageCode } from "./promptTranslator"

// 2. Robust JSON parsing
const parseGeminiResponse = (textContent: string): any => {
  try {
    return JSON.parse(textContent)
  } catch (parseError) {
    // Fallback para markdown extraction
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    
    // Auto-fix truncated JSON
    const openBraces = (jsonString.match(/{/g) || []).length
    const closeBraces = (jsonString.match(/}/g) || []).length
    // ... adicionar braces faltantes
  }
}

// 3. Default coordinates para fallback
const getDefaultCoordinates = (destination: string) => {
  const defaultCoords: Record<string, { lat: number; lng: number }> = {
    'paris': { lat: 48.8566, lng: 2.3522 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    // ... mais
  }
}

// ⚠️ Riscos Identificados:
// 1. SEM TIMEOUT explícito
//    Problema: Chamada pode ficar pendurada indefinidamente
//    Solução: Adicionar AbortSignal.timeout(30000)

// 2. SEM RATE LIMITING documentado
//    Problema: Pode exceder quota do Gemini
//    Solução: Implementar queue ou rate limiter

// 3. API KEY em frontend
//    Problema: 🔴 CRÍTICO - chave exposta no bundle
//    Solução: Move para backend proxy

// 4. SEM CIRCUIT BREAKER
//    Problema: Falhas repetidas não são tratadas
//    Solução: Implementar padrão circuit breaker
```

### Recomendação: Adicionar Timeout

```typescript
// ❌ Problema atual
const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload }),
})

// ✅ Solução
const response = await fetch(GEMINI_API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...payload }),
  signal: AbortSignal.timeout(30000), // 30 segundo timeout
})
```

---

## 🗺️ Mapbox Geocoding Integration

### ✅ Mapbox Service (mapboxGeocoding.ts - 210 linhas)

```typescript
// src/services/mapboxGeocoding.ts
// ✅ Avaliação: 8.5/10 (Recently Fixed!)

// Excelentes Features:

// 1. Caching System
const cache = new Map<string, CitySuggestion[]>()

export async function searchCities(query: string, language = 'en') {
  // Cache hit
  if (cache.has(query)) {
    console.log('✅ Cache hit:', query)
    return cache.get(query)!
  }
  
  // Cache miss - fetch novo
  // ...
}

// 2. Fallback Chain (Production-Grade!)
// Priority:
// 1. Cache (fast)
// 2. Local Database (276 cidades pré-carregadas)
// 3. Mapbox API (5s timeout)
// 4. Empty array (graceful)

export async function searchCities(query: string) {
  // Try cache
  if (cache.has(query)) return cache.get(query)!
  
  // Try local DB
  const localResults = searchLocalCitiesDatabase(query)
  if (localResults.length > 0) {
    cache.set(query, localResults)
    return localResults
  }
  
  // Try Mapbox API
  try {
    const response = await fetch(..., {
      signal: AbortSignal.timeout(5000), // 5 segundo timeout ✅
    })
    const results = await response.json()
    cache.set(query, results)
    return results
  } catch (error) {
    // Fallback vazio (graceful degradation) ✅
    return []
  }
}

// 3. Recently Fixed Interface (30/10/2025)
interface GeocodeResult {
  id: string
  text_pt?: string       // ← ADICIONADO - Portuguese
  text?: string          // ← ADICIONADO - English
  center: [number, number]
  context?: Array<{ id: string; text_pt?: string }>
}

// Antes retornava erro porque accessing .name (não existia)
// Agora: Tenta text_pt → text → fallback

const city = result.text_pt || result.text || 'Unknown'

// 4. Coordinate Extraction with Fallback
const coordinates = result.center || [0, 0]

// ✅ Pontos Fortes:
// - Cache implementado
// - Timeout configurado (5s)
// - Fallback chain robusta
// - Local DB para offline
// - Recently fixed interface issues

// ⚠️ Oportunidades:
// - Sem cache persistence (reseta ao reloadar)
// - Sem analytics de hit rate
// - Sem cleanup de cache grande
```

---

## 🔄 Retry Service - Exponential Backoff

### ✅ Retry Service (retryService.ts - 207 linhas)

```typescript
// src/utils/retryService.ts
// ✅ Avaliação: 8.5/10

// Excelente implementação de retry logic!

interface RetryOptions {
  maxRetries?: number            // Default: 3
  baseDelayMs?: number           // Default: 1000ms
  maxDelayMs?: number            // Default: 32000ms
  multiplier?: number            // Default: 2 (exponential)
  jitterFactor?: number          // Default: 0.1 (10% jitter)
  onRetry?: (attempt, delay) => void
  shouldRetry?: (error, attempt) => boolean
}

// Cálculo de delay com exponential backoff:
function calculateDelay(attempt: number, options: RetryOptions): number {
  // Base delay * multiplier^(attempt-1)
  const exponentialDelay = options.baseDelayMs! * Math.pow(options.multiplier!, attempt - 1)
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs!)
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * options.jitterFactor! * Math.random()
  
  return Math.floor(cappedDelay + jitter)
}

// Retry-able error detection:
function isRetryableError(error: any): boolean {
  // Network errors ✅
  if (error?.message?.includes("Network")) return true
  
  // Timeout errors ✅
  if (error?.message?.includes("timeout")) return true
  
  // 5xx server errors ✅
  if (error?.status && error.status >= 500) return true
  
  // 429 Rate limiting ✅
  if (error?.status === 429) return true
  
  // Connection refused ✅
  if (error?.code === "ECONNREFUSED") return true
  
  return false
}

// Main retry function:
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: any
  
  for (let attempt = 1; attempt <= opts.maxRetries!; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      const shouldRetry = opts.shouldRetry 
        ? opts.shouldRetry(error, attempt)
        : isRetryableError(error)
      
      if (!shouldRetry || attempt === opts.maxRetries) {
        throw error
      }
      
      const delay = calculateDelay(attempt, opts)
      
      // Callback para logging
      opts.onRetry?.(attempt, delay, error)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// ✅ Pontos Fortes:
// - Exponential backoff bem implementado
// - Jitter para evitar thundering herd
// - Customizável por erro
// - Logging via callback
// - Well-documented

// ⚠️ Oportunidades:
// - Poderia ter circuit breaker integrado
// - Sem métricas de retry (hit rate, avg delay)
// - Sem timeout global (apenas para Mapbox)
```

---

## 📊 API Integration Patterns

### Error Handling Pattern

```typescript
// Pattern bem consistente:

// ✅ Firebase Pattern
try {
  await operation()
} catch (error) {
  const message = handleFirestoreError(error)
  logger.error('Firestore error', { error, message })
  throw new AppError(message)
} finally {
  set({ isLoading: false })
}

// ✅ Gemini Pattern
try {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  return parseGeminiResponse(data)
} catch (error) {
  console.error('Gemini error:', error)
  return getFallbackItinerary()
}

// ✅ Mapbox Pattern
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  return await response.json()
} catch (error) {
  console.warn('Mapbox error:', error)
  return localDatabase.search(query) // Fallback
}

// ✅ Avaliação: 8/10
// Pontos Fortes:
// - Error mapping estruturado
// - Graceful fallbacks
// - Logging presente
// - Type safety

// Oportunidades:
// - Centralizar em camada (service interceptor)
// - Adicionar circuit breaker
// - Adicionar rate limiting
// - Adicionar trace IDs para debugging
```

---

## 🔌 Service Composition

### 🟢 Bom Padrão: Service Abstraction

```
services/
├── firebase.ts              ← Firebase Auth + Firestore
├── geminiItinerary.ts       ← Gemini AI
├── mapboxGeocoding.ts       ← Mapbox Geocoding
├── photoService.ts          ← Unsplash
├── pdfService.ts            ← PDF generation
├── sharingService.ts        ← Trip sharing
├── offlineSyncService.ts    ← Offline queue
└── sentryService.ts         ← Error tracking
```

Cada service:
- ✅ Responsabilidade única
- ✅ Error handling próprio
- ✅ Type-safe exports
- ✅ Fácil de mockar nos testes

---

## 🚨 Security Review - Backend

### 🔴 CRÍTICO: API Keys in Frontend

```typescript
// ❌ PROBLEMA
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Exposto no bundle! Qualquer um pode:
// - Usar suas APIs
// - Consumir sua quota
// - Gerar cobranças

// ✅ SOLUÇÃO: Backend Proxy
// Frontend:
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  body: JSON.stringify(payload),
})

// Backend (Node.js):
app.post('/api/gemini/generate', async (req, res) => {
  const payload = req.body
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
  })
  res.json(await response.json())
})
```

### 🟡 Rate Limiting - Não Documentado

```typescript
// ⚠️ Risco: Sem proteção contra abuse
// - Quantas requisições por usuário?
// - Quanto de custo por mês?
// - O que faz se quota exceder?

// ✅ Implementar:
// 1. Rate limiter por usuário ID
// 2. Quota tracking
// 3. Cost estimation
// 4. Alerts se proximar do limite
```

---

## 📊 Métricas de Integração

| Serviço | Status | Retry | Timeout | Fallback | Cache | Score |
|---------|--------|-------|---------|----------|-------|-------|
| **Firebase** | ✅ | 🟡 | ✅ | 🟡 | ✅ | 8/10 |
| **Gemini** | ✅ | ✅ | 🔴 | ✅ | ❌ | 7/10 |
| **Mapbox** | ✅ | 🟡 | ✅ | ✅ | ✅ | 8.5/10 |
| **Unsplash** | ✅ | ❌ | ❌ | ✅ | 🟡 | 6.5/10 |
| **Sentry** | ✅ | 🟡 | ❌ | ✅ | ❌ | 7/10 |

---

## 🎯 Recommendations Priority

### Priority 1: CRÍTICO
- [ ] Move API keys to backend proxy
- [ ] Add timeout to Gemini calls
- [ ] Implement rate limiting
- [ ] Document Firebase security rules

### Priority 2: IMPORTANT
- [ ] Add circuit breaker pattern
- [ ] Implement cache persistence
- [ ] Add retry to Unsplash
- [ ] Add trace IDs for debugging

### Priority 3: NICE-TO-HAVE
- [ ] Analytics de hit rate
- [ ] Cost estimation
- [ ] Performance metrics
- [ ] A/B testing different prompts

---

## 🏆 Conclusão

**Backend/Serviços: 7.5/10** ⚠️

Os serviços são bem estruturados com boas práticas de error handling e retry logic. Integração é robusta com fallback chains.

**Pontos Fortes**:
- ✅ Error handling bem estruturado
- ✅ Retry logic com exponential backoff
- ✅ Cache implementado (Mapbox)
- ✅ Fallback chains robustas
- ✅ Multi-API integration

**Riscos Críticos**:
- 🔴 API keys exposed in frontend
- 🔴 No timeout em Gemini
- 🔴 Rate limiting não documentado

**Oportunidades**:
- 🟡 Circuit breaker pattern
- 🟡 Cache persistence
- 🟡 Trace IDs para debugging
- 🟡 Cost tracking

**Próxima Análise**: UX/UI & Design
