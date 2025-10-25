# Debug Guide - Itinerário Não Aparece no Frontend

## Problema Identificado

O itinerário estava sendo gerado corretamente, mas não aparecia no TripDetailScreen.

## Causas Raiz

### 1. **Mismatch de Formato de Dados** (PRINCIPAL)
- `generateItinerary()` retorna um **array** de itens
- `CreateTripScreen` estava salvando um **array** direto
- `TripDetailScreen` esperava um **objeto** `{ itinerary: [...], tips: [...] }`

**Antes (Errado):**
```javascript
const itinerary = await generateItinerary(...);  // Retorna array
await addTrip({
  itinerary,  // Salva array diretamente ❌
  ...
});
```

**Depois (Correto):**
```javascript
const itinerary = await generateItinerary(...);  // Retorna array
await addTrip({
  itinerary: itinerary ? { itinerary } : null,  // Salva como objeto ✅
  ...
});
```

### 2. **Função transformItinerary() Incompleta**
O TripDetailScreen tinha lógica para transformar o formato, mas:
- Recebia formato errado desde o início (array vs objeto)
- Não conseguia processar corretamente

## Solução Implementada

### 1. **CreateTripScreen.tsx**
```typescript
// Antes: itinerary (array)
// Depois: { itinerary: [...] } (object)
await addTrip({
  ...
  itinerary: itinerary ? { itinerary } : null,
  ...
});
```

### 2. **TripDetailScreen.tsx - transformItinerary()**
```typescript
const transformItinerary = (itinerary: any) => {
  // Detecta formato Gemini: { itinerary: [...], tips: [...] }
  if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
    const activities = itinerary.itinerary;
    const daysMap = new Map<number, any[]>();
    
    // Agrupa atividades por dia
    activities.forEach((activity) => {
      const day = activity.day || 1;
      if (!daysMap.has(day)) {
        daysMap.set(day, []);
      }
      daysMap.get(day)!.push(activity);
    });
    
    // Converte para array de dias
    const days = Array.from({ length: daysMap.size }, (_, index) => {
      const dayNum = index + 1;
      const dayActivities = daysMap.get(dayNum) || [];
      
      return {
        title: `Dia ${dayNum}`,
        attractions: dayActivities.map((activity) => ({
          name: activity.name,
          description: activity.reason,  // Mapeia 'reason' → 'description'
          time: activity.time,
          emoji: '📍',
          duration: activity.duration,
          category: activity.category,
          lat: activity.lat,
          lng: activity.lng,
        })),
      };
    });
    
    return {
      days,
      tips: itinerary.tips || [],
      destination: itinerary.destination,
    };
  }
  
  return itinerary;
};
```

### 3. **Logs para Debug**
Adicionados em:
- `HomeScreen.tsx` - logs de carregamento de viagens
- `TripDetailScreen.tsx` - logs de parsing/transformação
- `tripsStore.ts` - logs de Firestore

## Como Verificar se Funciona

1. **No Console do Navegador:**
```javascript
// Deve aparecer:
🏠 HomeScreen: Loading trips for user: [uid]
🏠 HomeScreen: Current trips: [{...}]
🔍 TripDetailScreen - Trip: {...}
🔍 TripDetailScreen - Raw itinerary: {itinerary: [...], tips: [...]}
📍 transformItinerary input: {itinerary: [...], tips: [...]}
✅ transformItinerary: Converting from Gemini format
📊 Found 21 activities
📊 Grouped into 7 days
✅ transformItinerary result: {days: [...], tips: [...]}
```

2. **No Frontend:**
- Página deve mostrar o itinerário agrupado por dias
- Cada dia deve listar as atrações com horário, duração, etc.
- Mapa de Mapbox deve renderizar com marcadores

## Estrutura de Dados Esperada no Firestore

```javascript
{
  id: "trip-123",
  destination: "Barcelona",
  startDate: "2025-10-23",
  endDate: "2025-10-30",
  itinerary: {
    itinerary: [
      {
        day: 1,
        time: "09:00",
        name: "Sagrada Familia",
        duration: 180,
        reason: "Iconic basilica...",
        tip: "Book tickets online...",
        category: "Religião/História",
        lat: 41.4036,
        lng: 2.1744
      },
      // ... mais atividades
    ],
    tips: ["Check local weather", "Learn phrases"]
  },
  userId: "user-123",
  createdAt: "2025-10-24T23:00:00.000Z"
}
```

## Commits Relacionados

- `a6ae946` - Aumentar maxOutputTokens para 4096
- `8c76fc8` - Transformar formato de itinerário Gemini
- `dab17f4` - Salvar objeto completo do itinerário

## Próximas Verificações

Se ainda não funcionar, verificar:

1. **Firestore Console:**
   - Viagem foi salva com `itinerary` como objeto?
   - Campo `itinerary.itinerary` existe e é um array?

2. **Network Tab:**
   - GET request para carregar trip retorna dados corretos?
   - Response contém itinerary no formato esperado?

3. **Redux/Zustand DevTools:**
   - Store tem as viagens carregadas?
   - Dados do trip estão corretos?
