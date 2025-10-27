# 📊 Feature #4: Web Vitals Monitoring

**Data**: 26 de outubro de 2025  
**Status**: ✅ Implementado  
**Impacto**: Dados reais de performance, detecção de problemas  

## 📋 O Que Foi Implementado

### 1. **Web Vitals Service** (`/src/services/webVitalsService.ts`)
Monitora Core Web Vitals 2024 (web-vitals v5):

- **LCP** (Largest Contentful Paint) - <2.5s é "good"
- **INP** (Interaction to Next Paint) - <200ms é "good" (substitui FID)
- **CLS** (Cumulative Layout Shift) - <0.1 é "good"
- **FCP** (First Contentful Paint) - <1.8s é "good"
- **TTFB** (Time to First Byte) - <600ms é "good"

Features:
- ✅ Avaliação automática (good/needs-improvement/poor)
- ✅ Detecta tipo de conexão (4G, 3G, etc)
- ✅ Calcula delta (diferença em relação à última)
- ✅ Subscribe pattern para atualizações
- ✅ Envio para Analytics endpoint
- ✅ Relatório completo com timestamp e URL

### 2. **useWebVitals Hook** (`/src/hooks/useWebVitals.ts`)
Hook para componentes acessarem métricas em tempo real:

```typescript
const { 
  report,          // Relatório completo
  metrics,         // Map de todas as métricas
  overallScore,    // 'excellent' | 'good' | 'needs-work'
  summary,         // Contagem: { good: 3, 'needs-improvement': 2, poor: 0 }
  allGood,         // boolean
  sendToAnalytics, // (endpoint) => Promise<void>
  getMetric        // (name) => VitalMetric | undefined
} = useWebVitals()
```

### 3. **WebVitalsDebugger Component** (`/src/components/WebVitalsDebugger.tsx`)
Componente de debug para desenvolvimento:

- ✅ Mostra todas as métricas em tempo real
- ✅ Código de cores (🟢 good, 🟡 needs-improvement, 🔴 poor)
- ✅ Score geral (Excellent/Good/Needs Work)
- ✅ Resumo de contagens
- ✅ Apenas ativa com `VITE_DEBUG=true` em desenvolvimento
- ✅ Posicionado em fixed bottom-right

## 📊 Thresholds Utilizados

| Métrica | Good | Needs Improvement | Poor |
|---------|------|------------------|------|
| LCP | <2.5s | <4s | >4s |
| INP | <200ms | <500ms | >500ms |
| CLS | <0.1 | <0.25 | >0.25 |
| FCP | <1.8s | <3s | >3s |
| TTFB | <600ms | <1.2s | >1.2s |

## 🎯 Como Funciona

### 1️⃣ **Inicialização**
```
App inicia → WebVitalsService instancia
  ↓
onLCP, onINP, onCLS, onFCP, onTTFB listeners ativados
  ↓
Coleta info de conexão do navigator
```

### 2️⃣ **Coleta de Métricas**
```
Página carrega → Browser calcula LCP, INP, etc
  ↓
each métrica → handleMetric() chamado
  ↓
VitalMetric criada com rating automático
  ↓
Callbacks notificados
```

### 3️⃣ **Acesso em Componentes**
```
Component monta → useWebVitals() hook
  ↓
Subscreve webVitalsService.onMetricsUpdate()
  ↓
Recebe relatório sempre que métrica muda
  ↓
Pode chamar sendToAnalytics(endpoint)
```

## 💾 Dados Coletados

```typescript
{
  timestamp: 1729961000000,
  url: "https://app.example.com/trip/123",
  metrics: {
    lcp: { name: "LCP", value: 2100, rating: "good", ... },
    inp: { name: "INP", value: 150, rating: "good", ... },
    cls: { name: "CLS", value: 0.08, rating: "good", ... },
    fcp: { name: "FCP", value: 1200, rating: "good", ... },
    ttfb: { name: "TTFB", value: 450, rating: "good", ... }
  },
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    connection: "4g"  // ou "3g", "2g", "lte", etc
  }
}
```

## 🧪 Como Testar

### 1. ativa Web Vitals Debugger
```bash
# Em desenvolvimento:
VITE_DEBUG=true npm run dev

# Abra app
# Ver painel no bottom-right com métricas em tempo real
```

### 2. Simule conexão lenta
```bash
# DevTools → Network tab
# Set throttling: "Slow 3G"
# Recarregue page
# Ver TTFB e outros tempos aumentarem
```

### 3. Inspecione Métricas no Console
```javascript
// No console:
import { webVitalsService } from '@/services/webVitalsService'

// Ver relatório atual
webVitalsService.getReport()

// Ver score geral
webVitalsService.getOverallScore()

// Ver resumo
webVitalsService.getMetricsSummary()

// Subscribe para atualizações
webVitalsService.onMetricsUpdate((report) => {
  console.log('Métricas atualizadas:', report)
})
```

### 4. Envie para Backend
```typescript
useEffect(() => {
  const unsubscribe = webVitalsService.onMetricsUpdate(async (report) => {
    // Envia quando todas as métricas estão "good"
    if (webVitalsService.allMetricsGood()) {
      await webVitalsService.sendToAnalytics('/api/analytics/web-vitals')
    }
  })
  return unsubscribe
}, [])
```

## ✨ Benefícios

1. **Para Negócio**:
   - 📊 Dados reais de experiência do usuário
   - 📈 Identifica problemas de performance
   - 🎯 Prioriza otimizações (onde está o gargalo)
   - 💰 Correlaciona performance com conversão

2. **Para Desenvolvedores**:
   - 🔍 Visibilidade em tempo real
   - 📱 Testa em diferentes conexões
   - 🐛 Debug facilitado
   - 📋 Histórico de performance

3. **Para UX**:
   - ⚡ Identifica sites lentos
   - 📊 Dados baseados em realidade do usuário
   - 🎨 Prioriza experiência visual
   - 🏃 Melhora tempo de interação

## 📁 Arquivos Criados

- ✅ `/src/services/webVitalsService.ts` (256 linhas)
- ✅ `/src/hooks/useWebVitals.ts` (26 linhas)
- ✅ `/src/components/WebVitalsDebugger.tsx` (101 linhas)

### Modificados:
- ✅ `/src/App.tsx` - Adicionado WebVitalsDebugger

### Dependências Adicionadas:
- ✅ `web-vitals@5.1.0` - Library oficial do Google

## 🚀 Próximas Melhorias

- [x] Coleta básica de Web Vitals
- [x] Debug em desenvolvimento
- [ ] Envio automático para analytics
- [ ] Dashboard de Web Vitals histórico
- [ ] Alertas quando métrica piora
- [ ] Correlação com conversões
- [ ] Testes de performance automatizados
- [ ] Sentry integration

---

**Commit**: `feat: Add Web Vitals monitoring service`
