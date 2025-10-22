# 🔧 Configuração das APIs - Pocket Guide

## ✅ Firebase - CONFIGURADO ✓

As chaves do Firebase já foram adicionadas ao `.env`:
```
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pocketguide-bf350
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pocketguide-bf350.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pocketguide-bf350.appspot.com
```

---

## 🔑 Google Maps API - PRÓXIMO

### Passo 1: Ir para Google Cloud Console
1. Acesse https://console.cloud.google.com
2. Selecione o projeto **pocketguide-bf350** (ou crie um novo)

### Passo 2: Ativar Google Maps API
1. No menu, procure por **APIs & Services** → **Library**
2. Procure por **Maps SDK for Android**
3. Clique e ative a API
4. Faça o mesmo para **Maps SDK for iOS** e **Maps JavaScript API**

### Passo 3: Criar Chave API
1. Vá em **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **API Key**
3. Uma chave será gerada
4. Copie e cole no `.env`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

---

## 🤖 Google Gemini API - PRÓXIMO

### Passo 1: Ativar Gemini API
1. No Google Cloud Console, vá para **APIs & Services** → **Library**
2. Procure por **Generative Language API**
3. Clique em **Enable**

### Passo 2: Criar Chave de API
1. Vá em **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **API Key**
3. Copie a chave e adicione ao `.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
```

---

## 🔐 Google OAuth - PRÓXIMO

### Passo 1: Configurar OAuth Consent Screen
1. No Google Cloud Console, vá para **APIs & Services** → **OAuth consent screen**
2. Selecione **External** como tipo de usuário
3. Preencha:
   - **App name**: Pocket Guide
   - **User support email**: seu_email@gmail.com
   - **Developer contact**: seu_email@gmail.com
4. Clique em **Save and Continue**

### Passo 2: Criar Credenciais OAuth
1. Vá para **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

#### Para Web:
1. Selecione **Web application**
2. Nome: "Pocket Guide Web"
3. Em **Authorized redirect URIs**, adicione:
   - `http://localhost:19006`
   - `http://localhost:8081`
4. Clique em **Create**
5. Copie o **Client ID** e coloque no `.env`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=sua_web_client_id
```

#### Para iOS:
1. Selecione **iOS**
2. Nome: "Pocket Guide iOS"
3. Bundle ID: `host.exp.exponent` (padrão Expo)
4. Copie o **Client ID**:

```env
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=sua_ios_client_id
```

#### Para Android:
1. Selecione **Android**
2. Nome: "Pocket Guide Android"
3. Package name: `com.pocketguide` (ou seu próprio)
4. SHA-1 certificate fingerprint: (execute o comando abaixo)

```bash
# Para obter o SHA-1, execute:
cd android && ./gradlew signingReport
# Ou use a chave de debug:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

5. Copie o **Client ID**:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=seu_android_client_id
```

---

## 📋 Checklist Final

- [ ] Firebase configurado ✅
- [ ] Google Maps API ativada
- [ ] Gemini API ativada
- [ ] OAuth Consent Screen configurado
- [ ] Web Client ID obtido
- [ ] iOS Client ID obtido
- [ ] Android Client ID obtido
- [ ] Todas as chaves adicionadas ao `.env`

---

## 🚀 Teste Rápido

Depois de configurar todas as chaves, execute:

```bash
npm start
```

Depois escaneie o QR code no **Expo Go** (Android) ou câmera (iOS).

---

## ⚠️ Notas de Segurança

- **NUNCA** commit o `.env` no Git (já está no `.gitignore`)
- **NUNCA** compartilhe suas API keys
- Use variáveis de ambiente diferentes para dev/prod
- Rotacione as chaves regularmente

---

## 🆘 Problemas Comuns

### "Invalid API Key for Google Maps"
- Verifique se a chave foi criada corretamente
- Verifique se o Maps API está ativado
- Aguarde 5 minutos para a chave ativar

### "Authentication failed for Gemini"
- Verifique se a Generative Language API está ativada
- Confirme que você está usando a chave correta

### "OAuth Error"
- Verifique o Bundle ID/Package name
- Confirme que o Client ID está correto
- Certifique-se de que o OAuth consent screen foi configurado

---

Pronto! Com essas configurações, seu app estará 100% funcional! 🎯
