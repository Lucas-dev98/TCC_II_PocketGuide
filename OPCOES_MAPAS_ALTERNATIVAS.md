# 🗺️ Alternativas de Mapas para o Pocket Guide

## 1. **OpenStreetMap (OSM) + react-native-maps** ✅ (Atual)
- **Pros**: Totalmente gratuito, sem limites, código aberto, offline possível
- **Cons**: Menos detalhes visuais que Google Maps
- **Custo**: R$ 0
- **Instalação**: `npm install react-native-maps`

```tsx
<MapView provider="openstreetmap" />
```

---

## 2. **Mapbox GL** ⭐ (Recomendado para MVP+)
- **Pros**: Mapas lindos, muito personalizável, 200k requests/mês grátis
- **Cons**: Precisa de chave da API (free tier suficiente)
- **Custo**: R$ 0 (até 200k requests/mês)
- **Instalação**: `npm install @react-native-mapbox-gl/maps`

```tsx
<MapboxGL.MapView>
  <MapboxGL.Camera centerCoordinate={[lng, lat]} zoomLevel={12} />
  <MapboxGL.PointAnnotation />
</MapboxGL.MapView>
```

**Como conseguir chave gratuita:**
1. Acesse https://account.mapbox.com/auth/signin
2. Crie conta (grátis)
3. Vá para "Tokens" e copie o token público

---

## 3. **Leaflet + react-native-webview** 💻 (Simples)
- **Pros**: Muito leve, fácil integrar, totalmente gratuito
- **Cons**: Roda em webview (menos performático)
- **Custo**: R$ 0
- **Instalação**: `npm install leaflet react-native-webview`

```tsx
const htmlString = `
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    </head>
    <body>
      <div id="map" style="height: 100vh;"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map').setView([38.7100, -9.1410], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      </script>
    </body>
  </html>
`;

<WebView source={{ html: htmlString }} />
```

---

## 4. **Google Maps (com crédito gratuito)** 🔵 (Melhor qualidade)
- **Pros**: Mapas mais detalhados, routing melhor, Places API melhor
- **Cons**: Precisa de cartão de crédito, pode sair caro
- **Custo**: R$ 0 (USD 200/mês grátis por 12 meses, depois USD $7/1000 requisições)
- **Instalação**: `npm install react-native-maps`

```tsx
<MapView provider="google" />
```

**Crédito Google grátis:**
- Novo projeto: USD $200/mês grátis por 12 meses
- Depois renova ou paga conforme uso

---

## 5. **Tomtom** 🟥 (Alternativa comercial)
- **Pros**: Muito bom, rotas precisas
- **Cons**: Caro, não recomendado para MVP
- **Custo**: USD $0.50 por 1000 requisições
- **Instalação**: `npm install @tomtom-international/maps-sdk-for-web`

---

## 6. **HERE Maps** 🟨 (Alternativa comercial)
- **Pros**: Ótima qualidade, routing excelente
- **Cons**: Caro para MVP
- **Custo**: USD $0.25 por 1000 requisições
- **Instalação**: Complexa

---

## 7. **Apple Maps** 🍎 (iOS apenas)
- **Pros**: Integrado em iOS, gratuito
- **Cons**: Apenas iOS, menos funcionalidades
- **Custo**: R$ 0
- **Instalação**: Nativo iOS

---

## 📊 Comparação Rápida

| Opção | Qualidade | Custo | Facilidade | Recomendação |
|-------|-----------|-------|-----------|-------------|
| OSM | ⭐⭐⭐ | 🟢 R$ 0 | ⭐⭐⭐⭐⭐ | ✅ MVP Inicial |
| Mapbox | ⭐⭐⭐⭐ | 🟢 R$ 0 (200k/mês) | ⭐⭐⭐⭐ | ✅ MVP+ (Recomendado) |
| Leaflet | ⭐⭐⭐ | 🟢 R$ 0 | ⭐⭐⭐⭐⭐ | ✅ MVP Simples |
| Google | ⭐⭐⭐⭐⭐ | 🔴 USD $7/1k req | ⭐⭐⭐ | ⚠️ Pós-MVP |
| Tomtom | ⭐⭐⭐⭐⭐ | 🔴 USD $0.50/1k | ⭐⭐ | ❌ Caro |
| HERE | ⭐⭐⭐⭐⭐ | 🔴 USD $0.25/1k | ⭐⭐ | ❌ Caro |

---

## 🎯 Minha Recomendação para você

### **MVP (Agora)**
Use **OSM** (já implementado) - grátis, simples, suficiente para testar

### **MVP+ (Próximo release)**
Migre para **Mapbox** - melhor visual, ainda gratuito, 200k requests/mês dá para muitos usuários

### **Produção (Depois)**
Se crescer muito: considere Google Maps (USD $200/mês grátis pelos 1º 12 meses)

---

## 🚀 Como Testar Cada Uma

### **Testar Mapbox agora:**
1. Crie conta em https://account.mapbox.com
2. Copie seu token público
3. Vou integrar pro você!

### **Testar Leaflet:**
Vou integrar em uma webview simples

### **Voltar para OSM:**
Deixa como está (atual)

---

## Qual você prefere? 🤔

**Opção A:** Continuar com **OSM** (grátis, funcional)
**Opção B:** Migrar para **Mapbox** (melhor visual, ainda grátis)
**Opção C:** Usar **Leaflet** em webview (mais leve)
**Opção D:** Implementar **Google Maps** (melhor qualidade, mas pago)

Qual prefere para o MVP? 🎯
