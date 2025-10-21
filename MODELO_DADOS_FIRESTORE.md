# 🗄️ POCKET GUIDE - MODELO DE DADOS (FIRESTORE)

## Visão Geral

O Pocket Guide usa **Firestore (NoSQL)** como banco de dados principal com a seguinte estrutura:

```
firestore/
├── users/{uid}                          ← Perfil do usuário
├── trips/{tripId}                       ← Viagens salvaguardadas
│   └── attractions/                     ← Atrações (subcoleção)
└── analytics/                           ← Dados de uso (opcional)
```

---

## 📊 COLEÇÃO: `users`

### Documento: `users/{uid}`

Armazena informações do perfil do usuário e suas preferências.

#### Estrutura TypeScript

```typescript
interface FirestoreUser {
  uid: string;              // Firebase Auth UID (chave primária)
  name: string;             // Nome completo
  email: string;            // Email
  photoURL?: string;        // URL da foto de perfil
  tags: string[];           // Preferências: ["gastronomia", "médio", "casal"]
  createdAt: Timestamp;     // Data de criação
  updatedAt?: Timestamp;    // Última atualização (opcional)
  preferredLanguage?: string; // Idioma preferido (opcional)
  notificationsEnabled?: boolean; // Push notifications (opcional)
}
```

#### Exemplo de Documento

```json
{
  "uid": "user_123abc",
  "name": "Lucas Bastos",
  "email": "lucas@example.com",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "tags": ["gastronomia", "médio", "casal"],
  "createdAt": Timestamp(2025, 10, 21),
  "updatedAt": Timestamp(2025, 10, 21),
  "preferredLanguage": "pt-BR",
  "notificationsEnabled": true
}
```

#### Índices (Se Necessário)
- Nenhum índice específico necessário (uid é a chave primária)

#### Segurança (Firestore Rules)
```firestore
match /users/{uid} {
  allow read: if request.auth.uid == uid;
  allow write: if request.auth.uid == uid;
  allow delete: if request.auth.uid == uid;
}
```

---

## ✈️ COLEÇÃO: `trips`

### Documento: `trips/{tripId}`

Armazena informações sobre cada viagem do usuário.

#### Estrutura TypeScript

```typescript
interface FirestoreTrip {
  id: string;                    // ID único (gerado pelo Firestore)
  userId: string;                // Referência ao usuário (FK)
  name?: string;                 // Nome customizado da viagem (opcional)
  destination: string;           // Nome do destino (ex: "Lisboa, Portugal")
  destinationPlaceId: string;    // Google Places ID para referência
  startDate: Timestamp;          // Data de início
  endDate: Timestamp;            // Data de término
  days: number;                  // Número de dias (calculado)
  attractions: Attraction[];     // Array de atrações do roteiro
  createdAt: Timestamp;          // Data de criação
  updatedAt: Timestamp;          // Última atualização
  isOffline: boolean;            // Flag: foi criada/editada offline?
  isSyncedToCloud: boolean;      // Flag: foi sincronizada com cloud?
  version: number;               // Versão para controle de conflitos
}
```

#### Tipo: `Attraction`

```typescript
interface Attraction {
  id: string;                    // ID único dentro da viagem
  day: number;                   // Dia da viagem (1, 2, 3...)
  time: string;                  // Horário (formato: "09:00")
  name: string;                  // Nome da atração
  duration: number;              // Duração em minutos
  reason: string;                // Por que visitar (IA gerada ou customizada)
  tip?: string;                  // Dica prática (opcional)
  location: {
    lat: number;                 // Latitude
    lng: number;                 // Longitude
  };
  placeId?: string;              // Google Places ID (opcional)
  address?: string;              // Endereço completo (opcional)
  order?: number;                // Ordem customizada (para drag & drop)
  isFavorite?: boolean;          // Marcado como favorito (opcional)
}
```

#### Exemplo de Documento

```json
{
  "id": "trip_abc123",
  "userId": "user_123abc",
  "name": "Fim de semana em Lisboa",
  "destination": "Lisboa, Portugal",
  "destinationPlaceId": "ChIJfSvxw5DDpQEROv5JchqXEhE",
  "startDate": Timestamp(2025, 11, 1),
  "endDate": Timestamp(2025, 11, 3),
  "days": 3,
  "attractions": [
    {
      "id": "attr_001",
      "day": 1,
      "time": "09:00",
      "name": "Café A Brasileira",
      "duration": 60,
      "reason": "Café histórico com pastéis de nata e vista para Chiado",
      "tip": "Peça o café com leite e prove o pastel de nata fresco",
      "location": { "lat": 38.7100, "lng": -9.1410 },
      "placeId": "ChIJrfSvxw5DDpQERMABCDEFGH",
      "address": "Rua Garrett 120, 1200-204 Lisboa, Portugal",
      "order": 1,
      "isFavorite": true
    },
    {
      "id": "attr_002",
      "day": 1,
      "time": "11:00",
      "name": "Torre de Belém",
      "duration": 90,
      "reason": "Monumento histórico UNESCO com vista para Tejo",
      "tip": "Visite no final da tarde para fotos com melhor iluminação",
      "location": { "lat": 38.6917, "lng": -9.2155 },
      "placeId": "ChIJrfSvxw5DDpQERMABCDEFGI",
      "address": "Avenida da Índia, 1400-038 Lisboa, Portugal",
      "order": 2,
      "isFavorite": false
    }
  ],
  "createdAt": Timestamp(2025, 10, 21),
  "updatedAt": Timestamp(2025, 10, 21),
  "isOffline": false,
  "isSyncedToCloud": true,
  "version": 1
}
```

