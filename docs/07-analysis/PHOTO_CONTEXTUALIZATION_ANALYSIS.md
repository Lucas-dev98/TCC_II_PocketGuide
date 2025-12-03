# 📸 Análise: Melhoria de Contextualização de Fotos

## 🔍 Problemas Identificados

### 1. **Busca Genérica de Fotos**
**Arquivo**: `src/services/photoService.ts`
**Problema**: As fotos são buscadas apenas pelo nome da atração, sem contexto

```typescript
// ❌ ATUAL: Busca genérica
const query = this.getSearchQuery(attractionName);
// Resultado: "colosseum rome" → Fotos aleatórias de colosseo

// ✅ DESEJADO: Busca contextualizada
// Incluir: tipo de atração + destination + atividade + season
```

**Linhas Afetadas**:
- Line 230-240: `fetchFromUnsplash()` 
- Line 299-310: `getSearchQuery()` - Apenas mapeamento básico

### 2. **Falta de Contexto de Itinerário**
**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Problema**: Fotos geradas sem considerar:
- Hora do dia (café 09:00 vs jantar 19:00)
- Tipo de atividade (restaurante, museu, natureza)
- Descrição da atração
- Dicas/razão da visita

```typescript
// ❌ ATUAL
async function generatePhotosForAttraction(attraction: any): Promise<PhotoData[]> {
  const photoSource = await PhotoService.generatePhotoUrl(attraction.name);
  // Busca apenas pelo nome
}

// ✅ DESEJADO
async function generatePhotosForAttraction(
  attraction: AttractionDetail,
  context: {
    destination: string;
    day: number;
    time: string;
    season?: string;
    dayOfWeek?: string;
  }
): Promise<PhotoData[]> {
  // Usar contexto completo para busca melhor
}
```

**Linhas Afetadas**:
- Line 594-630: `generatePhotosForAttraction()`
- Line 142-150: Onde fotos são solicitadas

### 3. **Queries de Busca Insuficientes**
**Arquivo**: `src/services/photoService.ts` lines 18-150
**Problema**: Mapeamento MUITO reduzido de queries

Exemplo de queries que faltam:
```typescript
// FALTAM: Categorias por tipo de atração
'café': 'cozy coffee shop breakfast', // NÃO: 'coffee cafe'
'brunch': 'brunch breakfast restaurant',
'almoço': 'lunch restaurant local dining',
'jantar': 'dinner restaurant elegant',
'parque': 'beautiful park landscape nature',
'praia': 'beach sunny vacation relax',
'trilha': 'hiking mountain trail nature',
'museu': 'museum art gallery interior',
'gastronomia': 'food festival gastronomy',

// POR DESTINATION (exemplos)
'[Roma] colosseum': 'colosseum rome ancient architecture sunset',
'[Paris] eiffel': 'eiffel tower paris romantic evening lights',
'[Rio] cristo': 'cristo redentor rio de janeiro statue view',
```

**Linhas Afetadas**:
- Line 18-150: `ATTRACTION_SEARCH_QUERIES` - Muito limitado

### 4. **Sem Filtragem por Tipo de Atividade**
**Arquivo**: `src/screens/DayDetailScreen.tsx` lines 132-170
**Problema**: Não detecta categoria da atração automaticamente

```typescript
// ❌ ATUAL: Lógica simplória
category: a.reason
  ? (a.reason.toLowerCase().includes("restaurante") ? "restaurante" : ...)
  : "outro",

// ✅ DESEJADO: Detecção inteligente
function detectActivityType(attraction: GeminiActivity): ActivityCategory {
  const reason = (attraction.reason || '').toLowerCase();
  const name = (attraction.name || '').toLowerCase();
  const category = (attraction.category || '').toLowerCase();
  
  // Usar múltiplos sinais para detectar tipo
  if (reason.includes('comer') || reason.includes('restaurante') || name.includes('restaurant')) {
    return 'restaurante';
  }
  // ... etc
}
```

**Linhas Afetadas**:
- Line 136-144: Lógica de detecção de categoria
- Line 132-145: Mapeamento de atração → categoria

