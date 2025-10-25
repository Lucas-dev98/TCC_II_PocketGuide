# 🌍 Pocket Guide - AI Travel Itinerary App

**Status:** ✅ **PRODUCTION READY**

Uma aplicação web de planejamento de viagens alimentada por IA que gera itinerários personalizados usando Google Gemini e exibe locais em mapa interativo com Mapbox.

---

## 📊 **Estrutura do Projeto (LIMPA)**

```
pocket-guide/
├── pocket-guide-web/              # ✅ APLICAÇÃO REACT (ATIVA)
│   ├── src/
│   │   ├── screens/               # Telas (Login, Home, CreateTrip, TripDetail)
│   │   ├── components/            # Componentes reutilizáveis
│   │   ├── services/              # Firebase, Gemini, Mapbox
│   │   ├── store/                 # Zustand state management
│   │   └── utils/                 # Helpers
│   ├── dist/                      # Build otimizado
│   ├── package.json
│   └── vite.config.ts
│
├── archived_react_native/         # 📦 CÓDIGO ANTIGO (React Native - Descontinuado)
├── docs_archived/                 # 📚 DOCUMENTAÇÃO ANTIGA
├── .env                           # Variáveis de ambiente
├── .gitignore                     # Git ignore rules
└── README.md                      # Este arquivo
```

---

## 🚀 **Quick Start**

### **1. Instalação**
```bash
cd pocket-guide-web
npm install
```

### **2. Configurar .env**
Criar arquivo `pocket-guide-web/.env`:
```env
VITE_FIREBASE_API_KEY=seu_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_dominio
VITE_GEMINI_API_KEY=sua_chave_gemini
VITE_MAPBOX_API_KEY=sua_chave_mapbox
```

### **3. Desenvolvimento**
```bash
npm run dev
```
Acesse: http://localhost:5173

### **4. Build para Produção**
```bash
npm run build
```

### **5. Deploy no Vercel**
```bash
vercel --prod
```
URL: https://pocket-guide-web.vercel.app

---

## ✨ **Funcionalidades**

- ✅ 🔐 Autenticação com Google Sign-In
- ✅ 🤖 Geração de Itinerários com AI (Gemini 2.0)
- ✅ 🗺️ Mapa Interativo com Mapbox GL
- ✅ 📍 Navegação de Atrações (próximo/anterior)
- ✅ 💾 Persistência com Firestore
- ✅ 📱 PWA - Funciona offline
- ✅ 🌙 Dark Mode
- ✅ 📱 Mobile-first Responsive Design

---

## 🛠️ **Stack Tecnológico**

- **Frontend:** React 19 + TypeScript 5.6 (strict mode)
- **Build:** Vite 5.x
- **Styling:** Tailwind CSS 3.4
- **Roteamento:** React Router v6
- **State:** Zustand
- **Backend:** Firebase (Auth + Firestore)
- **IA:** Google Gemini 2.0 Flash
- **Mapas:** Mapbox GL v3.16.0
- **PWA:** Service Worker + Workbox

---

## 📈 **Build Stats**

```
✅ TypeScript: 0 errors (strict mode)
✅ Modules: 1421 transformed
✅ Build time: ~45s
✅ CSS: 69.76 KiB (gzip: 11.08 KiB)
✅ Firebase: 432.17 KiB (gzip: 100.41 KiB)
✅ Main: 1,935 KiB (gzip: 533 KiB)
✅ PWA: 9 entries (2394 KiB)
```

---

## 📝 **Commits Recentes**

```
ef7382d - Feature: Sincronizar navegação do mapa
18670ea - Feature: Navegação interativa (próximo/anterior)
650e7f5 - Fix: Corrigir mapeamento de lat/lng ✨
```

---

## 📦 **Arquivos Archivados**

O projeto foi limpo para manter apenas o React Web:

- **`archived_react_native/`** - React Native (descontinuado)
- **`docs_archived/`** - Documentação antiga (106 arquivos)

Podem ser deletados se não forem mais necessários.

---

## 🧪 **Testes**

```bash
npm run test              # Rodar testes
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run type-check       # Type checking
npm run lint             # ESLint
```

---

## 🌐 **URLs Importantes**

- **Produção:** https://pocket-guide-web.vercel.app
- **GitHub:** https://github.com/Lucas-dev98/TCC_II_PocketGuide
- **Vercel Dashboard:** https://vercel.com/lucas-bastos-projects-349d7c70/pocket-guide-web

---

**Última atualização:** 25 de outubro de 2025 ✅
