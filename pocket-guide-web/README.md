# 📱 Pocket Guide Web

Aplicação web para planejamento de viagens com IA usando React, TypeScript e Vite.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Abra http://localhost:5174 no navegador.

### Build
```bash
npm run build
```

---

## 📚 Documentação

### 📖 Para Novos Desenvolvedores
1. Leia a documentação na raiz: `../README.md`
2. Veja [SETUP.md](../docs/SETUP.md) para configuração
3. Consulte [ARCHITECTURE.md](../docs/ARCHITECTURE.md) para entender a estrutura

### 🔧 Documentação Recente (30/10/2025)

Documentação sobre as últimas funcionalidades e fixes:

- **[AUTOCOMPLETE_FIXED.md](../docs/POCKET_GUIDE_WEB/AUTOCOMPLETE_FIXED.md)** - API Mapbox corrigida para retornar resultados
- **[MAPBOX_API_FIX.md](../docs/POCKET_GUIDE_WEB/MAPBOX_API_FIX.md)** - Análise técnica do fix de geocoding
- **[DATE_VALIDATION_IMPLEMENTATION.md](../docs/POCKET_GUIDE_WEB/DATE_VALIDATION_IMPLEMENTATION.md)** - Validação de datas implementada

### 📚 Histórico
Para referência de soluções anteriores, veja [docs/POCKET_GUIDE_WEB/HISTORY/](../docs/POCKET_GUIDE_WEB/HISTORY/)

---

## ✨ Status Atual

| Feature | Status |
|---------|--------|
| Trip Creation | ✅ Funcional |
| Autocomplete de Cidades | ✅ Funcional (API Mapbox + Banco Local) |
| Date Validation | ✅ Implementado |
| i18n (PT/EN/ES) | ✅ Implementado |
| Dark Mode | ✅ Implementado |
| Offline Support | ✅ Implementado |
| Auth Persistente | ✅ Implementado |

---

## 🏗️ Arquitetura

```
src/
├── components/        # Componentes React reutilizáveis
├── screens/          # Páginas da aplicação
├── services/         # Serviços (API, geocoding, etc)
├── store/            # Estado global (Zustand)
├── hooks/            # Custom hooks
├── types/            # Definições TypeScript
├── utils/            # Utilitários
└── i18n/             # Internacionalização
```

---

## 🔑 Variáveis de Ambiente

Crie `.env.local` baseado em `.env.example`:

```env
# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# APIs
VITE_MAPBOX_API_KEY=...
VITE_GEMINI_API_KEY=...
VITE_UNSPLASH_API_KEY=...
```

---

## 🧪 Testes

```bash
# Executar testes
npm run test

# Com cobertura
npm run test:coverage
```

---

## 🚀 Deploy

Veja [DEPLOYMENT.md](../docs/DEPLOYMENT.md) para instruções de deploy em produção.

---

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação em `../docs/` ou crie uma issue no GitHub.

---

**Última atualização:** 30 de outubro de 2025