#### Índices Recomendados
```
Índice 1:
- Collection: trips
- Fields: userId (Ascending), createdAt (Descending)
- Propósito: Buscar todas as viagens de um usuário, ordenadas por data

Índice 2:
- Collection: trips
- Fields: userId (Ascending), updatedAt (Descending)
- Propósito: Sincronização offline
```

#### Segurança (Firestore Rules)
```firestore
match /trips/{tripId} {
  // Criar nova viagem
  allow create: if request.auth.uid == request.resource.data.userId;
  
  // Ler viagem (apenas do próprio usuário)
  allow read: if request.auth.uid == resource.data.userId;
  
  // Atualizar viagem (apenas do próprio usuário)
  allow update: if request.auth.uid == resource.data.userId &&
                  request.resource.data.version == resource.data.version + 1;
  
  // Deletar viagem (apenas do próprio usuário)
  allow delete: if request.auth.uid == resource.data.userId;
}
```

---

## 🏗️ ESTRUTURA COMPLETA NO FIRESTORE

### Visualização da Árvore

```
firestore/
│
├── users/
│   ├── user_123abc/
│   │   ├── uid: "user_123abc"
│   │   ├── name: "Lucas Bastos"
│   │   ├── email: "lucas@example.com"
│   │   ├── photoURL: "https://..."
│   │   ├── tags: ["gastronomia", "médio", "casal"]
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
│   │
│   └── user_456def/
│       └── ...
│
├── trips/
│   ├── trip_abc123/
│   │   ├── id: "trip_abc123"
│   │   ├── userId: "user_123abc"
│   │   ├── destination: "Lisboa, Portugal"
│   │   ├── startDate: Timestamp
│   │   ├── endDate: Timestamp
│   │   ├── days: 3
│   │   ├── attractions: [
│   │   │   {atração 1},
│   │   │   {atração 2},
│   │   │   ...
│   │   ]
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
│   │
│   └── trip_def456/
│       └── ...
│
└── analytics/ (opcional)
    ├── daily/
    │   ├── 2025-10-21/
    │   │   ├── newUsers: 42
    │   │   ├── totalTripsCreated: 18
    │   │   └── totalAttractions: 127
    │   │
    │   └── 2025-10-22/
    │       └── ...
    │
    └── monthly/
        └── ...
```

---

## 🔗 RELACIONAMENTOS

### User → Trips (1:N)

```
users/{uid}
    ↓
    └── trips (array de IDs)

trips/{tripId}
    ↓
    └── userId (referência ao usuário)
```

**Tipo:** Foreign Key  
**Constraint:** Cada trip deve ter um userId válido que existe em users/

### Trip → Attractions (1:N)

```
trips/{tripId}
    ↓
    └── attractions[] (array de objetos Attraction)
```

**Tipo:** Embedment  
**Razão:** Atrações são tightly coupled com trips, nunca acessadas separadamente

---

## 💾 OPERAÇÕES FIRESTORE

### CREATE - Criar Viagem

```typescript
const tripRef = doc(collection(db, "trips"), tripId);
await setDoc(tripRef, {
  id: tripId,
  userId: currentUser.uid,
  destination: "Lisboa, Portugal",
  destinationPlaceId: placeId,
  startDate: Timestamp.fromDate(startDate),
  endDate: Timestamp.fromDate(endDate),
  days: calculateDays(startDate, endDate),
  attractions: attractions, // Array gerado por IA
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  isOffline: false,
  isSyncedToCloud: true,
  version: 1
});
```

### READ - Buscar Viagens de Usuário

```typescript
const q = query(
  collection(db, "trips"),
  where("userId", "==", currentUser.uid),
  orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);
const trips = snapshot.docs.map(doc => doc.data());
```

### UPDATE - Atualizar Viagem

```typescript
const tripRef = doc(db, "trips", tripId);
await updateDoc(tripRef, {
  attractions: updatedAttractions,
  updatedAt: Timestamp.now(),
  version: FieldValue.increment(1) // Incrementa versão
});
```

### DELETE - Deletar Viagem

```typescript
const tripRef = doc(db, "trips", tripId);
await deleteDoc(tripRef);
```

---

## 🔄 FLUXO DE SINCRONIZAÇÃO OFFLINE

### Quando Usuário Edita (Offline)

1. ✏️ Edita atração em `TripDetailScreen`
2. 💾 Salva em `tripStore` (AsyncStorage)
3. 🚩 Marca com `isOffline: true` e `isSyncedToCloud: false`
4. 🔄 App detecta que está offline, não tenta sincronizar