### 5. **Sem Uso de `reason` na Busca de Fotos**
**Arquivo**: `src/services/photoService.ts`
**Problema**: Campo `reason` (ex: "Arquitetura modernista única") não é utilizado

```typescript
// ❌ ATUAL
PhotoService.generatePhotoUrl(attraction.name)
// Ignora: attraction.reason, attraction.category, attraction.tip

// ✅ DESEJADO
PhotoService.generatePhotoUrl(
  attraction.name,
  {
    reason: attraction.reason, // "Arquitetura modernista"
    category: attraction.category, // "arquitetura"
    tip: attraction.tip, // "Fotografar ao pôr do sol"
    time: attraction.time, // "09:00"
    destination: destination // "Barcelona"
  }
)
```

**Linhas Afetadas**:
- Line 169: `generatePhotoUrl()` - Falta parâmetros de contexto
- Line 594-630: `generatePhotosForAttraction()` - Não passa contexto

### 6. **Sem Otimização por Horário**
**Arquivo**: Toda a aplicação
**Problema**: Café às 09:00 busca igual a café às 21:00

```typescript
// ✅ DESEJADO: Otimizações por hora
function enhanceQueryByTime(query: string, time: string): string {
  const hour = parseInt(time.split(':')[0]);
  
  if (hour >= 8 && hour <= 11) {
    return query + ' breakfast morning'; // café da manhã
  } else if (hour >= 12 && hour <= 15) {
    return query + ' lunch midday'; // almoço
  } else if (hour >= 19 && hour <= 23) {
    return query + ' dinner evening night'; // jantar
  }
  
  return query;
}
```

### 7. **Sem Uso de Informações de Destination**
**Arquivo**: `src/services/photoService.ts`
**Problema**: Não inclui destino nas buscas

```typescript
// ❌ ATUAL
'colosseum': 'colosseum rome architecture'

// ✅ DESEJADO
'colosseum': 'colosseum rome architecture', // hardcoded
// Mas também permitir:
function buildEnhancedQuery(name: string, destination: string): string {
  // Se não há mapeamento, construir dinamicamente
  return `${name} ${destination} high quality photography`;
}
```

---

## 📋 Plano de Implementação

### Fase 1: Expandir Queries de Busca (Prioridade ALTA)
**Arquivo**: `src/services/photoService.ts`
**Objetivo**: Aumentar `ATTRACTION_SEARCH_QUERIES` de ~150 para ~500 entries

```typescript
const ATTRACTION_SEARCH_QUERIES: { [key: string]: string } = {
  // RESTAURANTES - Por tipo de culinária
  'italian restaurant': 'trattoria italy rustic dining',
  'japanese restaurant': 'sushi bar japanese authentic',
  'brazilian restaurant': 'churrascaria brazilian steakhouse',
  'street food': 'street food market local vendors',
  'food truck': 'food truck street casual',
  
  // CAFÉS - Por horário (veremos na Fase 2)
  'café': 'cozy coffee shop aesthetic morning light',
  'café da manhã': 'breakfast cafe pastry bakery',
  'coffee shop': 'espresso coffee counter interior',
  
  // MUSEUS - Por tipo
  'art museum': 'art museum gallery interior paintings',
  'history museum': 'museum exhibits history artifacts',
  'science museum': 'interactive science center modern',
  
  // NATUREZA - Por tipo
  'hiking trail': 'mountain hiking trail nature scenic',
  'beach': 'sandy beach ocean vacation sunset',
  'park': 'beautiful park landscape green trees',
  'waterfall': 'waterfall cascade nature water',
  'mountain': 'mountain peak landscape vista',
  
  // COMPRAS
  'shopping': 'shopping mall modern retail',
  'market': 'traditional market local vendors',
  'souvenir shop': 'souvenir shop local crafts',
  
  // CULTURA & ENTRETENIMENTO
  'teatro': 'theater interior performance stage',
  'cinema': 'movie theater interior modern',
  'show': 'live show concert performance',
  
  // Por DESTINATION (top 50)
  'colosseum rome': 'colosseum rome ancient architecture ruins',
  'eiffel tower paris': 'eiffel tower paris romantic view lights',
  'big ben london': 'big ben clock tower london gothic',
  // ... etc
};
```

