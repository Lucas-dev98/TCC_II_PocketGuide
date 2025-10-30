# 🎯 ACTION ITEMS - Senior Team Review Findings

**Data**: 30 de Outubro, 2025  
**Baseado em**: SENIOR_TEAM_ANALYSIS.md  
**Status**: Pronto para Execução  

---

## 🚨 CRÍTICO - Executar Imediatamente

### 1️⃣ Security: API Keys Exposure

**Status**: 🔴 BLOQUEADOR  
**Impacto**: Alto  
**Esforço**: Médio (2-3 dias)

#### Problema
```
VITE_MAPBOX_TOKEN=pk_...        ❌ Exposto no bundle
VITE_GEMINI_API_KEY=...         ❌ Exposto no bundle  
VITE_UNSPLASH_API_KEY=...       ❌ Exposto no bundle
```

#### Solução
Criar Backend Proxy (Node.js com Express)

```typescript
// backend/routes/api.ts
import express from 'express'

const router = express.Router()

// Proxy para Mapbox
router.post('/mapbox/geocode', async (req, res) => {
  const { query } = req.body
  
  // Backend faz chamada com chave privada
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${process.env.MAPBOX_TOKEN}`
  )
  
  const data = await response.json()
  res.json(data)
})

// Proxy para Gemini
router.post('/gemini/generate', async (req, res) => {
  const { prompt } = req.body
  
  // Rate limit check aqui
  if (!rateLimiter.isAllowed(req.user.id)) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
  })
  
  res.json(await response.json())
})

export default router
```

**Frontend depois de proxy implementado**:
```typescript
// src/services/mapboxGeocoding.ts
export async function searchCities(query: string) {
  // Antes: usava VITE_MAPBOX_TOKEN diretamente (RUIM)
  // Depois: chamada ao backend
  const response = await fetch('/api/mapbox/geocode', {
    method: 'POST',
    body: JSON.stringify({ query })
  })
  return response.json()
}
```

**Checklist**:
- [ ] Criar novo projeto Node.js/Express
- [ ] Implementar rotas proxy para Mapbox, Gemini, Unsplash
- [ ] Rate limiting implementado
- [ ] CORS configurado corretamente
- [ ] Auth token middleware (verificar user)
- [ ] Deploy em mesmo domínio ou configurar CORS
- [ ] Atualizar VITE_* env para apontar ao backend proxy
- [ ] Testes de segurança (verificar não retorna API key)

**Timeline**: 2-3 dias

---

### 2️⃣ Testing Framework Setup

**Status**: 🔴 ZERO COVERAGE  
**Impacto**: Crítico  
**Esforço**: Alto (3-4 dias)

#### Problema
Nenhum arquivo de teste encontrado - risco altíssimo de regressões

#### Solução - Implementação Faseada

**Fase 1: Setup & Utilities (1 dia)**

```bash
# Vitest já está instalado!
npm run test --help

# Criar estrutura de testes
mkdir -p src/__tests__/{unit,integration,components}

# Criar test utilities
# src/__tests__/setup.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Firebase
vi.mock('@/services/firebase', () => ({
  auth: {},
  db: {},
  handleFirestoreError: vi.fn(),
}))
```

**Fase 2: Services Tests (1 dia)**

```typescript
// src/services/__tests__/mapboxGeocoding.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchCities } from '../mapboxGeocoding'

describe('searchCities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return city suggestions for valid query', async () => {
    const results = await searchCities('São Paulo')
    
    expect(results).toHaveLength(expect.any(Number))
    expect(results[0]).toHaveProperty('city')
    expect(results[0]).toHaveProperty('country')
    expect(results[0]).toHaveProperty('coordinates')
  })

  it('should handle API errors gracefully', async () => {
    // Mock error
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API down'))
    
    const results = await searchCities('Invalid')
    
    // Should fallback to local DB
    expect(results).toBeDefined()
  })

  it('should use cache for repeated queries', async () => {
    const query = 'Rio'
    
    await searchCities(query)
    const fetchBefore = vi.fn(global.fetch)
    
    await searchCities(query)
    // Cache hit - não chama API
    
    expect(fetchBefore).not.toHaveBeenCalled()
  })
})
```

**Fase 3: Component Tests (1 dia)**

```typescript
// src/components/__tests__/CityAutocomplete.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CityAutocomplete } from '../CityAutocomplete'
import { describe, it, expect, vi } from 'vitest'

