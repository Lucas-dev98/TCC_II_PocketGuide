# Day Detail Feature - Quick Start Guide

## 🎯 O que foi implementado?

Uma nova feature que permite aos usuários visualizar cada dia de uma viagem em detalhes, com:
- 📸 Galeria de fotos com modal fullscreen
- ⏱️ Timeline de atrações em ordem cronológica
- ➡️ Navegação entre dias (anterior/próximo)
- 🗺️ Estrutura preparada para integração com mapas

## 📍 Como acessar?

### Do código
```typescript
// Navegação programática
navigate(`/trip/${tripId}/day/${dayNumber}`)
```

### Da UI
1. Ir para **HomeScreen**
2. Clicar em uma viagem
3. No TripDetailScreen, clicar em **"Ver completo"** em qualquer dia
4. Navegar com os botões de próximo/anterior no topo

## 🏗️ Estrutura de arquivos

```
src/
├── components/
│   ├── DayNavigation.tsx      ← Navegação entre dias
│   ├── DayGallery.tsx         ← Galeria de fotos
│   ├── DayTimeline.tsx        ← Timeline de atrações
│   └── index.ts               ← Exports
├── screens/
│   └── DayDetailScreen.tsx    ← Tela principal
├── hooks/
│   ├── useDayNavigation.ts    ← Hook de navegação
│   └── index.ts               ← Exports
└── types/
    └── index.ts               ← Tipos (PhotoData, AttractionDetail, etc)
```

## 🔌 Como integrar com dados reais?

### 1. Carregar fotos do Firebase Storage

**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Função**: `generatePhotosForAttraction()`

**Atual** (Mock):
```typescript
function generatePhotosForAttraction(attraction: any): PhotoData[] {
  return [{
    id: `${attraction.id}-1`,
    url: `https://images.unsplash.com/...`, // Mock
    alt: `${attraction.name} - foto 1`,
    attractionName: attraction.name,
    source: "unsplash",
  }];
}
```

**Fazer**: Substituir com chamada ao Firebase Storage
```typescript
async function generatePhotosForAttraction(attraction: any): Promise<PhotoData[]> {
  const bucket = ref(storage, `attractions/${attraction.id}`);
  const files = await listAll(bucket);
  
  return Promise.all(
    files.items.map(async (item) => ({
      id: item.name,
      url: await getDownloadURL(item),
      alt: `${attraction.name} - ${item.name}`,
      attractionName: attraction.name,
      source: "firebase",
    }))
  );
}
```

### 2. Integrar MapboxMap com localizações do dia

**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Seção**: "Mapa das Atrações" (linha ~260)

**Atual** (Placeholder):
```tsx
<div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
  <p className="text-gray-500">🗺️ Integração com Mapbox será adicionada aqui</p>
</div>
```

**Fazer**: Usar componente MapboxMap
```tsx
import { MapboxMap } from "@/components"

<MapboxMap
  attractions={attractions.map(a => ({
    name: a.name,
    reason: a.reason,
    lat: a.location.lat,
    lng: a.location.lng,
  }))}
  height="400px"
  onAttractionSelect={(attraction) => console.log(attraction)}
/>
```

### 3. Adicionar modal com detalhes da atração

**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Handler**: `onAttractionClick` (linha ~231)

**Atual**:
```typescript
onAttractionClick={(attraction) => {
  console.log("Atração clicada:", attraction);
}}
```

**Fazer**: Abrir modal com detalhes
```typescript
// 1. Criar componente AttractionModal.tsx
// 2. Adicionar estado
const [selectedAttraction, setSelectedAttraction] = useState<AttractionDetail | null>(null);

// 3. Usar em onAttractionClick
onAttractionClick={(attraction) => {
  setSelectedAttraction(attraction);
}}

// 4. Renderizar modal
{selectedAttraction && (
  <AttractionModal
    attraction={selectedAttraction}
    onClose={() => setSelectedAttraction(null)}
  />
)}
```

### 4. Exibir previsão do tempo

**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Seção**: "Info do destino" (linha ~200)

**Adicionar após** `{trip.itinerary && ...}`:
```tsx
{/* Weather Forecast */}
<div className="mt-4 p-4 bg-blue-50 rounded-lg">
  <p className="text-sm font-medium">🌤️ Previsão: {trip.weather?.condition}</p>
  <p className="text-xs text-gray-600">Temperatura: {trip.weather?.temp}°C</p>
</div>
```

## 🎯 Dados que vêm do Trip (localStorage/Firebase)

```typescript
trip.attractions = [
  {
    id: "attr1",
    day: 1,              // ← DayDetailScreen usa para filtrar
    time: "09:00",
    name: "Museu Louvre",
    duration: 120,       // em minutos
    reason: "Arte clássica",
    tip: "Chegue cedo para evitar filas",
    location: { lat: 48.8606, lng: 2.3352, address: "Paris, FR" }
  }
  // ... mais atrações
]
```

## 🎨 Customizar estilos

### Cores e Temas
**Arquivo**: `tailwind.config.ts`

```typescript
colors: {
  indigo: '#6366F1',  // ← Primária
  gray: {...},        // ← Neutros
}
```

DayDetailScreen usa: `text-indigo-500`, `bg-indigo-50`, etc.

### Layout responsivo
```tsx
// Mobile-first já implementado
className="max-w-4xl mx-auto px-4 py-6"  // Desktop
// Adiciona padding em mobile automaticamente
```

## 🧪 Testar localmente

### 1. Navegar para um dia
```bash
# URL direta
http://localhost:5173/trip/trip-123/day/1
http://localhost:5173/trip/trip-456/day/2
```

### 2. Testar navegação
- Botões prev/next devem ativar/desativar corretamente
- Deve impedir ir para dia 0 ou dia 999
- URL deve atualizar ao clicar

### 3. Testar galeria
- Clicar nas miniaturas deve mudar a foto principal
- Clique na foto deve abrir modal fullscreen
- Botões no modal devem navegar nas fotos

### 4. Testar timeline
- Atrações devem estar em ordem por hora
- Badges devem mostrar corretamente
- Cards devem ser clicáveis (TODO: implementar modal)

## 🐛 Debug

### Console logs úteis
```typescript
// Em DayDetailScreen.tsx
console.log("Trip data:", trip);
console.log("Current day:", currentDay);
console.log("Attractions:", attractions);
console.log("Navigation state:", navigation);
```

### DevTools
- React DevTools: Verificar states
- Network tab: Verificar carregamento de fotos
- Console: Erros de TypeScript/React

## 📚 Documentação relacionada

- `FEATURE_DAY_DETAILS_OPTIONS.md` - Análise das 3 opções antes da implementação
- `FEATURE_DAY_DETAILS_VISUAL.md` - Mockups e wireframes
- `PHASE_5_1_IMPLEMENTATION.md` - Detalhes técnicos completos

## ✅ Checklist para PHASE 5.2

- [ ] Integração Firebase Storage (fotos)
- [ ] Mapa com localizações
- [ ] Modal de detalhes de atração
- [ ] Previsão do tempo
- [ ] Testes unitários
- [ ] Testes E2E (Cypress)
- [ ] Performance (lazy loading de imagens)
- [ ] Mobile refinements

---

**Última atualização**: PHASE 5.1 ✅ Completado
**Próxima fase**: PHASE 5.2 (Integração & Refinement)