**Ganho**: 3-4x melhoria na relevância das fotos

---

### Fase 2: Adicionar Contexto de Itinerário
**Arquivo**: `src/services/photoService.ts`
**Objetivo**: Passar contexto adicional

```typescript
interface PhotoContext {
  destination?: string;
  reason?: string;
  category?: 'restaurante' | 'museu' | 'natureza' | 'compras' | 'cultura' | 'outro';
  time?: string;
  tip?: string;
  dayOfWeek?: string;
  season?: 'primavera' | 'verão' | 'outono' | 'inverno';
}

static async generatePhotoUrl(
  attractionName: string,
  context?: PhotoContext
): Promise<PhotoSource> {
  let query = this.getSearchQuery(attractionName);
  
  // Aprimorar query com contexto
  if (context) {
    query = this.enhanceQueryWithContext(query, context);
  }
  
  return this.fetchFromUnsplash(query);
}

private static enhanceQueryWithContext(
  baseQuery: string,
  context: PhotoContext
): string {
  let enhanced = baseQuery;
  
  // Adicionar destination
  if (context.destination) {
    enhanced += ` ${context.destination}`;
  }
  
  // Adicionar categoria
  if (context.category) {
    const categoryKeywords: Record<string, string> = {
      'restaurante': 'restaurant dining',
      'museu': 'museum gallery',
      'natureza': 'nature landscape outdoor',
      'compras': 'shopping retail',
      'cultura': 'cultural heritage',
    };
    enhanced += ` ${categoryKeywords[context.category] || ''}`;
  }
  
  // Aprimorar com horário
  if (context.time) {
    enhanced = this.enhanceQueryByTime(enhanced, context.time);
  }
  
  // Aprimorar com estação
  if (context.season) {
    const seasonKeywords: Record<string, string> = {
      'primavera': 'spring flowers blooming',
      'verão': 'summer sunny bright',
      'outono': 'autumn fall colors',
      'inverno': 'winter snow cold',
    };
    enhanced += ` ${seasonKeywords[context.season]}`;
  }
  
  return enhanced;
}

private static enhanceQueryByTime(query: string, time: string): string {
  const hour = parseInt(time.split(':')[0]);
  
  if (hour >= 6 && hour <= 11) {
    return query + ' morning light breakfast';
  } else if (hour >= 12 && hour <= 14) {
    return query + ' afternoon daylight';
  } else if (hour >= 15 && hour <= 18) {
    return query + ' afternoon golden hour';
  } else if (hour >= 19 && hour <= 22) {
    return query + ' evening night lights';
  } else {
    return query + ' night dark';
  }
}
```

**Ganho**: 5-7x melhoria na relevância

---

### Fase 3: Atualizar Chamadas em DayDetailScreen
**Arquivo**: `src/screens/DayDetailScreen.tsx`
**Objetivo**: Passar contexto ao gerar fotos

```typescript
async function generatePhotosForAttraction(
  attraction: AttractionDetail,
  destination: string,
  day: number,
  season?: string
): Promise<PhotoData[]> {
  const photos: PhotoData[] = [];

  for (let i = 0; i < 2; i++) {
    try {
      const photoSource = await PhotoService.generatePhotoUrl(
        attraction.name,
        {
          destination,
          reason: attraction.reason,
          category: attraction.category,
          time: attraction.time,
          tip: attraction.tip,
          season,
          dayOfWeek: getDayOfWeek(day), // Novo: adicionar dia da semana
        }
      );
      
      photos.push({
        id: `${attraction.id || 'attraction'}-${i}`,
        url: photoSource.url,
        alt: `${attraction.name} - ${attraction.reason || 'foto'} ${i + 1}`,
        attractionName: attraction.name,
        source: photoSource.source,
        width: photoSource.width,
        height: photoSource.height,
        photographer: photoSource.photographer,
        photographerUrl: photoSource.photographerUrl,
        unsplashLink: photoSource.unsplashLink,
        photoId: photoSource.photoId,
        downloadLocation: photoSource.downloadLocation,
      });
    } catch (error) {
      debug.error(`Erro gerando foto ${i + 1} para "${attraction.name}":`, error);
    }
  }

  return photos;
}

// Remover calls antigas e atualizar para:
// generatePhotosForAttraction(attraction, destination, day, season)
```