describe('CityAutocomplete', () => {
  it('should show suggestions on focus', async () => {
    const onSelect = vi.fn()
    render(
      <CityAutocomplete 
        value="" 
        onCitySelect={onSelect}
        placeholder="Buscar cidade..."
      />
    )
    
    const input = screen.getByPlaceholderText('Buscar cidade...')
    
    await userEvent.click(input)
    await userEvent.type(input, 'São')
    
    await waitFor(() => {
      expect(screen.getByText(/São Paulo/)).toBeInTheDocument()
    })
  })

  it('should select city on click', async () => {
    const onSelect = vi.fn()
    render(
      <CityAutocomplete 
        value="" 
        onCitySelect={onSelect}
      />
    )
    
    // ... search for São Paulo
    
    await userEvent.click(screen.getByText('São Paulo'))
    
    expect(onSelect).toHaveBeenCalledWith('São Paulo', 'Brasil', expect.any(Array))
  })
})
```

**Fase 4: Integration Tests (1 dia)**

```typescript
// src/__tests__/integration/createTrip.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTripScreen } from '@/screens/CreateTripScreen'
import { vi } from 'vitest'

describe('Create Trip Flow', () => {
  it('should create trip end-to-end', async () => {
    // Mock services
    vi.mock('@/services/itineraryGenerator')
    vi.mock('@/store/tripsStore')
    
    render(<CreateTripScreen />)
    
    // Step 1: Destination
    await userEvent.type(screen.getByPlaceholderText(/cidade/i), 'Rio')
    await userEvent.click(screen.getByText('Rio de Janeiro'))
    await userEvent.click(screen.getByRole('button', { name: /próximo/i }))
    
    // Step 2: Dates
    // ... fill dates
    
    // Step 3: Interests
    // ... select interests
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: /criar/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
    })
  })
})
```

**package.json Scripts**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage --reporter=text",
    "test:watch": "vitest --watch"
  }
}
```

**Checklist**:
- [ ] Setup Vitest com React Testing Library
- [ ] Escrever testes para mapboxGeocoding.ts (90%+ coverage)
- [ ] Escrever testes para itineraryGenerator.ts
- [ ] Escrever testes para CityAutocomplete component
- [ ] Escrever testes para CreateTripScreen (integration)
- [ ] Adicionar coverage reporter
- [ ] CI/CD com testes obrigatórios
- [ ] Target: 70%+ coverage total

**Timeline**: 3-4 dias

---

### 3️⃣ Validation & Error Handling

**Status**: 🟠 FRACO  
**Impacto**: Alto  
**Esforço**: Médio (2 dias)

#### Problema
Validação manual espalhada pelo código

```typescript
// ❌ Em CreateTripScreen.tsx
const validateStep = () => {
  if (step === 1) {
    if (!formData.destination || !formData.country) {
      showError(t('validation.destinationRequired'))
      return false
    }
    if (formData.startDate > formData.endDate) {
      showError(t('validation.invalidDates'))
      return false
    }
  }
  // ... mais ifs
}
```

#### Solução: Zod + react-hook-form

```typescript
// src/schemas/trip.ts
import { z } from 'zod'

export const CreateTripSchema = z.object({
  destination: z
    .string()
    .min(1, 'destination_required')
    .max(100, 'destination_too_long'),
  
  country: z
    .string()
    .min(1, 'country_required'),
  
  startDate: z
    .date()
    .min(new Date(), 'start_date_cannot_be_past'),
  
  endDate: z
    .date(),
  
  budget: z
    .enum(['econômico', 'médio', 'luxo']),
  
  interests: z
    .array(z.string())
    .min(1, 'interests_required')
    .max(5, 'interests_max_5'),
  
  description: z
    .string()
    .max(500, 'description_too_long')
    .optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'end_date_must_be_after_start',
  path: ['endDate'],
})

export type CreateTripInput = z.infer<typeof CreateTripSchema>
```

