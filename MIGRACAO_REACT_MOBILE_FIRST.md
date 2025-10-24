# 🚀 Plano de Migração: React Native → React Web (Mobile-First)

**Data**: 24 de outubro de 2025  
**Status**: 📋 PLANEJAMENTO  
**Escopo**: Migração completa do Pocket Guide  
**Estimativa**: 7-10 dias (desenvolvimento integral)

---

## 📊 Inventário Atual (React Native)

### Estrutura Existente
```
src/
├── screens/           (6 telas)
│   ├── LoginScreen.tsx
│   ├── OnboardingQuiz.tsx
│   ├── HomeScreen.tsx
│   ├── CreateTripScreen.tsx
│   ├── TripDetailScreen.tsx
│   └── MapDayScreen.tsx
│
├── components/        (10 componentes)
│   ├── AttractionCard.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── DatePickerCalendar.tsx
│   ├── ErrorBoundary.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── MapViewer.tsx
│   └── TripCard.tsx
│
├── services/          (9 serviços)
│   ├── firebase.ts .................. ✅ REUTILIZÁVEL (100%)
│   ├── geminiItinerary.ts ........... ✅ REUTILIZÁVEL (100%)
│   ├── googleMaps.ts ............... ✅ REUTILIZÁVEL (100%)
│   ├── graphhopper.ts .............. ✅ REUTILIZÁVEL (100%)
│   ├── graphhopperRoutes.ts ........ ✅ REUTILIZÁVEL (100%)
│   ├── itineraryGenerator.ts ....... ✅ REUTILIZÁVEL (100%)
│   ├── logger.ts ................... ✅ REUTILIZÁVEL (100%)
│   ├── mapbox.ts ................... ✅ REUTILIZÁVEL (100%)
│   └── nominatim.ts ................ ✅ REUTILIZÁVEL (100%)
│
├── store/             (Zustand stores) - ✅ REUTILIZÁVEL (100%)
├── hooks/             (Custom hooks) - ✅ REUTILIZÁVEL (100%)
├── types/             (TypeScript) - ✅ REUTILIZÁVEL (100%)
├── schemas/           (Zod validation) - ✅ REUTILIZÁVEL (100%)
├── utils/             (Helpers) - ✅ REUTILIZÁVEL (100%)
├── theme/             (Design system) - ⚠️ PRECISA ADAPTAÇÃO
└── animations/        (Animations) - ⚠️ PRECISA ADAPTAÇÃO
```

### Dependências Atuais
```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "~54.0.17",
  "firebase": "^10.7.0",
  "zustand": "4.4.7",
  "@react-navigation/native": "^6.1.18",
  "typescript": "~5.9.2"
}
```

---

## 🎯 Estratégia de Migração (Fases)

### **FASE 1: Setup Vite + Base (2-3 horas)**

#### 1.1 Criar Novo Projeto Vite
```bash
npm create vite@latest pocket-guide-web -- --template react-ts
cd pocket-guide-web
npm install
```

#### 1.2 Instalar Dependências Essenciais
```bash
npm install \
  react-router-dom@6.20.0 \
  zustand@4.4.7 \
  firebase@10.7.0 \
  axios@1.6.0 \
  tailwindcss@3.3.0 \
  clsx@2.0.0 \
  zod@4.1.12

npm install --save-dev \
  typescript@5.9.2 \
  @types/react@19.1.10 \
  @types/react-dom@19.1.10 \
  @tailwindcss/forms@0.5.6 \
  @tailwindcss/typography@0.5.9
```

#### 1.3 Configurar Vite
- Criar `vite.config.ts` com:
  - React plugin
  - JSX transform
  - Build otimizado para mobile-first
  - Environment variables
  - Alias paths (@/components, @/services, etc)

#### 1.4 Configurar Tailwind
- `tailwind.config.ts` com mobile-first breakpoints
- `src/index.css` com directives Tailwind
- Custom theme colors (usar palet design system)
- Mobile-first responsive classes

#### 1.5 Setup TypeScript
- Copiar `tsconfig.json` (adaptar para web)
- `tsconfig.app.json` para app code
- `tsconfig.node.json` para config files

---

### **FASE 2: Copiar Business Logic (1-2 horas)**

#### 2.1 Estrutura de Diretórios
```bash
cp -r src/services ./new-project/src/
cp -r src/store ./new-project/src/
cp -r src/hooks ./new-project/src/
cp -r src/types ./new-project/src/
cp -r src/schemas ./new-project/src/
cp -r src/utils ./new-project/src/
```

