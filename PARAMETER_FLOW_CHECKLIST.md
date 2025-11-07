# 🔍 Pocket Guide - Parameter Flow Checklist

## 📋 Objetivo
Verificar que **TODOS os parâmetros** selecionados pelo usuário fluem corretamente através de toda a aplicação, desde o CreateTripScreen até as recomendações da IA.

---

## 📊 Parâmetros Coletados no Fluxo

### Step 1: Travel Type + Interests
- ✅ `tripTypes`: Array de tipos de viagem (cultura, aventura, relaxamento, etc)
- ✅ `interests`: Array de interesses específicos (yoga, praia, gastronomia, etc)

### Step 2: Group Composition + Budget  
- ✅ `groupType`: Tipo de grupo (solo, casal, familia, amigos, group)
- ✅ `numPeople`: Número total de pessoas
- ✅ `numChildren`: Número de crianças
- ✅ `budgetPerDay`: Orçamento diário (ultra-economico, economico, medio, premium, luxo)

### Step 3: Dates + Season
- ✅ `startDate`: Data de início (formato YYYY-MM-DD)
- ✅ `endDate`: Data de fim (formato YYYY-MM-DD)
- ✅ `season`: Estação preferida (primavera, verão, outono, inverno) **👈 CRÍTICO**
- ✅ `travelMonth`: Mês da viagem

### Step 4: Destination Selection
- ✅ `destination`: Destino selecionado

---

## 🔄 Fluxo de Dados - Verificação

### ✅ CreateTripScreen.tsx
- Local: `/src/screens/CreateTripScreen.tsx`
- Estado: `formData` contém todos os 12 parâmetros
- Verificação:
  ```typescript
  interface TripFormData {
    tripTypes: TripType[];           // ✅
    budgetPerDay: BudgetPerDay;      // ✅
    groupType: GroupType;            // ✅
    numPeople?: number;              // ✅
    numChildren?: number;            // ✅
    travelMonth: string;             // ✅
    startDate: string;               // ✅
    endDate: string;                 // ✅
    season?: string;                 // ✅ CRÍTICO!
    destination: string;             // ✅
    interests: string[];             // ✅
  }
  ```

### ✅ DestinationSelector.tsx (STEP 4)
- Local: `/src/components/DestinationSelector.tsx`
- Props esperados:
  ```typescript
  tripTypes           // ✅ Deve receber
  interests           // ✅ Deve receber
  groupType           // ✅ Deve receber
  numPeople           // ✅ Deve receber
  numChildren         // ✅ Deve receber
  budget              // ✅ Deve receber
  startDate           // ✅ Deve receber
  endDate             // ✅ Deve receber
  season              // ✅ CRÍTICO - DEVE RECEBER!
  selectedMonth       // ✅ Deve receber
  ```
- **Verificação em CreateTripScreen.tsx linha ~397**: ✅ PASSANDO (foi corrigido)
- **Verificação em useEffect linhas ~54-73**: ✅ ESTÁ NAS DEPENDÊNCIAS (foi corrigido)

### ✅ getHybridDestinationRecommendations()
- Local: `/src/services/destinationRecommendationService.ts` linha ~375
- Parâmetros passados:
  ```typescript
  await getHybridDestinationRecommendations(
    tripTypes,        // ✅
    interests,        // ✅
    groupType,        // ✅
    numPeople,        // ✅
    numChildren,      // ✅
    budget,           // ✅
    startDate,        // ✅
    endDate,          // ✅
    season,           // ✅ CRÍTICO!
    selectedMonth,    // ✅
    fallbackFunction, // ✅
    language          // ✅
  )
  ```

### ✅ buildRecommendationPrompt()
- Local: `/src/services/destinationRecommendationService.ts` linha ~155
- Assinatura atualizada para aceitar `season` ✅
- Prompt inclui season de forma EXPLÍCITA ✅
- Console.log dos parâmetros adicionado ✅

