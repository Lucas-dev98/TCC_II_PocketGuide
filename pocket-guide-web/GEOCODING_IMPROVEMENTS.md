# 🔍 MapboxGeocoding Service Analysis

## Root Cause Analysis
O problema na criação de viagem estava relacionado ao serviço de geocoding que pode:
1. Fazer requisições lentas à API Mapbox
2. Falhar silenciosamente sem fallback adequado
3. Bloquear o fluxo de criação de viagem

## Problemas Identificados

### ❌ Problema 1: Timeout indefinido na API Mapbox
```typescript
// ANTES (PROBLEMA)
const response = await fetch(url.toString());
// Sem timeout - pode pendurar indefinidamente
```

**Impacto**: Se Mapbox estiver lento ou indisponível, a aplicação fica travada.

### ✅ Solução
```typescript
// DEPOIS (MELHORADO)
const response = await fetch(url.toString(), { 
  signal: AbortSignal.timeout(5000) // 5 segundos de timeout
});
```

---

### ❌ Problema 2: Parsing inseguro do response
```typescript
// ANTES (PROBLEMA)
const data = await response.json();
console.log('🔍 Mapbox API Response:', { 
  query, 
  featuresCount: data.features?.length,
  features: data.features?.slice(0, 3) // Pode ser undefined
});
```

**Impacto**: Se a resposta da API for inválida, o código quebra.

### ✅ Solução
```typescript
// DEPOIS (MELHORADO)
const data = await response.json();

if (!data.features || !Array.isArray(data.features)) {
  throw new Error('Invalid Mapbox response');
}
```

---

### ❌ Problema 3: Token vazio não causa fallback rápido
```typescript
// ANTES (PROBLEMA)
const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
if (!mapboxToken) {
  console.error('❌ VITE_MAPBOX_API_KEY não está configurada!');
  throw new Error('Token not configured');
}
// Throw exception interrompe tudo
```

**Impacto**: Sem token, a aplicação falha completamente em vez de usar fallback.

### ✅ Solução
```typescript
// DEPOIS (MELHORADO)
const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
if (!mapboxToken || mapboxToken.trim() === '') {
  console.warn('⚠️ VITE_MAPBOX_API_KEY não configurada, usando apenas banco local');
  // Retorna banco local sem erro
  const fallbackResults = searchCitiesLocal(query);
  return fallbackResults;
}
```

---

### ❌ Problema 4: Parsing de país pode retornar string vazia
```typescript
// ANTES (PROBLEMA)
const countryContext = feature.context?.find(ctx => ctx.id?.startsWith('country.'));
const country = countryContext?.name || '';
// String vazia causa problemas na validação

// Nome da cidade pode quebrar
const cityName = feature.place_name.split(',')[0].trim();
// place_name pode ser undefined
```

**Impacto**: Dados incompletos passam para o formulário.

### ✅ Solução
```typescript
// DEPOIS (MELHORADO)
const countryContext = feature.context?.find(ctx => ctx.id?.startsWith('country.'));
const country = countryContext?.name || 'Unknown';
// Sempre tem um valor

const cityName = (feature.place_name || '').split(',')[0]?.trim() || feature.name || '';
// Fallback para feature.name se place_name vazio

// ...
.filter((s: CitySuggestion) => s.city && s.country); // Remove dados inválidos
```

---

### ❌ Problema 5: Logs muito verbosos
```typescript
// ANTES (PROBLEMA)
console.log('📍 Resultado processado:', { cityName, country, placeType: feature.place_type });
// Imprime para CADA resultado - spam de console
```

**Impacto**: Console poluído, difícil de debugar.

### ✅ Solução
```typescript
// DEPOIS (MELHORADO)
console.log('✅ API Mapbox:', uniqueSuggestions.length, 'resultados');
// Apenas um log final com contagem
```

---

## Melhorias Implementadas

| Problema | Solução | Impacto |
|----------|---------|--------|
| Timeout indefinido | `AbortSignal.timeout(5000)` | Máximo 5s de espera |
| Parsing inseguro | Validações com fallback | Dados confiáveis |
| Token vazio | Usa banco local sem erro | App funciona sem API |
| Parsing de país vazio | Fallback para 'Unknown' | Sempre tem valor |
| Logs verbosos | Resumidos em 1 log | Console mais limpo |

---

## Fluxo Otimizado

```
searchCities(query)
  ↓
  1️⃣ Validar query vazia → return []
  ↓
  2️⃣ Verificar CACHE (rápido!)
     - Se hit → return
  ↓
  3️⃣ Buscar BANCO LOCAL (muito rápido!)
     - Se encontrou → return + cache
  ↓
  4️⃣ Tentar API MAPBOX (com 5s timeout)
     - Se sucesso → return + cache
     - Se falha → fallback banco local + cache
  ↓
  5️⃣ Banco local com fallback seguro
     - Sempre retorna algo ou array vazio
```

---

## Commit
- **Hash**: Próximo commit
- **Mensagem**: `fix: improve mapboxGeocoding service - better error handling, timeout, safer parsing`
- **Mudanças**:
  - ✅ Timeout de 5s na requisição Mapbox
  - ✅ Validação de response.json()
  - ✅ Fallback automático se token vazio
  - ✅ Parsing seguro com fallbacks
  - ✅ Remoção de logs verbosos
  - ✅ Tipagem correta com TypeScript

---

## Testes Recomendados

```typescript
// 1. Teste sem token (deve usar banco local)
const results = await searchCities('Paris', 'en');
// Esperado: Retorna cidades do banco local

// 2. Teste com query longa (timeout da API)
const results = await searchCities('very long city name that doesnt exist...', 'en');
// Esperado: 5s max + fallback para banco local

// 3. Teste de cache
const r1 = await searchCities('London', 'en'); // → API
const r2 = await searchCities('London', 'en'); // → CACHE (instantâneo)

// 4. Teste de duplicatas
const results = await searchCities('São Paulo', 'pt');
// Esperado: Sem cidades duplicadas
```

---

## Conclusão

O geocoding agora é **muito mais resiliente** e não deve causar travamentos na criação de viagem. A priorização do banco local + cache garante **respostas rápidas** mesmo sem conexão com Mapbox.