#### 2.2 Adaptar Services (Mínimas mudanças)
- `firebase.ts` ✅ Funciona 100% igual (Firebase é agnóstico de plataforma)
- `geminiItinerary.ts` ✅ Funciona 100% igual (puro HTTP)
- `graphhopper.ts` ✅ Funciona 100% igual (puro HTTP)
- `nominatim.ts` ✅ Funciona 100% igual (puro HTTP)
- `logger.ts` ✅ Funciona 100% igual

#### 2.3 Adaptar Stores
- Zustand stores funcionam 100% igual em React web
- AsyncStorage → localStorage (ou usar Zustand persist no browser)
- Sem mudanças necessárias

#### 2.4 Adaptar Types & Schemas
- TypeScript interfaces ✅ Funcionam 100% igual
- Zod schemas ✅ Funcionam 100% igual
- Sem mudanças necessárias

---

### **FASE 3: Reescrever Componentes (4-5 horas)**

#### 3.1 Estratégia de Rewrite

**React Native:**
```tsx
import { View, Text, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  content: { marginBottom: 12 }
});

export const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meus Roteiros</Text>
      {/* conteúdo */}
    </ScrollView>
  );
};
```

**React Web (Tailwind):**
```tsx
import clsx from 'clsx';

export const HomeScreen = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      <h1 className="text-3xl font-semibold mb-4">Meus Roteiros</h1>
      {/* conteúdo */}
    </div>
  );
};
```

#### 3.2 Componentes a Reescrever

| Componente | RN Linhas | Web Linhas | Esforço | Status |
|-----------|----------|-----------|--------|--------|
| **Button.tsx** | 80 | 50 | 30 min | 🔴 TODO |
| **Input.tsx** | 120 | 60 | 45 min | 🔴 TODO |
| **Card.tsx** | 70 | 40 | 30 min | 🔴 TODO |
| **Badge.tsx** | 50 | 30 | 20 min | 🔴 TODO |
| **LoadingSpinner.tsx** | 60 | 40 | 20 min | 🔴 TODO |
| **ErrorBoundary.tsx** | 100 | 100 | 45 min | 🔴 TODO |
| **AttractionCard.tsx** | 150 | 100 | 1 hour | 🔴 TODO |
| **TripCard.tsx** | 180 | 120 | 1.5 hours | 🔴 TODO |
| **MapViewer.tsx** | 200 | 150 | 2 hours | 🔴 TODO |
| **DatePickerCalendar.tsx** | 250 | 100 | 2 hours | 🔴 TODO |

**Total Componentes**: ~10 horas de rewrite

#### 3.3 Mapeamento Direto

| React Native | React Web |
|-------------|-----------|
| `View` | `<div>` |
| `Text` | `<span>` ou `<p>` |
| `ScrollView` | `<div overflow-y-auto>` |
| `FlatList` | `<ul>` + `.map()` |
| `TouchableOpacity` | `<button>` |
| `TextInput` | `<input>` |
| `SafeAreaView` | `<div className="px-4">` |
| `Modal` | `<dialog>` |
| `Image` | `<img>` |
| `StatusBar` | CSS/meta tags |
| `StyleSheet` | Tailwind classes |

#### 3.4 Componentes que Mudam

**Maps (React Native Maps → Google Maps API):**
```tsx
// React Native
import MapView from 'react-native-maps';

// React Web
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';

npm install @react-google-maps/api
```

**Date Picker (React Native → HTML5):**
```tsx
// React Native
import DateTimePicker from '@react-native-community/datetimepicker';

// React Web
<input type="date" className="..." />
<input type="time" className="..." />
```

---

### **FASE 4: Reescrever Screens (5-6 horas)**

#### 4.1 Estratégia de Routing

**React Native (React Navigation):**
```tsx
const Stack = createNativeStackNavigator();
<Stack.Navigator>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Home" component={HomeScreen} />
</Stack.Navigator>
```

**React Web (React Router v6):**
```tsx
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/login" element={<LoginScreen />} />
  <Route path="/home" element={<HomeScreen />} />
  <Route path="/trips/:id" element={<TripDetailScreen />} />
  <Route path="/trips/:id/day/:day" element={<MapDayScreen />} />
</Routes>
```

#### 4.2 Screens a Converter

