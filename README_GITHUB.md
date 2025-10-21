# 🎯 Pocket Guide - AI-Powered Travel Itinerary App

Um aplicativo mobile React Native com Expo que gera roteiros de viagem personalizados usando IA do Gemini, integrado com Firebase e Google Maps.

## ✨ Funcionalidades Principais

- 🔐 **Autenticação Firebase**: Login com Google OAuth
- 🤖 **IA Generativa**: Gemini AI para gerar itinerários personalizados
- 📍 **Mapas Interativos**: Integração com Google Maps
- 💾 **Persistência Local**: AsyncStorage + Zustand para offline-first
- 📱 **Multiplataforma**: Web, iOS e Android com Expo
- 🎨 **UI Responsiva**: React Native + React Navigation
- ⚡ **TypeScript**: Tipagem forte em toda a aplicação

## 🏗️ Arquitetura

```
src/
├── screens/           # 6 telas principais
│   ├── LoginScreen
│   ├── OnboardingQuiz
│   ├── HomeScreen
│   ├── CreateTripScreen
│   ├── TripDetailScreen
│   └── MapDayScreen
├── components/        # Componentes reutilizáveis
├── services/          # Firebase, Gemini, Google Maps APIs
├── hooks/             # useAuth custom hook
├── store/             # Zustand store (trips, user data)
├── types/             # TypeScript interfaces
└── utils/             # Helpers e utilitários
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 16
- npm >= 8
- Expo CLI: `npm install -g expo-cli`

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Lucas-dev98/TCC_II_PocketGuide.git
cd TCC_II_PocketGuide

# Instale as dependências
npm install --legacy-peer-deps

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais
```

### Configurar `.env`

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google APIs
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
```

### Rodando a Aplicação

```bash
# Iniciar o Metro Bundler (Expo)
npm start

# Opção 1: Abrir no Expo Go (Android/iOS)
# Escaneie o QR code com Expo Go app

# Opção 2: Testar na Web
npm run web

# Opção 3: Abrir no Android (requer SDK)
# Press 'a' no terminal Expo
```

## 📦 Stack Tecnológico

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 18.3.1 | UI Framework |
| React Native | 0.76.9 | Mobile Framework |
| Expo | ~51.0.0 | Runtime/CLI |
| TypeScript | 5.9.x | Tipagem |
| Firebase | 10.7.0 | Backend/Auth |
| Zustand | 4.4.7 | State Management |
| React Navigation | 6.x | Routing |
| AsyncStorage | 1.24.0 | Local Storage |

## 🔑 Configurar APIs Externas

### 1️⃣ Firebase Setup
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative autenticação (Google)
4. Configure Firestore Database
5. Copie as credenciais para `.env`

### 2️⃣ Google Cloud Setup
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative APIs: Maps, Places, Geocoding
4. Crie chaves de API
5. Configure OAuth 2.0 para seu app

### 3️⃣ Gemini API Setup
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma chave de API
3. Copie para `.env` (EXPO_PUBLIC_GEMINI_API_KEY)

## 📱 Screens Implementadas

| Tela | Descrição |
|------|-----------|
| **LoginScreen** | Autenticação com Google |
| **OnboardingQuiz** | Quiz para preferências de viagem |
| **HomeScreen** | Dashboard com viagens recentes |
| **CreateTripScreen** | Formulário para criar nova viagem |
| **TripDetailScreen** | Detalhes da viagem e itinerário |
| **MapDayScreen** | Mapa interativo do dia |

## 🧪 Testando Localmente

```bash
# Verificar tipos TypeScript
npm run type-check

# Limpar cache e rebuildar
npm start -- --clear

# Testar na web
npm run web
```

## 📚 Documentação Adicional

- [GUIA_CONFIGURACAO_ENV.md](./GUIA_CONFIGURACAO_ENV.md) - Setup detalhado de variáveis de ambiente
- [MODELO_DADOS_FIRESTORE.md](./MODELO_DADOS_FIRESTORE.md) - Estrutura de dados
- [PROMPTS_GEMINI.md](./PROMPTS_GEMINI.md) - Prompts para geração de itinerários
- [TELAS_IMPLEMENTADAS.md](./TELAS_IMPLEMENTADAS.md) - Detalhes de cada tela

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react-native-reanimated/plugin'"
- Certifique-se de rodar `npm install --legacy-peer-deps`

### Erro: "TurboModuleRegistry.getEnforcing"
- Limpe o cache: `rm -rf node_modules .expo .metro && npm install`

### Porta 8081 já em uso
- `npx kill-port 8081` ou use `npm start -- --port 8082`

### Problemas com Firebase
- Verifique se `.env` tem credenciais corretas
- Confirme que Firestore está habilitado
- Verifique regras de segurança (permitir leitura/escrita)

## 🎓 Estrutura de Dados (Firestore)

```
users/
├── {userId}
│   ├── email: string
│   ├── name: string
│   └── preferences: {...}

trips/
├── {tripId}
│   ├── userId: string
│   ├── destination: string
│   ├── days: Trip
│   ├── budget: number
│   └── createdAt: timestamp

attractions/
└── {attractionId}
    ├── tripId: string
    ├── name: string
    ├── address: string
    └── rating: number
```

## 🚢 Deploy

### Deploy na Web com Vercel
```bash
# Criar build web
npm run web

# Fazer deploy na Vercel
vercel
```

### Build Android/iOS
```bash
# Usar EAS Build (Expo Cloud)
npm install -g eas-cli
eas login
eas build --platform android
```

## 📄 License

MIT License - veja LICENSE.md

## 👤 Autor

**Lucas Bastos**
- Email: l.o.bastos@live.com
- GitHub: [@Lucas-dev98](https://github.com/Lucas-dev98)
- Projeto: TCC II - Pocket Guide App

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ✅ Checklist de Funcionalidades

- ✅ Autenticação Firebase com Google
- ✅ Quiz de onboarding para preferências
- ✅ Geração de itinerários com Gemini AI
- ✅ Visualização de itinerários em lista
- ✅ Integração com Google Maps
- ✅ Persistência offline com AsyncStorage
- ✅ State management com Zustand
- ✅ UI responsiva com React Navigation
- ✅ TypeScript em 100% do código
- ✅ Hospedagem no GitHub

---

**Status**: ✅ Pronto para produção  
**Última atualização**: Outubro 2025  
**Versão**: 1.0.0
