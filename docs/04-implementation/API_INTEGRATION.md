# 🔗 API_INTEGRATION - APIs Externas

## 🔑 Google Gemini API

**Objetivo:** Gerar itinerários de viagem personalizados

### Configuração
```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```

### Obter Chave
1. Acesse https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie para `.env`

### Modelo Usado
```
gemini-2.0-flash
```

**Características:**
- ✅ Rápido e eficiente
- ✅ Compreensão de contexto
- ✅ Suporta grandes tokens (4096)
- ✅ JSON bem estruturado

### Prompt Padrão
```typescript
`${days}-day ${destination} itinerary (${budget} budget, ${groupType}, interests: ${tags.join(', ')})
Return only JSON with ${days * 3} activities:
{"itinerary":[{"day":1,"time":"09:00","name":"Place","duration":120,"reason":"Why","tip":"Tip","category":"Category","lat":0,"lng":0}]}`
```

### Resposta
```json
{
  "itinerary": [
    {
      "day": 1,
      "time": "09:00",
      "name": "Colosseum",
      "duration": 300,
      "reason": "Iconic Roman landmark",
      "tip": "Book tickets in advance",
      "category": "Historical Site",
      "lat": 41.8902,
      "lng": 12.4922
    }
    // ... mais 20+ atrações
  ]
}
```

### Tratamento de Erros
- Retry com exponential backoff (3 tentativas)
- Fallback para itinerários predefinidos
- Auto-fix para JSON truncado

---

## 🔑 Firebase

**Objetivo:** Autenticação e persistência de dados

### Configuração
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_DATABASE_URL=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx
```

### Obter Credenciais
1. Acesse https://console.firebase.google.com
2. Crie projeto ou selecione existente
3. Em Project Settings → General
4. Copie credenciais web

### Serviços Usados

#### 1. **Authentication**
- ✅ Google Sign-In
- ✅ Email/Password (preparado)
- ✅ Session persistence

```typescript
import { initializeAuth } from 'firebase/auth';
const auth = initializeAuth(app);
```

#### 2. **Firestore Database**
- ✅ Real-time sync
- ✅ Offline support
- ✅ Security rules

```typescript
import { initializeFirestore } from 'firebase/firestore';
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
```

#### 3. **Analytics**
- ✅ Event tracking
- ✅ User properties

### Collections Structure
```
firestore/
└── trips/
    └── {tripId}/
        ├── destination: "Roma"
        ├── startDate: "2025-10-25"
        ├── endDate: "2025-11-01"
        ├── budget: "mid"
        ├── interests: ["🏛️ História"]
        ├── itinerary: {...}
        └── userId: "abc123"
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      // Usuário só pode ler suas próprias viagens
      allow read: if request.auth.uid == resource.data.userId;
      // Usuário pode criar viagem
      allow create: if request.auth != null;
      // Usuário só pode deletar suas viagens
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🗺️ Mapbox GL

**Objetivo:** Visualizar atrações no mapa interativo

### Configuração
```env
VITE_MAPBOX_API_KEY=pk.xxx
```

### Obter Chave
1. Acesse https://account.mapbox.com/auth/signin/
2. Vá para "API Tokens"
3. Crie novo token público
4. Copie para `.env`

### Features Usados

#### 1. **Map Rendering**
```typescript
map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [lng, lat],
  zoom: 12,
});
```

#### 2. **Markers**
```typescript
new mapboxgl.Marker({ color: '#3B82F6' })
  .setLngLat([lng, lat])
  .setPopup(new mapboxgl.Popup().setHTML(...))
  .addTo(map.current);
```

#### 3. **Fly To**
```typescript
map.current.flyTo({
  center: [lng, lat],
  zoom: 15,
  duration: 1000,
});
```

#### 4. **Fit Bounds**
```typescript
map.current.fitBounds(bounds, { padding: 80 });
```

### Estilos Disponíveis
- `streets-v12` (usado) - Estilo ruas
- `outdoors-v12` - Outdoor
- `light-v11` - Claro
- `dark-v11` - Escuro
- `satellite-v9` - Satélite

---

## 🧠 Machine Learning (Futuro)

Possíveis integrações:
- **Google Places API:** Detalhes de lugares
- **Google Directions API:** Roteamento
- **Weather API:** Previsão climática
- **Currency Exchange:** Conversão de moedas

---

## ⚠️ Rate Limits & Quotas

| API | Limite | Custo |
|-----|--------|-------|
| **Gemini** | 15 req/min (free tier) | Grátis |
| **Firebase** | Ilimitado | Free + pay-as-you-go |
| **Mapbox** | 600 req/min (free) | Grátis + planos pagos |

---

## 🔐 Segurança

### API Keys
- ✅ Chaves públicas OK em código (prefixo `pk.` ou `VITE_`)
- ✅ Nunca committar `.env` original
- ✅ Usar `.env.example` para template

### Firebase Security
- ✅ Auth requerido para Firestore
- ✅ Rules restritivas por usuário
- ✅ Sem dados sensíveis em cliente

### Mapbox Security
- ✅ Token com permissões específicas
- ✅ Domain restrictions
- ✅ Regenerar se comprometido

---

**Próximo:** Leia [DEPLOYMENT.md](./DEPLOYMENT.md) para fazer deploy em produção