| Screen | RN Linhas | Web Linhas | Esforço | Lógica Reutilizável |
|--------|----------|-----------|--------|-------------------|
| **LoginScreen.tsx** | 120 | 100 | 1 hour | 95% (só UI) |
| **OnboardingQuiz.tsx** | 200 | 180 | 1.5 hours | 95% |
| **HomeScreen.tsx** | 180 | 150 | 1.5 hours | 95% |
| **CreateTripScreen.tsx** | 300 | 250 | 2 hours | 95% |
| **TripDetailScreen.tsx** | 250 | 200 | 2 hours | 95% |
| **MapDayScreen.tsx** | 280 | 250 | 2.5 hours | 95% |

**Total Screens**: ~10 horas de rewrite

#### 4.3 Exemplo: LoginScreen

**React Native:**
```tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold mb-4">Bem-vindo!</Text>
      <TouchableOpacity onPress={() => signIn()}>
        <Text>Google Sign-In</Text>
      </TouchableOpacity>
    </View>
  );
};
```

**React Web:**
```tsx
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Bem-vindo!</h1>
        <button 
          onClick={() => signIn()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Google Sign-In
        </button>
      </div>
    </div>
  );
};
```

---

### **FASE 5: Adaptar Theme & Animations (2-3 horas)**

#### 5.1 Design System (Theme)

**Novo theme.ts (Tailwind):**
```typescript
export const theme = {
  colors: {
    primary: '#3B82F6',      // blue-500
    secondary: '#10B981',    // emerald-500
    danger: '#EF4444',       // red-500
    warning: '#F59E0B',      // amber-500
    success: '#10B981',      // emerald-500
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    // Dark mode
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textSecondary: '#CBD5E1',
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  typography: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
  },
};
```

#### 5.2 Tailwind Config

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
```

#### 5.3 Animações (CSS)

**animations.css:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in { animation: fadeIn 0.3s ease-in; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
```

#### 5.4 Dark Mode com Context

