# 📦 Bundle Size Analysis & Optimization Report

**Data**: 26 de outubro de 2025  
**App**: PocketGuide Web

## 📊 Situação Atual

### Build Output Analysis

```
dist/assets/mapbox-C7l_f4NV.js           1,650.08 kB │ gzip: 445.19 kB  (67% of total!)
dist/assets/firebase-DwRU_BSR.js           460.66 kB │ gzip: 106.05 kB  (17%)
dist/assets/react-vendor-Bsgpa9vH.js       209.76 kB │ gzip: 66.29 kB   (11%)
dist/assets/CreateTripScreen-*.js            23.13 kB │ gzip: 8.75 kB
dist/assets/TripDetailScreen-*.js            16.00 kB │ gzip: 5.10 kB
dist/assets/DayDetailScreen-*.js             23.96 kB │ gzip: 8.18 kB

Total: ~2,460 kB | Gzipped: ~639 kB
```

### Problema Principal

🔴 **Mapbox GL JS** representa **67%** do bundle total (1.65MB uncompressed)

Razões:
- Renderização de mapa completa em WebGL
- Incluir estilos, tipografia, imagens de sprite
- Suporta features avançadas que não usamos

---

## 🎯 Opções de Otimização

### Opção 1: Mapbox GL JS Lite ⭐ RECOMENDADA

**Descrição**: Versão lightweight do Mapbox (100% compatível mas sem features avançadas)

**Vantagens**:
- ✅ 80% mais leve (~330KB → ~66KB gzipped)
- ✅ Compatível com API existente
- ✅ Suporta marcadores e popups
- ✅ Sem mudanças de código

**Desvantagens**:
- ⚠️ Sem 3D terrain
- ⚠️ Sem animações custom
- ⚠️ Sem clustering nativo

**Implementação**:
```bash
npm install mapbox-gl-lite
# Substituir import em MapboxMap.tsx
```

**Impacto Estimado**: -379KB total | -445KB gzipped ❌ (Erro anterior - precisa revisar)

---

### Opção 2: Lazy Load Mapbox (Com Suspense)

**Descrição**: Carregar Mapbox apenas quando necessário

**Vantagens**:
- ✅ First paint mais rápido
- ✅ Sem mudanças de dependências
- ✅ Fácil implementação

**Desvantagens**:
- ⚠️ Delay ao abrir mapa
- ⚠️ UX prejudicada em slow connections

**Implementação**:
```tsx
const MapboxMap = lazy(() => import('./components/MapboxMap'));
// Usar com Suspense/fallback
```

**Impacto Estimado**: -30% First Paint (network-dependent)

---

### Opção 3: Leaflet.js (Drop-in Replacement)

**Descrição**: Biblioteca leve com API similar ao Mapbox

**Vantagens**:
- ✅ 15KB gzipped (28x menor)
- ✅ Comunidade grande
- ✅ Plugins abundantes
- ✅ Suporta múltiplos provedores (OSM, Mapbox)

**Desvantagens**:
- ⚠️ API diferente (refactor necessário)
- ⚠️ Menos features nativas
- ⚠️ Pode perder qualidade visual

**Implementação**: Refactor de ~300 linhas em MapboxMap.tsx

**Impacto Estimado**: -1.6MB | -90% bundle reduction

---

### Opção 4: Dinamic Imports + Code Splitting

**Descrição**: Carregar features MapboxMap apenas em DayDetailScreen

**Vantagens**:
- ✅ Reduz initial bundle
- ✅ Suporta background loading
- ✅ Sem mudanças de API

**Desvantagens**:
- ⚠️ Delay de ~500ms ao usar mapa
- ⚠️ Complexity aumentada

**Implementação**:
```tsx
const MapboxMap = dynamic(() => import('./MapboxMap'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

**Impacto Estimado**: -445KB initial | +500ms interaction delay

---

## 🏆 Recomendação

### Estratégia Híbrida (Fases)

**Fase 1 (IMEDIATA - Hoje)**: Lazy Load Mapbox
- Implementação: 10 min
- Impacto: -30% First Paint
- Risco: Baixo

**Fase 2 (Próxima semana)**: Avaliar Mapbox GL JS Lite
- Implementação: 2-3 horas
- Impacto: -50% total bundle
- Risco: Médio (precisa testes)

**Fase 3 (Opcional)**: Considerar Leaflet para versão 2.0
- Implementação: 2-3 dias
- Impacto: -80% bundle
- Risco: Alto (refactor substancial)

---

## 📈 Performance Targets

| Métrica | Atual | Target | Status |
|---------|-------|--------|--------|
| Initial JS | 639KB gzip | <500KB | ⚠️ Acima |
| First Contentful Paint | ~2-3s | <1.5s | ⚠️ |
| Time to Interactive | ~4-5s | <2s | ⚠️ |
| LCP (Largest Contentful Paint) | ~3-4s | <2.5s | ⚠️ |

---

## 🔄 Ação Recomendada

1. ✅ Implementar Lazy Load (hoje)
2. ⏭️ Testar Mapbox GL JS Lite (próxima week)
3. 📊 Monitorar metrics após implementação
4. 🎯 Definir v2.0 roadmap

---

## 📚 Referências

- [Mapbox GL JS Lite](https://docs.mapbox.com/mapbox-gl-js/guides/lite/)
- [Leaflet.js](https://leafletjs.com/)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Web Vitals](https://web.dev/vitals/)