### ✅ generateItinerary()
- Local: `/src/services/itineraryGenerator.ts` linha ~152
- Chamada em CreateTripScreen.tsx linha ~181:
  ```typescript
  const itineraryPromise = generateItinerary(
    formData.destination,        // ✅
    durationDays,               // ✅
    formData.interests,         // ✅
    formData.budgetPerDay,      // ✅
    formData.groupType,         // ✅
    currentLanguage,            // ✅
    formData.season             // ✅ CRÍTICO!
  )
  ```

---

## 🐛 Debugging - Como Verificar

### 1. **Abra o Console do Navegador** (F12 → Console)

### 2. **Na Step 3 (Dates + Season):**
Selecione as datas e a estação. Você verá:
```
✅ FormData atualizado com season
```

### 3. **Clique Next para ir para Step 4 (Destination):**
No console, você verá logs como:

```
🎯 DestinationSelector - Parameters for AI: {
  tripTypes: ['relaxamento'],
  interests: ['yoga'],
  groupType: 'solo',
  numPeople: 1,
  numChildren: 0,
  budget: 'medio',
  startDate: '2025-11-08',
  endDate: '2025-11-29',
  season: 'primavera',           // ✅ DEVE ESTAR AQUI!
  selectedMonth: 11,
  language: 'pt-BR'
}
```

### 4. **Aguarde as recomendações carregarem:**
Você verá outro log:

```
════════════════════════════════════════════════════════
🎯 DESTINATION RECOMMENDATION PARAMETERS:
════════════════════════════════════════════════════════
📍 Trip Types: relaxamento
⭐ Interests: yoga
👥 Group Type: solo | People: 1 | Children: 0
💰 Budget: medio
📅 Dates: 11/8/2025 to 11/29/2025
🌍 Season: primavera           // ✅ DEVE ESTAR AQUI!
🗓️ Month: 11
🌐 Language: pt-BR
════════════════════════════════════════════════════════
📝 FULL PROMPT TO GEMINI:
════════════════════════════════════════════════════════
[PROMPT COMPLETO AQUI]
════════════════════════════════════════════════════════
```

---

## ✅ Checklist de Verificação

- [ ] **Season é selecionado em Step 3**: Veja se o botão de estação fica roxo quando clicado
- [ ] **Season aparece no log do DestinationSelector**: Procure por `"season": "primavera"` no console
- [ ] **Season aparece no prompt para Gemini**: Procure por `🌍 Season: primavera` no log
- [ ] **Destinos recomendados estão corretos**: 
  - Se selecionou Primavera em Novembro → Deve recomendar Brasil Sul, Argentina, Austrália, NZ
  - Se selecionou Outono em Novembro → Deve recomendar Japão, Coreia, USA, Europa
- [ ] **Todos os outros parâmetros aparecem nos logs**: tripTypes, interests, budget, group, dates

---

## 🚨 Se Ainda Estiver Errado

Se mesmo com essas correções as recomendações estiverem erradas:

1. **Procure no console por TODOS os 10+ parâmetros**
2. **Se algum estiver `undefined`**: Procure onde deveria ser definido
3. **Se o prompt não mencionar season**: Procure por bugs em `buildRecommendationPrompt()`
4. **Se a IA ignorar o prompt**: Pode ser um bug no Gemini (raramente acontece)

---

## 📝 Mudanças Realizadas

### Commit: `fix: pass season parameter to DestinationSelector + add comprehensive debugging logs`

**Arquivos modificados:**
- `CreateTripScreen.tsx` - Adicionado `season={formData.season}` ao DestinationSelector
- `DestinationSelector.tsx` - Adicionado log detalhado de todos os parâmetros
- `destinationRecommendationService.ts` - Adicionado log formatado do prompt final

**Resultado esperado:**
- Season agora é passado do CreateTripScreen para o DestinationSelector ✅
- DestinationSelector regenera recomendações quando season muda ✅
- Prompt para Gemini inclui season de forma explícita ✅
- Logs mostram exatamente quais parâmetros estão sendo usados ✅

---

## 🎯 Próximos Passos

1. **Teste no navegador** com os logs abertos
2. **Verifique se season aparece** em todos os lugares no console
3. **Se o problema persistir**, abra um issue com os logs do console