```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    isDark ? html.classList.add('dark') : html.classList.remove('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

### **FASE 6: Criar App Principal (1-2 horas)**

#### 6.1 App.tsx

```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingQuiz } from './screens/OnboardingQuiz';
import { HomeScreen } from './screens/HomeScreen';
import { CreateTripScreen } from './screens/CreateTripScreen';
import { TripDetailScreen } from './screens/TripDetailScreen';
import { MapDayScreen } from './screens/MapDayScreen';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginScreen />} />
            
            {/* Protected Routes */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <OnboardingQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-trip" 
              element={
                <ProtectedRoute>
                  <CreateTripScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trips/:id" 
              element={
                <ProtectedRoute>
                  <TripDetailScreen />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/trips/:id/day/:day" 
              element={
                <ProtectedRoute>
                  <MapDayScreen />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

#### 6.2 main.tsx

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### 6.3 index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Pocket Guide - Roteiros de viagem com IA" />
    <meta name="theme-color" content="#3B82F6" />
    <link rel="manifest" href="/manifest.json" />
    <title>Pocket Guide</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

### **FASE 7: Setup PWA & Deployment (2-3 horas)**

#### 7.1 Manifest.json (PWA)

```json
// public/manifest.json
{
  "name": "Pocket Guide",
  "short_name": "Pocket Guide",
  "description": "Roteiros de viagem com IA",
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

#### 7.2 Service Worker

```typescript
// public/service-worker.js
const CACHE_NAME = 'pocket-guide-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/index.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

#### 7.3 Vite Config para PWA

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pocket Guide',
        short_name: 'Pocket Guide',
        // ...
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
```

---

## 📅 Timeline Estimado

| Fase | Tarefa | Duração | Cumulative |
|------|--------|---------|-----------|
| 1 | Setup Vite + Tailwind | 3h | 3h |
| 2 | Copiar Business Logic | 1.5h | 4.5h |
| 3 | Reescrever Componentes | 10h | 14.5h |
| 4 | Reescrever Screens | 10h | 24.5h |
| 5 | Theme & Animations | 3h | 27.5h |
| 6 | App Principal | 2h | 29.5h |
| 7 | PWA & Deployment | 3h | 32.5h |
| 🧪 | Testing & Debugging | 4-5h | 36.5-37.5h |
| 🎨 | Polish & UX | 2-3h | 38.5-40.5h |

**Total: 5-6 dias (trabalho integral)**

---

## ✅ Checklist de Execução

### Pré-Migração
- [ ] Backup completo do repositório
- [ ] Criar branch `feature/react-web-migration`
- [ ] Documentar todas as dependências
- [ ] Mapear URLs/routing

### Fase 1: Setup
- [ ] Criar projeto Vite
- [ ] Instalar dependências
- [ ] Configurar TypeScript
- [ ] Configurar Tailwind
- [ ] Configurar ESLint + Prettier

### Fase 2: Business Logic
- [ ] Copiar services/
- [ ] Copiar store/
- [ ] Copiar hooks/
- [ ] Copiar types/
- [ ] Copiar schemas/
- [ ] Copiar utils/
- [ ] Testar imports

### Fase 3: Componentes
- [ ] Button.tsx
- [ ] Input.tsx
- [ ] Card.tsx
- [ ] Badge.tsx
- [ ] LoadingSpinner.tsx
- [ ] ErrorBoundary.tsx
- [ ] AttractionCard.tsx
- [ ] TripCard.tsx
- [ ] MapViewer.tsx
- [ ] DatePickerCalendar.tsx

### Fase 4: Screens
- [ ] LoginScreen.tsx
- [ ] OnboardingQuiz.tsx
- [ ] HomeScreen.tsx
- [ ] CreateTripScreen.tsx
- [ ] TripDetailScreen.tsx
- [ ] MapDayScreen.tsx

### Fase 5: Theme & Animations
- [ ] Configurar ThemeContext
- [ ] CSS animations
- [ ] Dark mode
- [ ] Responsividade

### Fase 6: App Principal
- [ ] App.tsx (routing)
- [ ] main.tsx
- [ ] index.html
- [ ] Auth context
- [ ] Protected routes

### Fase 7: PWA & Deploy
- [ ] manifest.json
- [ ] Service worker
- [ ] Build otimizado
- [ ] Deploy para Vercel/Netlify

### Testing
- [ ] Login flow
- [ ] Onboarding
- [ ] Create trip
- [ ] View trips
- [ ] Offline mode
- [ ] Dark mode
- [ ] Mobile responsiveness

---

## 🎯 Próximos Passos

### **Opção A: Começar Agora** (Recomendado)
```bash
# 1. Criar novo projeto
npm create vite@latest pocket-guide-web -- --template react-ts
cd pocket-guide-web

# 2. Instalar dependências
npm install react-router-dom zustand firebase axios tailwindcss clsx zod

# 3. Começar com Fase 1
```

### **Opção B: Setup Auxiliado**
Eu posso criar toda a estrutura Vite + Tailwind pronta para você colar código

### **Opção C: Migração Paralela**
Manter React Native funcionando enquanto construímos React web

---

## 💡 Benefícios Esperados (Pós-Migração)

✅ **Sem dependências nativas** - Zero TurboModuleRegistry errors  
✅ **Build rápido** - <2s hot reload vs 30-60s React Native  
✅ **Codebase único** - Web + Mobile + Desktop same code  
✅ **PWA offline** - Service workers melhor que AsyncStorage  
✅ **Deployment fácil** - Vercel/Netlify (1 comando)  
✅ **SEO** - Buscadores conseguem indexar  
✅ **Acessibilidade** - HTML semântico + ARIA  
✅ **Performance** - Lighthouse 90+ esperado  
✅ **Manutenibilidade** - Menos complexidade de platform  
✅ **Time skills** - Toda comunidade React consegue manter  

---

## ⚠️ Riscos & Mitigation

| Risco | Probabilidade | Impacto | Mitigation |
|------|--------------|--------|-----------|
| Mapa menos performático | Média | Médio | Google Maps JS API é otimizado |
| Perda funcionalidade | Baixa | Alto | 95% lógica é reutilizável |
| Geolocalização limitada | Baixa | Baixo | Browser geolocation API é suficiente |
| Build maiores | Baixa | Baixo | Code splitting + tree shaking |
| Compatibilidade browser | Baixa | Médio | Suportar últimas 2 versões |

---

## 🚀 Comece Agora?

Você quer que eu:

1. **[A] Configure o projeto Vite completo** pronto para começar?
2. **[B] Reescreva os componentes um por um** com você?
3. **[C] Crie um exemplo end-to-end** (LoginScreen até HomeScreen)?
4. **[D] Setup PWA + deployment** no Vercel?

**Qual é sua próxima ação?** 🎯
