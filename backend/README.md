# 🔌 Pocket Guide Backend - API Proxy Server

Backend Node.js/Express para o Pocket Guide - responsável por proteger API keys e gerenciar integrações seguras.

## 🚀 Overview

Este backend atua como um proxy seguro para:
- ✅ Gemini AI API (geração de itinerários)
- 🔄 Mapbox Geocoding API (busca de cidades)
- 📷 Unsplash API (fotos de atrações)

### Problemas que Resolve

**Antes** (Frontend expõe chaves):
```typescript
❌ VITE_GEMINI_API_KEY=xxxx  // Visível no bundle!
❌ VITE_MAPBOX_API_KEY=xxxx  // Qualquer um pode usar
❌ Sem rate limiting
❌ Sem validação de requests
```

**Depois** (Backend protege):
```typescript
✅ API keys no servidor apenas
✅ Frontend nunca vê as chaves
✅ Rate limiting por usuário
✅ Validação com Zod
✅ Logging e auditoria
```

---

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase Admin SDK credentials
- API keys (Gemini, Mapbox, Unsplash)

---

## 🔧 Setup

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Editar `.env.local` com suas credenciais:

```env
# Server
PORT=3001
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=pocketguide-bf350
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# API Keys (PROTECTED!)
GEMINI_API_KEY=AIzaSy...
MAPBOX_API_KEY=pk.eyJ...
UNSPLASH_API_KEY=xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173,https://pocket-guide-web-steel.vercel.app
```

### 3. Rodar Localmente

```bash
npm run dev
```

Server inicia em `http://localhost:3001`

### 4. Build para Produção

```bash
npm run build
npm start
```

---

## 🛣️ Rotas da API

### Health Check (Sem Auth)

```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2025-10-30T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### Gemini Endpoints

#### Generate Itinerary

```bash
POST /api/gemini/generate-itinerary
Authorization: Bearer <firebase-token>
Content-Type: application/json

Request:
{
  "destination": "Paris",
  "days": 3,
  "interests": ["art", "food", "history"],
  "language": "en"
}

Response:
{
  "destination": "Paris",
  "days": 3,
  "itinerary": [
    {
      "day": 1,
      "activities": [...]
    }
  ],
  "tips": [...]
}
```

### Mapbox Endpoints (TODO)

```bash
POST /api/mapbox/search
Authorization: Bearer <firebase-token>
```

### Unsplash Endpoints (TODO)

```bash
POST /api/unsplash/search
Authorization: Bearer <firebase-token>
```

---

## 🔐 Segurança

### Authentication

Todas as rotas (exceto `/health`) requerem Firebase Auth token:

```typescript
// Frontend envia token
fetch('/api/gemini/generate-itinerary', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
})

// Backend valida token
const decodedToken = await admin.auth().verifyIdToken(token)
```

### Rate Limiting

```typescript
// Limite: 100 requests por 15 minutos (por usuário)
const RATE_LIMIT_WINDOW_MS = 900000
const MAX_REQUESTS = 100
```

Se exceder, retorna `429 Too Many Requests`.

### Input Validation

Todos os requests são validados com Zod:

```typescript
const generateItinerarySchema = z.object({
  destination: z.string().min(2).max(100),
  days: z.number().min(1).max(365),
  interests: z.array(z.string()).min(1),
  language: z.enum(['pt', 'en', 'es']),
})
```

---

## 📊 Arquitetura

```
backend/
├── src/
│   ├── index.ts              # Aplicação principal
│   ├── middleware/
│   │   ├── auth.ts           # Firebase token validation
│   │   ├── rateLimit.ts      # Rate limiting
│   │   └── errorHandler.ts   # Global error handling
│   ├── routes/
│   │   ├── gemini.ts         # Gemini API proxy
│   │   ├── mapbox.ts         # Mapbox API proxy
│   │   ├── unsplash.ts       # Unsplash API proxy
│   │   └── health.ts         # Health check
│   └── utils/
│       └── logger.ts         # Logging (Pino)
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🧪 Testing

(Em desenvolvimento)

```bash
npm run test
npm run test:coverage
```

---

## 📈 Deployment

### Vercel

O backend pode rodar em Vercel Serverless Functions:

```bash
# Vercel Deploy
vercel deploy --prod
```

Ou em um servidor Node.js tradicional:

```bash
# Traditional Server
npm install -g pm2
pm2 start npm --name "pocket-guide-backend" -- start
```

### Environment Variables (Vercel)

Adicionar em Project Settings → Environment Variables:

```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
GEMINI_API_KEY=...
...
```

---

## 🚨 Troubleshooting

### "Cannot find module 'express'"

```bash
npm install
```

### "Firebase credential error"

Verifique `.env.local`:
- FIREBASE_PRIVATE_KEY está completo?
- Chaves especiais escapadas corretamente?

```bash
# Testar
npm run type-check
```

### "Rate limit exceeded"

Aumentar limite em `.env.local`:

```env
RATE_LIMIT_MAX_REQUESTS=200
```

ou usar Redis em produção (ver comentários no código).

---

## 🔄 Próximos Passos

- [ ] Implementar Mapbox proxy
- [ ] Implementar Unsplash proxy
- [ ] Adicionar Redis para rate limiting (distribuído)
- [ ] Adicionar logs estruturados (Sentry)
- [ ] Adicionar testes unitários
- [ ] Implementar cache (Redis/Memcached)
- [ ] Monitoring e alertas (Prometheus/Grafana)

---

## 📝 Commits Relacionados

- **Phase 1**: Backend Proxy Setup (este)
- Phase 2: Frontend updates (usar proxy)
- Phase 3: Testing & monitoring

---

## 📞 Support

Para dúvidas ou issues:
1. Consulte `/docs/QUALITY_SECURITY_TESTING_ANALYSIS.md`
2. Abra issue no GitHub
3. Contact: lucas@example.com

---

**Status**: 🟡 Em Desenvolvimento - Estrutura Pronta, Aguardando Implementação Completa