### Quando Reconecta Internet

1. 🌐 App detecta conexão via `@react-native-community/netinfo`
2. 🔍 Busca trips com `isSyncedToCloud: false`
3. 📤 Para cada trip: `updateDoc()` em Firestore
4. ✅ Marca com `isSyncedToCloud: true`
5. 📱 UI mostra "✅ Sincronizado"

### Conflitos (Versioning)

Se houver conflito (mesmo trip editado em 2 dispositivos):

```typescript
// Dispositivo A: version 2
// Dispositivo B: version 2

// Dispositivo A tenta atualizar para version 3
// Firestore rejeita se version atual não for 2

// Solução: Usar Last-Write-Wins (LWW)
// ou implementar merge com timestamp
```

---

## 🔐 SEGURANÇA

### Firestore Security Rules Completas

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: Apenas o próprio usuário pode ler/escrever
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      allow delete: if request.auth.uid == uid;
    }
    
    // Trips: Apenas do próprio usuário
    match /trips/{tripId} {
      allow create: if request.auth.uid == request.resource.data.userId;
      allow read: if request.auth.uid == resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
    
    // Analytics: Apenas leitura para usuários autenticados
    match /analytics/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

### Validação de Dados

```typescript
// Antes de salvar, validar:
- userId deve ser válido
- startDate < endDate
- Pelo menos 1 atração
- location.lat/lng válidos
- duration > 0
```

---

## 📝 TIPOS TYPESCRIPT (sync com Firestore)

### Em `src/types/firestore.ts`

```typescript
import { Timestamp } from "firebase/firestore";

export interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  preferredLanguage?: string;
  notificationsEnabled?: boolean;
}

export interface FirestoreTrip {
  id: string;
  userId: string;
  name?: string;
  destination: string;
  destinationPlaceId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  days: number;
  attractions: Attraction[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isOffline: boolean;
  isSyncedToCloud: boolean;
  version: number;
}

export interface Attraction {
  id: string;
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip?: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  address?: string;
  order?: number;
  isFavorite?: boolean;
}
```

---

## 📊 CAPACIDADE & LIMITES

### Limites Firestore (Grátis)

| Recurso | Limite |
|---------|--------|
| Documentos | Ilimitado |
| Armazenamento | 1 GB |
| Leituras/dia | 50K |
| Escritas/dia | 20K |
| Deletes/dia | 20K |

### Para Production (Plano Spark ou Blaze)

| Recurso | Limite |
|---------|--------|
| Documentos | Ilimitado |
| Armazenamento | Conforme uso |
| Leituras/dia | Ilimitado (pagável) |
| Escritas/dia | Ilimitado (pagável) |
| Deletes/dia | Ilimitado (pagável) |

**Estimativa MVP:** 1K usuários = ~50MB armazenamento, custos mínimos

---

## 🚀 IMPLEMENTAÇÃO CHECKLIST

### Phase 1: Setup
- [ ] Criar Firestore database
- [ ] Configurar Security Rules
- [ ] Criar índices recomendados
- [ ] Gerar documento de exemplo

### Phase 2: Integração
- [ ] Implementar `createUser()` em Firebase
- [ ] Implementar `createTrip()` com attractions
- [ ] Implementar `updateTrip()` com versionamento
- [ ] Implementar `deleteTrip()`

### Phase 3: Sincronização
- [ ] Implementar sync manager
- [ ] Testar offline → online
- [ ] Testar conflitos
- [ ] Implementar retry logic

### Phase 4: Otimização
- [ ] Adicionar indexing para queries
- [ ] Implementar caching local
- [ ] Otimizar queries (fields, limits)
- [ ] Monitorar uso de API

---

## 📚 REFERÊNCIAS

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Indexing](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Timestamp](https://firebase.google.com/docs/reference/js/firestore.timestamp)

---

## 💡 BOAS PRÁTICAS

✅ **DO:**
- ✅ Sempre validar dados antes de salvar
- ✅ Usar Timestamps para datas
- ✅ Manter userId em cada documento
- ✅ Usar versionamento para conflitos
- ✅ Implementar Security Rules desde o início
- ✅ Testar queries com dados reais
- ✅ Monitorar custos de API

❌ **DON'T:**
- ❌ Não confiar na segurança client-side
- ❌ Não fazer queries sem índices (para dados > 100K)
- ❌ Não misturar Realtime Database com Firestore
- ❌ Não deixar dados sem validação
- ❌ Não fazer queries muito complexas
- ❌ Não salvar dados sensíveis sem criptografia

---

## 🎯 PRÓXIMOS PASSOS

1. **Copie** este modelo para Firestore Console
2. **Implemente** os tipos em `src/types/firestore.ts`
3. **Configure** as Security Rules
4. **Crie** funções em `src/services/firestore.ts` para CRUD
5. **Teste** com dados reais
6. **Monitore** uso e custos

---

**Status:** ✅ Modelo completo e pronto para implementação  
**Última atualização:** 21 de outubro de 2025  
**Versão:** 1.0
