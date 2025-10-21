# 🔑 Guia Completo: Como Obter Chaves do Firebase

## Pré-requisitos
- ✅ Conta Google (Gmail)
- ✅ Navegador web

## 🚀 Passo 1: Criar um Projeto no Firebase Console

### 1.1 Acesse o Firebase Console
1. Abra: **https://console.firebase.google.com/**
2. Faça login com sua conta Google
3. Clique em **"Criar um novo projeto"** ou **"Add project"**

### 1.2 Configure o Novo Projeto
1. **Nome do Projeto**: Digite `Pocket Guide` (ou qualquer nome)
2. Aceite os termos
3. Clique em **"Continuar"**

### 1.3 Google Analytics (Opcional)
1. Pode ativar ou desativar
2. Clique em **"Criar projeto"**
3. Aguarde 1-2 minutos enquanto cria...

## 🎯 Passo 2: Obter as Chaves de Configuração

### 2.1 Acesse as Configurações do Projeto
1. No Firebase Console, clique no **ícone de engrenagem** (⚙️) no canto superior esquerdo
2. Selecione **"Configurações do Projeto"**
3. Você verá uma aba **"Geral"** aberta

### 2.2 Localize a Seção "Seus Aplicativos"
Role para baixo até encontrar **"Seus aplicativos"**

### 2.3 Adicione um Aplicativo Web
1. Clique em **"</>` (Web)**
2. Digite o apelido: `Pocket Guide Web`
3. **NÃO** marque "Também configure o Firebase Hosting"
4. Clique em **"Registrar aplicativo"**

### 2.4 Copie as Credenciais
Você verá um bloco de código JavaScript. **Procure por esta estrutura:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123xyz"
};
```

**Copie cada valor:**

```
EXPO_PUBLIC_FIREBASE_API_KEY = AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID = seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
EXPO_PUBLIC_FIREBASE_APP_ID = 1:123456789:web:abc123xyz
```

## 🔐 Passo 3: Habilitar Autenticação com Google

### 3.1 Acesse Authentication
1. No menu esquerdo do Firebase, clique em **"Authentication"**
2. Clique na aba **"Entrar com"**

### 3.2 Ative Google Sign-In
1. Procure por **"Google"** na lista
2. Clique para expandir
3. **Ative o toggle** (turn it ON)
4. Selecione seu **"Email de suporte ao projeto"** (seu Gmail)
5. Clique em **"Salvar"**

## 🌍 Passo 4: Obter Google OAuth Credentials

### 4.1 Vá para Google Cloud Console
1. Abra: **https://console.cloud.google.com/**
2. Selecione seu projeto (deve ser o mesmo do Firebase)
3. No menu esquerdo, vá para **"APIs e Serviços"** → **"Credenciais"**

### 4.2 Crie uma Credencial OAuth 2.0
1. Clique em **"+ Criar Credenciais"** no topo
2. Selecione **"ID do cliente OAuth 2.0"**
3. Se pedir para configurar a tela de consentimento OAuth primeiro:
   - Clique em **"Configurar tela de consentimento"**
   - Selecione **"Externo"**
   - Preencha o nome do app: `Pocket Guide`
   - Clique em **"Salvar e continuar"**

### 4.3 Configure a Credencial OAuth
1. Escolha o tipo: **"Aplicativo da Web"**
2. Nome: `Pocket Guide Web`
3. Em **"URIs autorizados de redirecionamento"**, adicione:
   ```
   http://localhost:19006
   http://localhost:19000
   exp://localhost:19000
   ```
4. Clique em **"Criar"**

### 4.4 Copie o Client ID
Uma janela aparecerá com:
- **Client ID** (para web)
- **Client Secret**

Copie o **Client ID** - você usará como:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = seu_client_id_aqui
```

## 📱 Passo 5: Obter Google OAuth para Android

### 5.1 Crie outra credencial para Android
1. Volte a **"Credenciais"**
2. Clique em **"+ Criar Credenciais"** novamente
3. Selecione **"ID do cliente OAuth 2.0"**
4. Escolha **"Aplicativo Android"**

### 5.2 Configure para Android
1. **Nome**: `Pocket Guide Android`
2. **Nome do pacote**: `com.pocketguide.app`
3. **SHA-1 fingerprint**: 
   - Se não tiver, deixe em branco por enquanto
   - Você pode gerar depois com: `keytool -list -v -keystore ~/.android/debug.keystore`
4. Clique em **"Criar"**

### 5.3 Copie o Client ID Android
Você verá um Client ID para Android:
```
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID = seu_client_id_android
```

## 🎛️ Passo 6: Obter Google Maps API Key

### 6.1 Ative Google Maps API
1. No Google Cloud Console, vá para **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Maps SDK for Android"**
3. Clique e ative
4. Faça o mesmo para **"Maps SDK for iOS"**

### 6.2 Obtenha a API Key
1. Volte para **"Credenciais"**
2. Você verá uma **"API Key"** automática criada
3. Clique nela e copie
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSy...
```

## 🤖 Passo 7: Obter Gemini API Key

### 7.1 Acesse Google AI Studio
1. Abra: **https://aistudio.google.com/apikey**
2. Clique em **"Criar API Key"**
3. Você verá sua chave gerada

### 7.2 Copie a Chave
```
EXPO_PUBLIC_GEMINI_API_KEY = AIzaSy...
```

---

## 📝 Preencher o .env

Agora que você tem todas as chaves, edite o arquivo `.env`:

```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE
nano .env
```

E preencha com seus valores reais:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_XXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pocket-guide-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pocket-guide-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pocket-guide-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefg123456

# Google APIs
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy_YYYYYYYYYYYY
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy_ZZZZZZZZZZZZ

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-web.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-ios.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-android.apps.googleusercontent.com
```

## 🧪 Testar com as Chaves

Depois de preencher o `.env`, reinicie o Expo:

```bash
npm start
```

Pressione:
- `w` para web
- `a` para android
- `i` para iOS

## ✅ Pronto!

Agora seu app está totalmente configurado com Firebase, Google OAuth e Gemini API! 🎉

---

## 🆘 Troubleshooting

### ❌ "Erro: Firebase não inicializa"
- Verifique se todas as chaves estão corretas no `.env`
- Certifique-se de que Google Sign-In está habilitado no Firebase
- Reinicie o Expo com: `npm start -- --clear`

### ❌ "Google Sign-In não funciona"
- Confira se o `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` está correto
- Se no emulador, teste primeiro no web (`npm run web`)

### ❌ "Gemini AI não gera viagens"
- Confirme que o `EXPO_PUBLIC_GEMINI_API_KEY` está correto
- Verifique se a API está habilitada no Google AI Studio

---

**Precisa de ajuda?** Reporte o erro específico que vê no terminal do Expo!