**Ganho**: Contexto completo passa para buscas

---

### Fase 4: Melhorar Seleção de Imagem (selectBestImage)
**Arquivo**: `src/services/photoService.ts` line 285
**Objetivo**: Não apenas por "relevância" do Unsplash

```typescript
private static selectBestImage(images: UnsplashImage[]): UnsplashImage {
  // ❌ ATUAL: Apenas a primeira (default do Unsplash)
  return images[0];
  
  // ✅ DESEJADO: Considerar múltiplas métricas
  let bestImage = images[0];
  let bestScore = this.scoreImage(images[0]);
  
  for (const image of images.slice(1)) {
    const score = this.scoreImage(image);
    if (score > bestScore) {
      bestScore = score;
      bestImage = image;
    }
  }
  
  return bestImage;
}

private static scoreImage(image: UnsplashImage): number {
  // Score baseado em:
  // 1. Likes (popularidade)
  // 2. Downloads (qualidade)
  // 3. Views (engajamento)
  // 4. Aspect ratio (melhor enquadramento)
  
  const likes = (image.likes || 0) || 0;
  const downloads = (image.downloads || 0) || 0;
  const views = (image.views || 0) || 0;
  
  return (likes * 1) + (downloads * 2) + (views * 0.5);
}
```

---

## 🚀 Implementação Priorizada

| Fase | Prioridade | Impacto | Esforço | Status |
|------|-----------|---------|--------|--------|
| 1: Expandir Queries | 🔴 ALTA | 3-4x | 1h | ❌ TODO |
| 2: Contexto de Itinerário | 🔴 ALTA | 5-7x | 2h | ❌ TODO |
| 3: Atualizar DayDetailScreen | 🟡 MÉDIA | 2-3x | 1h | ❌ TODO |
| 4: Melhorar selectBestImage | 🟡 MÉDIA | 1.5-2x | 1h | ❌ TODO |

**Total Estimado**: ~5 horas | **Ganho de Qualidade**: 10-15x melhoria

---

## 📊 Antes vs Depois

### ❌ ANTES (Problema Atual)
```
Busca: "Colosseum"
Query ao Unsplash: "colosseum rome architecture"
Resultado: Fotos genéricas, às vezes de outros coliseus ou arquitetura

Busca: "Café 09:00"
Query ao Unsplash: "coffee cafe italian"
Resultado: Interior de café genérico, pode ser à noite (luzes acesas)

Busca: "Parque 14:00 em Primavera"
Query ao Unsplash: "park"
Resultado: Parque invernal ou monótono
```

### ✅ DEPOIS (Melhorado)
```
Busca: "Colosseum" (Roma, Dia 1, 09:00)
Query ao Unsplash: "colosseum rome architecture morning light"
Resultado: Colosseo iluminado pela manhã, fotografia de alta qualidade

Busca: "Café" (09:00 em Paris)
Query ao Unsplash: "cozy coffee shop aesthetic morning light paris"
Resultado: Café acolhedor com luz matinal, pastéis frescos

Busca: "Parque" (14:00, Primavera em Barcelona)
Query ao Unsplash: "beautiful park landscape spring flowers green trees"
Resultado: Parque com flores da primavera, luz solar ideal
```

---

## 📝 Próximos Passos

1. ✅ Expandir `ATTRACTION_SEARCH_QUERIES` com 300+ novos mappings
2. ✅ Adicionar interface `PhotoContext`
3. ✅ Implementar `enhanceQueryWithContext()` e `enhanceQueryByTime()`
4. ✅ Atualizar `generatePhotoUrl()` para aceitar contexto
5. ✅ Atualizar `DayDetailScreen.tsx` para passar contexto
6. ✅ Melhorar `selectBestImage()` com scoring
7. ✅ Testar com múltiplos destinos e horários
8. ✅ Validar qualidade das fotos retornadas

