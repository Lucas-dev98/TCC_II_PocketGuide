# 🔧 Guia Completo de Configuração do .env

## 1️⃣ FIREBASE CONFIGURATION

### Passo 1: Criar projeto no Firebase
1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Criar projeto"** ou **"Add project"**
3. Nome: `Pocket Guide`
4. Desabilite **Google Analytics** (opcional)
5. Clique em **"Criar projeto"**

### Passo 2: Obter as credenciais
1. Na página do projeto Firebase, clique em **"</>"** (Web)
2. Nome do app: `Pocket Guide Web`
3. Clique em **"Registrar app"**
4. Copie o objeto `firebaseConfig` que aparece

O objeto terá este formato:
```javascript
{
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
}
```

### Configure no .env:
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza... (copiar 'apiKey')
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com (copiar 'authDomain')
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto (copiar 'projectId')
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com (copiar 'storageBucket')
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789 (copiar 'messagingSenderId')
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456 (copiar 'appId')
```

---

## 2️⃣ GOOGLE APIs

### Para Google Maps API Key:
1. Acesse [https://console.cloud.google.com](https://console.cloud.google.com)
2. Selecione o projeto (crie um novo se não tiver)
3. Vá em **"APIs e Serviços"** → **"Credenciais"**
4. Clique em **"+ CRIAR CREDENCIAIS"** → **"Chave de API"**
5. Copie a chave gerada
6. **IMPORTANTE**: Restrinja a chave:
   - Clique na chave criada
   - Em "Restrições de aplicativo" escolha **"Aplicações Android e iOS"**
   - Em "Restrições de API" escolha **"Maps SDK for Android"** e **"Maps SDK for iOS"**

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza... (sua API key do Google Maps)
```

---

## 3️⃣ GEMINI API KEY

### Passo 1: Criar projeto no Google Cloud
1. Acesse [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Clique em **"Create API Key"**
3. Copie a chave gerada (ou use a chave do Google Cloud acima)

### Passo 2: Ativar Gemini API
1. No [Google Cloud Console](https://console.cloud.google.com)
2. Vá em **"APIs e Serviços"** → **"Biblioteca"**
3. Pesquise por **"Generative Language API"**
4. Clique em **"ATIVAR"**

```
EXPO_PUBLIC_GEMINI_API_KEY=AIza... (sua Gemini API key)
```

---

## 4️⃣ OAUTH CONFIGURATION (Google Sign-In)

### Para Web:
1. No [Google Cloud Console](https://console.cloud.google.com) → **"Credenciais"**
2. Clique em **"+ CRIAR CREDENCIAIS"** → **"ID do cliente OAuth"**
3. Selecione **"Aplicativo da Web"**
4. URIs autorizados de redirecionamento:
   - `http://localhost:8081/*`
   - `http://localhost:19006/*`
5. Clique em **"Criar"**
6. Copie o **"ID do cliente"**

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=abc123def456.apps.googleusercontent.com
```

### Para iOS:
1. Crie um novo ID do cliente OAuth tipo **"iOS"**
2. Bundle ID: `com.pocketguide.app` (ou seu bundle ID real)
3. Copie o ID do cliente

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=abc123def456.apps.googleusercontent.com
```

### Para Android:
1. Crie um novo ID do cliente OAuth tipo **"Android"**
2. Nome do pacote: `com.pocketguide.app` (ou seu package name real)
3. SHA-1 fingerprint: Deixe em branco por enquanto (será gerado depois pelo Expo)
4. Copie o ID do cliente

```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=abc123def456.apps.googleusercontent.com
```

---

## ✅ Seu .env Final Deve Parecer Com:

```properties
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxx...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=meu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=meu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=meu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Google APIs
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDxxx...
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDxxx...

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=abc123def456.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=abc123def456.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=abc123def456.apps.googleusercontent.com
```

---

## 🚨 IMPORTANTE:

⚠️ **NUNCA compartilhe seu `.env` com ninguém!**
⚠️ **NUNCA faça commit do `.env` no Git!**
✅ Adicionar `.env` ao `.gitignore` (já deve estar)

---

## 🧪 Testes Após Configurar:

1. Depois de configurar o `.env`, rode:
```bash
npm start
```

2. Escaneie o QR code no Expo Go

3. Verifique se a tela de login aparecer (sem erros de Firebase)

4. Teste o botão "Sign in with Google"

---

## ❓ Dúvidas Frequentes:

**P: Por que preciso de múltiplas chaves de OAuth?**
R: Uma para cada plataforma (Web, iOS, Android) - é uma restrição de segurança do Google.

**P: Preciso gerar SHA-1 fingerprint agora?**
R: Não agora, será gerado pelo Expo quando fizer o build nativo.

**P: Posso usar as mesmas credenciais em dev e produção?**
R: Sim, para desenvolvimento. Em produção, crie credenciais separadas.

**P: E se esquecer de alguma chave?**
R: O app não conseguirá autenticar ou acessar os serviços. Verifique os logs.
