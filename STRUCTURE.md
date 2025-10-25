# 📁 Estrutura do Projeto - Pocket Guide

## Resumo da Reorganização

Este projeto foi **REORGANIZADO** para manter apenas o código React Web ativo, deixando arquivos legados organizados em diretórios separados.

---

## ✅ Diretório ATIVO

### `pocket-guide-web/` - **APLICAÇÃO PRINCIPAL**

A aplicação React web que está em **produção**.

```
pocket-guide-web/
├── src/
│   ├── screens/                    # Telas React
│   │   ├── LoginScreen.tsx         # Autenticação Google
│   │   ├── HomeScreen.tsx          # Lista de viagens
│   │   ├── CreateTripScreen.tsx    # Criar viagem (multi-step)
│   │   └── TripDetailScreen.tsx    # Detalhes + Mapa
│   ├── components/                 # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── MapboxMap.tsx           # Mapa interativo
│   │   └── [outros...]
│   ├── services/                   # Serviços integrados
│   │   ├── firebase.ts             # Config Firebase
│   │   ├── geminiItinerary.ts      # API Gemini
│   │   ├── itineraryGenerator.ts   # Lógica geração
│   │   └── [outros...]
│   ├── store/
│   │   └── tripsStore.ts           # Zustand (state)
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── utils/
│   │   └── [helpers...]
│   ├── index.css                   # Tailwind CSS
│   └── main.tsx                    # Entrada da app
├── public/
│   ├── icons/                      # Ícones PWA
│   └── [assets...]
├── dist/                           # Build otimizado (produção)
├── node_modules/                   # Dependências
├── .env                            # Variáveis ambiente
├── package.json                    # Dependências do web
├── tsconfig.json                   # Config TypeScript
├── vite.config.ts                  # Config Vite
└── README.md                       # Docs do web
```

**Para trabalhar aqui:**
```bash
cd pocket-guide-web
npm install
npm run dev
```

---

## 📦 Diretórios ARCHIVADOS

Estes diretórios contêm código legado e **NÃO** devem ser usados.

### `archived_react_native/`

Código antigo do **React Native** (descontinuado):

```
archived_react_native/
├── src/                    # Código React Native
├── App.tsx                 # Entrada React Native
├── app.json                # Expo config
├── babel.config.js         # Babel config
├── metro.config.js         # Metro bundler config
├── jest.config.js          # Jest config
├── .expo/                  # Expo cache
└── [outros...]
```

**Status:** ❌ **NÃO USE** - Desatualizado e descontinuado

---

### `docs_archived/`

Documentação antiga de desenvolvimento (106 arquivos):

```
docs_archived/
├── ACESSAR_AGORA.md
├── ANALISE_*.md
├── APP_*.md
├── CHECKLIST_*.md
├── DEPLOYMENT_*.md
├── SETUP_*.md
└── [106 arquivos de docs...]
```

**Status:** 📚 Referência histórica apenas

---

## 🎯 Comandos Principais

**Da raiz do projeto:**

```bash
# Instalação
npm run install:web

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
npm run test:coverage

# Deploy
npm run deploy
```

**Diretamente em pocket-guide-web:**

```bash
cd pocket-guide-web

# Dev
npm run dev

# Build
npm run build

# Deploy
vercel --prod
```

---

## 🌐 URLs

| Ambiente | URL |
|----------|-----|
| **Desenvolvimento** | http://localhost:5173 |
| **Produção** | https://pocket-guide-web.vercel.app |
| **GitHub** | https://github.com/Lucas-dev98/TCC_II_PocketGuide |

---

## 🔑 Variáveis de Ambiente

Arquivo: `pocket-guide-web/.env`

```env
# Firebase
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_DATABASE_URL=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_FIREBASE_MEASUREMENT_ID=xxx

# Gemini API
VITE_GEMINI_API_KEY=xxx

# Mapbox
VITE_MAPBOX_API_KEY=pk.xxx
```

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| **Build Size** | ~1,935 KiB (gzip: 533 KiB) |
| **TypeScript Errors** | 0 |
| **Build Time** | ~45s |
| **Modules** | 1,421 |
| **Last Update** | 25 de outubro de 2025 |

---

## ✅ Checklist de Limpeza

- ✅ React Native removido de `src/`
- ✅ Arquivos `.expo/` archivados
- ✅ Documentação legada separada
- ✅ `.gitignore` atualizado
- ✅ `package.json` raiz criado
- ✅ `README.md` atualizado
- ✅ `STRUCTURE.md` criado

---

## 🚀 Próximos Passos

1. ✅ Projeto limpo e organizado
2. ✅ React Web funcionando em produção
3. ⏳ Deploy automático no push (CI/CD)
4. ⏳ Testes unitários expandidos
5. ⏳ Análise de performance

---

**Última atualização:** 25 de outubro de 2025 ✅
