# 🚀 POCKET GUIDE - GUIA DE PRÓXIMOS PASSOS

## 1️⃣ Setup Inicial do Projeto

### Pré-requisitos
- Node.js v16+ e npm/yarn
- React Native CLI
- Xcode (para iOS) ou Android Studio (para Android)
- Firebase account
- Google Cloud account (para Gemini + Maps APIs)

### Instalação de Dependências

```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE

# Instalar dependências base
npm install

# Dependências essenciais
npm install zustand
npm install firebase
npm install @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @react-native-maps/maps
npm install react-native-draggable-flatlist

# Dependências opcionais (para date picker, etc)
npm install react-native-date-picker
npm install react-native-gesture-handler
```

---

## 2️⃣ Configuração de APIs

### Firebase Setup

1. **Criar projeto no Firebase Console:**
   - Ir em [console.firebase.google.com](https://console.firebase.google.com)
   - Criar novo projeto "Pocket Guide"
   - Ativar Authentication (Google Sign-in)
   - Criar Firestore Database

2. **Obter credenciais:**
   - Project Settings → Copy firebaseConfig
   - Criar `.env` na raiz do projeto:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=pocket-guide-xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pocket-guide-xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=pocket-guide-xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Google Gemini API

1. **Ativar API:**
   - Google Cloud Console → APIs & Services
   - Ativar "Generative Language API"
   - Criar API Key

2. **Adicionar ao `.env`:**
```env
REACT_APP_GEMINI_API_KEY=AIzaSy...
```

### Google Maps API

1. **Ativar APIs:**
   - Google Cloud Console → APIs & Services
   - Ativar "Places API", "Maps SDK for Android/iOS", "Directions API"
   - Criar API Key com restrições

2. **Adicionar ao `.env`:**
```env
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## 3️⃣ Implementação de Features

### Priority 1: Autenticação ⚡
**Arquivo:** `src/hooks/useAuth.ts`  
**TODO:** Implementar métodos com Firebase real

```typescript
// Implementar:
1. loginWithGoogle() - Usar Firebase + Google Provider
2. logout() - Fazer sign out
3. Persistir usuário em Firestore
4. Carregar tags do Firestore
```

**Arquivo:** `src/services/firebase.ts`  
**TODO:** Remover comentários TODO e testar

### Priority 2: Quiz de Onboarding ⚡
**Arquivo:** `src/screens/OnboardingQuiz.tsx`  
**TODO:** 
1. Salvar tags em Firestore (`users/{uid}`)
2. Redirecionar para HomeScreen após conclusão
3. Adicionar validação

### Priority 3: Integração Gemini 🤖
**Arquivo:** `src/services/gemini.ts`  
**TODO:**
```typescript
1. Testar chamada à API Gemini
2. Validar resposta JSON
3. Tratamento de erros robusto
4. Rate limiting (se necessário)
```

**Arquivo:** `src/screens/CreateTripScreen.tsx`  
**TODO:**
1. Implementar Google Places Autocomplete
2. Integrar date picker
3. Chamar `generateItineraryWithGemini()`
4. Salvar trip em store + Firestore
5. Navegar para TripDetailScreen

### Priority 4: Mapa e Directions 🗺️
**Arquivo:** `src/services/googleMaps.ts`  
**TODO:**
1. Testar `getPlacePredictions()`
2. Testar `getPlaceDetails()`
3. Testar `getOptimizedRoute()`
4. Cache de tiles para offline

**Arquivo:** `src/screens/MapDayScreen.tsx`  
**TODO:**
1. Renderizar mapa com @react-native-maps
2. Adicionar pins para atrações
3. Desenhar polyline da rota
4. Implementar "Get Directions" → Google Maps/Apple Maps

### Priority 5: Drag & Drop ✨
**Arquivo:** `src/screens/TripDetailScreen.tsx`  
**TODO:**
1. Instalar `react-native-draggable-flatlist`
2. Envolver lista de atrações
3. Implementar reordenação
4. Salvar nova ordem no store
5. Sincronizar com Firestore

---

## 4️⃣ Estrutura de Dados no Firestore

### Collection: `users`
```javascript
users/{uid}
{
  uid: string
  name: string
  email: string
  photoURL: string (opcional)
  tags: string[] // ["gastronomia", "médio", "casal"]
  createdAt: Timestamp
}
```

### Collection: `trips`
```javascript
trips/{tripId}
{
  id: string
  userId: string (referência)
  destination: string
  startDate: Timestamp
  endDate: Timestamp
  attractions: Attraction[] (array de objetos)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Documento: `Attraction` (dentro de trip)
```javascript
{
  id: string
  day: number
  time: string // "09:00"
  name: string
  duration: number // em minutos
  reason: string
  tip: string (opcional)
  location: {
    lat: number
    lng: number
    address: string
  }
  order: number (para ordenação)
}
```

### Firestore Security Rules
```firestore-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários - apenas acesso próprio
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Viagens - apenas do próprio usuário
    match /trips/{tripId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 5️⃣ Fluxo de Sincronização Offline

### Quando usuário edita (offline):
1. Edição salva em `AsyncStorage`
2. `isSyncedToFirestore = false` no store
3. UI marca como "pendente de sincronização"

### Quando reconecta internet:
1. App detecta conexão (ex: com `@react-native-community/netinfo`)
2. Chama `useTripStore().getSyncPendingTrips()`
3. Para cada trip pendente:
   - Envia dados para Firestore
   - Confirma com `markSynced(tripId)`
4. Sincroniza na tela com `🔄 Sincronizando...` → `✅ Sincronizado`

**Arquivo para implementar:** `src/services/syncManager.ts` (novo)

---

## 6️⃣ Testes Recomendados

### Testes Unitários
```bash
npm install jest @testing-library/react-native

# Testar:
- useAuth hook
- useTripStore hook
- formatDate utils
- Zustand store mutations
```

### Testes E2E
```bash
npm install detox detox-cli

# Testar:
- Fluxo completo: Login → Quiz → Create → Edit → Map
- Modo offline
- Sincronização
```

---

## 7️⃣ Checklist de Implementação

### Autenticação & Setup
- [ ] Firebase Auth configurado
- [ ] Google Sign-in funcionando
- [ ] Usuário salvo em Firestore
- [ ] Logout funcionando

### Quiz & Preferences
- [ ] 3 perguntas respondidas
- [ ] Tags salvas em `users/{uid}`
- [ ] Tags carregadas em `useAuth`

### Criar Viagem
- [ ] Google Places Autocomplete
- [ ] Date picker para datas
- [ ] Chamada Gemini API
- [ ] Viagem salva em store + Firestore
- [ ] Roteiro exibido

### Editar Roteiro
- [ ] Reordenar com drag & drop
- [ ] Adicionar atração via Google Places
- [ ] Editar hora/duração
- [ ] Deletar atração
- [ ] Mudanças salvas offline
- [ ] Sincronização ao reconectar

### Mapa & Navegação
- [ ] Mapa exibe atrações
- [ ] Rota otimizada com Google Directions
- [ ] Pins numerados
- [ ] "Get Directions" abre Google/Apple Maps

### Offline
- [ ] Roteiro acessível sem internet
- [ ] Mapa em cache offline
- [ ] Edições funcionam offline
- [ ] Sincronização ao reconectar

### Performance & UX
- [ ] Loading states adequados
- [ ] Error handling robusto
- [ ] 3 minutos para criar roteiro
- [ ] Sem crashes
- [ ] UI responsiva

---

## 8️⃣ Estrutura de Commits Recomendada

```git
feat: setup firebase auth e google signin
feat: implementar onboarding quiz com 3 perguntas
feat: integrar gemini api para gerar roteiros
feat: implementar google maps e directions
feat: adicionar drag & drop para reordenação
feat: implementar sincronização offline
feat: adicionar testes unitários
fix: corrigir sincronização de atrações
chore: atualizar dependências
docs: adicionar documentação de APIs
```

---

## 9️⃣ Recursos Úteis

### Documentação
- [React Native Docs](https://reactnative.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Google Maps API](https://developers.google.com/maps)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### Bibliotecas Recomendadas
- `@react-native-community/netinfo` - Detectar conexão internet
- `react-native-snackbar` - Notificações
- `react-native-modal` - Modals customizadas
- `react-native-gesture-handler` - Gestures

---

## 🔟 Milestones Sugeridos

### Semana 1: MVP v0.1
- [ ] Autenticação funcionando
- [ ] Quiz salvando tags
- [ ] Criar viagem com dados mockados

### Semana 2: MVP v0.2
- [ ] Integração Gemini
- [ ] Gerar roteiro real
- [ ] Exibir itinerário

### Semana 3: MVP v0.3
- [ ] Edição de roteiro
- [ ] Drag & drop
- [ ] CRUD de atrações

### Semana 4: MVP v0.4
- [ ] Mapa com atrações
- [ ] Google Directions
- [ ] Sincronização offline

### Semana 5+: Polish & Deploy
- [ ] Testes
- [ ] Performance
- [ ] Build iOS/Android
- [ ] Deploy App Store / Play Store

---

## 📞 Dúvidas Frequentes

**P: Por onde começo?**  
R: Comece por Firebase Auth (Priority 1). Depois Quiz (Priority 2).

**P: Como testar sem as APIs?**  
R: Use mock data em `src/constants/mockData.ts`. Depois integre APIs reais.

**P: Como funciona o offline?**  
R: AsyncStorage + Zustand persist + Cache de mapas. Veja `tripStore.ts`.

**P: Preciso de backend?**  
R: Não! Firestore + Gemini API + Google Maps é tudo que você precisa.

---

## ✨ Bom Desenvolvimento!

Você tem uma base sólida e bem estruturada. Agora é hora de implementar! 🚀

Quer que eu ajude com alguma parte específica?
