# 🚀 SETUP - Configuração Inicial

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

---

## 1️⃣ Instalação

### Clone o repositório
```bash
git clone https://github.com/Lucas-dev98/TCC_II_PocketGuide.git
cd TCC_II_PocketGuide
```

### Instale as dependências
```bash
cd pocket-guide-web
npm install
```

---

## 2️⃣ Variáveis de Ambiente

Crie o arquivo `.env` em `pocket-guide-web/`:

```env
# Firebase
VITE_FIREBASE_API_KEY=sua_chave_firebase
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_DATABASE_URL=https://seu_projeto.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Gemini API
VITE_GEMINI_API_KEY=sua_chave_gemini

# Mapbox
VITE_MAPBOX_API_KEY=pk.sua_chave_mapbox
```

### Como obter as chaves:

1. **Firebase:**
   - Acesse https://console.firebase.google.com
   - Crie um projeto ou selecione existente
   - Em Project Settings, copie as credenciais

2. **Gemini API:**
   - Acesse https://aistudio.google.com/app/apikey
   - Crie uma chave de API

3. **Mapbox:**
   - Acesse https://account.mapbox.com/auth/signin/
   - Vá para API Tokens
   - Crie um novo token

---

## 3️⃣ Desenvolvimento

### Iniciar servidor local
```bash
npm run dev
```

Acesse: **http://localhost:5173**

### Outros comandos úteis
```bash
npm run build       # Build para produção
npm run preview     # Preview do build
npm run type-check  # Verificar tipos TypeScript
npm run lint        # ESLint
npm run test        # Rodar testes
```

---

## 4️⃣ Estrutura de Pastas

```
pocket-guide-web/
├── src/
│   ├── screens/          # Telas React
│   ├── components/       # Componentes reutilizáveis
│   ├── services/         # Serviços (Firebase, Gemini, etc)
│   ├── store/            # Estado global (Zustand)
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Funções auxiliares
│   ├── index.css         # Estilos Tailwind
│   └── main.tsx          # Entrada da app
├── public/               # Arquivos estáticos
├── dist/                 # Build otimizado
├── .env                  # Variáveis de ambiente
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 5️⃣ Troubleshooting

### Problema: Porta 5173 já em uso
```bash
# Use outra porta
npm run dev -- --port 3000
```

### Problema: Módulos não encontrados
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Problema: Erros TypeScript
```bash
npm run type-check
```

---

**Próximo:** Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a arquitetura
