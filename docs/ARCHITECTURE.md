# 🏗️ ARQUITETURA - Visão Geral

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19.2.0 + TypeScript 5.6 |
| **Build** | Vite 5.x |
| **Styling** | Tailwind CSS 3.4 + Dark Mode |
| **Roteamento** | React Router v6 |
| **State Management** | Zustand |
| **Backend** | Firebase (Auth + Firestore) |
| **IA** | Google Gemini 2.0 Flash |
| **Mapas** | Mapbox GL v3.16.0 |
| **PWA** | Service Worker + Workbox |

---

## 📁 Estrutura de Pastas

### `/src/screens` - Telas Principais
```
screens/
├── LoginScreen.tsx          # Autenticação Google Sign-In
├── HomeScreen.tsx           # Lista de viagens do usuário
├── CreateTripScreen.tsx     # Criar nova viagem (multi-step form)
└── TripDetailScreen.tsx     # Detalhes da viagem + Mapa interativo
```

### `/src/components` - Componentes Reutilizáveis
```
components/
├── Button.tsx               # Botão customizado
├── Input.tsx                # Input customizado
├── Card.tsx                 # Card container
├── Badge.tsx                # Badge labels
├── LoadingSpinner.tsx       # Loading spinner
├── MapboxMap.tsx            # Mapa interativo com navegação
├── ProtectedRoute.tsx       # Route guard para autenticação
└── [outros...]
```

### `/src/services` - Integração com APIs
```
services/
├── firebase.ts              # Firebase init + Auth setup
├── geminiItinerary.ts       # API do Gemini para gerar itinerários
├── itineraryGenerator.ts    # Lógica de geração com fallback
├── retryService.ts          # Retry wrapper com exponential backoff
└── mapboxMap.ts             # Config do Mapbox
```

### `/src/store` - State Management
```
store/
└── tripsStore.ts            # Zustand store (trips, user, etc)
```

### `/src/types` - TypeScript Interfaces
```
types/
└── index.ts                 # Todas as interfaces TypeScript
```

### `/src/utils` - Funções Auxiliares
```
utils/
├── formatDate.ts            # Formatação de datas
└── [outros...]
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────┐
│         LoginScreen                             │
│    (Google Sign-In via Firebase)                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         HomeScreen                              │
│  (Carrega viagens do Firestore)                 │
│  useTripsStore() → loadTrips()                  │
└──────────────────┬──────────────────────────────┘
                   │
            ┌──────┴──────┐
            │             │
            ▼             ▼
   [Viagem Existe]  [Criar Nova]
        │                │
        ▼                ▼
  TripDetailScreen  CreateTripScreen
   (Exibir dados)   (Multi-step form)
        ▲                │
        │                ├─ Preencher: destino, datas, orçamento, interesses
        │                ├─ Gerar itinerário com Gemini AI
        │                ├─ Salvar no Firestore
        │                └─ Redirecionar
        │                   │
        └───────────────────┘
```

---

## 🔐 Autenticação

**Fluxo:**
1. Usuário clica em "Sign in with Google"
2. Firebase abre diálogo de login
3. Usuario autentica com Google
4. Firebase retorna `uid` e informações
5. App salva em estado (Zustand)
6. Redireciona para Home

**Código:**
```typescript
// services/firebase.ts
export const auth = initializeAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

---

## 🤖 Geração de Itinerários

**Fluxo:**
1. CreateTripScreen coleta dados (destino, dias, interesses, orçamento)
2. Chama `generateItinerary()` de `itineraryGenerator.ts`
3. Tenta Gemini API com retry
4. Fallback para itinerários predefinidos se Gemini falhar
5. Salva no Firestore
6. Transforma para formato de exibição
7. Exibe em TripDetailScreen

**Tecnologia:**
- Model: `gemini-2.0-flash`
- Tokens: `maxOutputTokens: 4096`
- Formato: JSON com 21+ atrações
- Retry: 3 tentativas com backoff exponencial

---

## 🗺️ Mapa Interativo

**MapboxMap.tsx:**
- Recebe array de atrações com `lat` e `lng`
- Cria marcadores azuis
- Seleciona marcador → marcador fica verde
- Botões próximo/anterior para navegar
- `flyTo()` com animação suave
- Fit bounds automático

**Coordenadas:**
```typescript
interface Attraction {
  name: string;
  reason: string;
  lat: number;
  lng: number;
}
```

---

## 💾 Persistência - Firebase

### Firestore Collections:
```
firestore/
├── users/{uid}/
│   └── metadata (último acesso, preferências)
└── trips/{tripId}/
    ├── destination: "Roma"
    ├── startDate: "2025-10-25"
    ├── endDate: "2025-11-01"
    ├── budget: "mid"
    ├── interests: ["🏛️ História", "🍕 Culinária"]
    ├── itinerary: { days: [...], tips: [...] }
    └── userId: "abc123"
```

### Regras Firestore:
- ✅ Usuário vê apenas suas viagens
- ✅ Não pode editar viagens de outros
- ✅ Pode deletar apenas suas viagens

---

## 🧪 Build & Deployment

### Desenvolvimento
```bash
npm run dev
# Vite dev server com hot reload
# http://localhost:5173
```

### Produção
```bash
npm run build
# Saída: dist/
# - Minificado
- TypeScript compilado
- Tailwind otimizado
# - Assets hasheados
```

### Vercel
```bash
vercel --prod
# Deploy automático
# CDN global
# Uptime 99.9%
```

---

**Próximo:** Leia [FEATURES.md](./FEATURES.md) para ver o que foi implementado