```typescript
// src/screens/CreateTripScreen.tsx - Novo
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateTripSchema, type CreateTripInput } from '@/schemas/trip'

export default function CreateTripScreen() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTripInput>({
    resolver: zodResolver(CreateTripSchema),
  })

  const onSubmit = async (data: CreateTripInput) => {
    // data é type-safe e validado
    await createTrip(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('destination')} />
      {errors.destination && (
        <span className="error">
          {t(`validation.${errors.destination.message}`)}
        </span>
      )}
      
      {/* ... */}
    </form>
  )
}
```

**Checklist**:
- [ ] Criar schemas para todas as forms (Trip, Search, Settings)
- [ ] Integrar react-hook-form
- [ ] Atualizar componentes Form a usar schema
- [ ] Remover validação manual
- [ ] Testes para schemas
- [ ] Documentar schema validation patterns

**Timeline**: 2 dias

---

## 🔶 ALTO - Primeira Sprint (Semana 1-2)

### 4️⃣ Accessibility Audit & Fixes

**Status**: 🟡 PARCIAL  
**Impacto**: Médio  
**Esforço**: Alto (3-4 dias)

**Implementar**:

```typescript
// 1. ARIA Labels
<button aria-label="Abrir menu">
  <Menu size={24} />
</button>

// 2. Semantic HTML
// ❌ <div onClick={...}>
// ✅ <button>

// 3. Focus visible
@layer components {
  @apply focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none;
}

// 4. Skip links
<a href="#main-content" className="sr-only">
  Ir para conteúdo principal
</a>

// 5. Landmark regions
<nav aria-label="Navegação principal">
<main id="main-content">
<aside aria-label="Filtros">
```

**Teste**:
```bash
# Usar Lighthouse
# Usar axe DevTools
# Testar com screen reader (NVDA, JAWS)
```

**Checklist**:
- [ ] ARIA labels em todos ícones
- [ ] Semantic HTML review
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus visible styles
- [ ] Color contrast verification
- [ ] Screen reader testing
- [ ] Target: WCAG AA compliance

**Timeline**: 3-4 dias

---

### 5️⃣ Logging & Observability

**Status**: 🟡 DESORGANIZADO  
**Impacto**: Médio  
**Esforço**: Médio (2 dias)

#### Problema
```typescript
// Espalhado:
console.log('📚 tripsStore.loadTrips:')
debug.log('🏠 HomeScreen: Loading')
console.error('❌ Error')
```

#### Solução: Logger Centralizado

```typescript
// src/services/logger.ts
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: ISO8601;
  level: LogLevel;
  namespace: string;
  message: string;
  data?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export class Logger {
  private namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      namespace: this.namespace,
      message,
      data,
      userId: getCurrentUserId(),
      sessionId: getSessionId(),
    }

    // Console (dev)
    console[level.toLowerCase()](
      `[${entry.namespace}] ${message}`,
      data
    )

    // Sentry (prod)
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      captureMessage(message, level.toLowerCase() as SeverityLevel)
    }

    // Analytics
    logToAnalytics(entry)
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data)
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data)
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data)
  }

  error(message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...data,
    })
  }
}

export function createLogger(namespace: string) {
  return new Logger(namespace)
}
```

**Uso**:
```typescript
// src/store/tripsStore.ts
import { createLogger } from '@/services/logger'

const logger = createLogger('TripsStore')

export const useTripsStore = create<TripsStoreState>((set) => ({
  loadTrips: async (userId: string) => {
    logger.info('Loading trips', { userId })
    try {
      const trips = await fetchTrips(userId)
      logger.debug('Trips loaded', { count: trips.length })
      set({ trips })
    } catch (error) {
      logger.error('Failed to load trips', error as Error, { userId })
    }
  },
}))
```

**Checklist**:
- [ ] Criar Logger service
- [ ] Integrar com Sentry
- [ ] Substituir console.log por logger
- [ ] Structured logging em eventos críticos
- [ ] Dashboard para logs (Datadog/LogRocket)

**Timeline**: 2 dias

---

### 6️⃣ Firebase Security Rules Documentation

**Status**: 🔴 NÃO ENCONTRADO  
**Impacto**: Crítico  
**Esforço**: Baixo (1 dia)

**Criar**: `firestore.rules`

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Validate user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Validate user owns this resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && 
                       request.resource.data.size() > 0;
      allow update: if isOwner(userId);
      allow delete: if false; // Never delete (soft delete)
    }

    // Trips collection
    match /trips/{tripId} {
      allow read: if isAuthenticated() && 
                     isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       isOwner(request.resource.data.userId) &&
                       request.resource.data.destination != null &&
                       request.resource.data.startDate != null;
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId);

      // Subcollection: attractions
      match /attractions/{attractionId} {
        allow read: if isOwner(get(/databases/$(database)/documents/trips/$(tripId)).data.userId);
        allow write: if isOwner(get(/databases/$(database)/documents/trips/$(tripId)).data.userId);
      }
    }

    // Shared trips (read-only)
    match /sharedTrips/{shareId} {
      allow read: if true; // Public read
      allow write: if false;
    }

    // Catchall - deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Deploy**:
```bash
# Usar Firebase CLI
firebase deploy --only firestore:rules
```

**Checklist**:
- [ ] Escrever security rules
- [ ] Testar com Firebase emulator
- [ ] Document access patterns
- [ ] Review com security team
- [ ] Deploy via CI/CD

**Timeline**: 1 dia

---

## 🟡 MÉDIO - Segunda Sprint (Semana 3)

### 7️⃣ Performance Optimization

**Status**: 🟡 PODE MELHORAR  
**Impacto**: Médio  
**Esforço**: 2 dias

```typescript
// 1. React.memo para list items
const TripCard = React.memo(({ trip, onDelete }: Props) => {
  // Component só re-renderiza se props mudam
  return (...)
}, (prevProps, nextProps) => {
  return prevProps.trip.id === nextProps.trip.id
})

// 2. useMemo para computed values
const filteredTrips = useMemo(() => {
  return trips.filter(trip => trip.budget === selectedBudget)
}, [trips, selectedBudget])

// 3. useCallback para callbacks
const handleDelete = useCallback((tripId: string) => {
  deleteTrip(tripId)
}, [deleteTrip])

// 4. Image lazy loading
<img 
  src={imageUrl} 
  loading="lazy"
  alt="Trip"
/>

// 5. Code splitting (já feito!)
const CreateTripScreen = lazy(() => import('./screens/CreateTripScreen'))
```

**Benchmark**:
```bash
npm run build
# Analisar bundle
npm run preview
# Lighthouse em DevTools
```

---

### 8️⃣ Error Boundary Enhancement

**Status**: ✅ JÁ EXISTE  
**Impacto**: Médio  
**Esforço**: 1 dia

```typescript
// Já tem em App.tsx, mas melhorar componente
import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log para Sentry
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="font-bold text-red-900">Algo deu errado</h2>
          <p className="text-red-800">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.href = '/home'}
            className="mt-2 btn btn-primary"
          >
            Voltar ao início
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 📈 Cronograma Recomendado

```
Semana 1 (CRÍTICO):
├── Seg-Ter: API Keys -> Backend Proxy
├── Qua-Sex: Testes Setup + Unit Tests
└── Fim: Security Review Complete

Semana 2 (ALTO):
├── Seg-Ter: Validation Framework (Zod + react-hook-form)
├── Qua: Accessibility Audit
├── Thu-Fri: Logging & Error Handling
└── Fim: 70%+ Test Coverage

Semana 3 (MÉDIO):
├── Seg-Ter: Performance Optimization
├── Qua: WCAG AA Compliance
├── Thu: E2E Test Scenarios
└── Fri: Security Hardening
```

---

## ✅ Checklist Final

```
Before Production:
☐ API keys removed from bundle
☐ Backend proxy deployed
☐ 70%+ test coverage
☐ Firebase security rules deployed
☐ WCAG AA compliance verified
☐ Security audit completed
☐ Logging/observability in place
☐ Performance metrics baseline established
☐ CI/CD pipeline with tests
☐ Production secrets managed

Ready to Ship! 🚀
```

---

**Próximas Etapas**: Priorizar CRÍTICO por semana, em ordem de impacto
