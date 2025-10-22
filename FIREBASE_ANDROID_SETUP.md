# 🔧 Configurar Firebase para Android

Este guia cobre os 4 passos do Firebase Console para configurar seu app Android.

---

## 📱 Informações do App Android

```
Nome do pacote: com.pocketguideapp
Apelido do app: Meu app Android
```

> **Nota:** Para Expo, o package name é definido no `app.json`

---

## ✅ Passo 1: Registrar App

No Firebase Console (https://console.firebase.google.com/project/pocketguide-bf350):

1. **Clique em "Adicionar app"** → **Android**
2. Preencha:
   - **Nome do pacote do Android:** `com.pocketguideapp` (ou veja `app.json` para confirmar)
   - **Apelido do app:** `Meu app Android` (qualquer nome, é apenas para referência)
3. **Clique em "Registrar app"**

### Encontrar o Package Name

Se não souber o package name exato, verifique no `app.json`:

```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE
grep -A 5 "android" app.json
```

Deve retornar algo como:
```json
"android": {
  "package": "com.pocketguideapp",
  ...
}
```

---

## 📥 Passo 2: Download do google-services.json

### O que é?

`google-services.json` é um arquivo que contém as credenciais do Firebase para Android.

### Download

1. **Firebase Console** → **Seu app Android** → **Configuração**
2. **Clique em "google-services.json"** (botão de download)
3. Salve o arquivo em:
   ```
   /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE/android/app/google-services.json
   ```

### Estrutura esperada:

```
your-project/
├── android/
│   ├── app/
│   │   ├── google-services.json  ← AQUI
│   │   ├── build.gradle
│   │   └── ...
│   ├── build.gradle
│   └── ...
```

### Verificar se está no lugar certo

```bash
ls -la android/app/google-services.json
```

Deve retornar algo como:
```
-rw-r--r-- 1 user user 2048 Oct 22 03:15 android/app/google-services.json
```

---

## 🔌 Passo 3: Adicionar SDK do Firebase

Para Expo, geralmente o SDK já está incluído. Mas se precisar configurar manualmente:

### Opção A: Managed Expo (Recomendado)

Com Expo (que é o caso), Firebase já está configurado. Basta:

```bash
npm install firebase
npx expo prebuild --clean
```

### Opção B: Build Nativo (EAS Build)

Se usar **EAS Build** para gerar APK/AAB:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Fazer login
eas login

# Inicializar projeto
eas build:configure

# Build para Android
eas build --platform android
```

Após rodar esses comandos, o `google-services.json` será automaticamente incluído no build.

---

## 📋 Passo 4: Próximas Etapas

Após configuração básica, faça:

### 1. Habilitar Google Sign-In

```bash
# Firebase Console → Autenticação → Primeiros passos → Google
# ✅ Ativar Google
# ✅ Configurar email de suporte
# ✅ Salvar
```

### 2. Adicionar SHA-1 (Importante para Android)

Android requer uma "Digital Fingerprint" (SHA-1) do seu certificado de debug.

**Obter SHA-1:**

```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Procure por `SHA1:` na saída. Exemplo:
```
SHA1: AB:CD:EF:12:34:56:78:90:...
```

**Registrar no Firebase:**

1. Firebase Console → Seu app Android → Configuração
2. Role até **Impressão digital do certificado SHA-1**
3. Clique em **Adicionar impressão digital**
4. Cole o SHA-1 completo (sem os dois-pontos)
5. **Salvar**

### 3. Configurar OAuth Credentials

1. Firebase Console → Autenticação → Configurações
2. Role até **Android**
3. Adicione seu app (package + SHA-1)
4. Clique em **Salvar**

### 4. Adicionar Credenciais OAuth do Google

Se não tiver Client ID do Google ainda:

```bash
# Ir para Google Cloud Console
# https://console.cloud.google.com/apis/credentials
# Criar credencial → OAuth 2.0 → Android
# Adicionar package name e SHA-1
```

---

## 🚀 Testar Android

Depois de tudo configurado:

```bash
# Opção 1: Emulador Android
npm run android

# Opção 2: EAS Build (gera APK real)
eas build --platform android --local

# Opção 3: Preview no Expo Go
npm start
# Escanear QR code com Expo Go
```

---

## 📂 Estrutura Final Esperada

```
project/
├── android/
│   ├── app/
│   │   ├── google-services.json  ✅
│   │   ├── build.gradle
│   │   └── src/
│   │       └── main/
│   │           ├── AndroidManifest.xml
│   │           └── java/...
│   ├── build.gradle
│   └── gradle/...
├── app.json                      ✅ (com android.package)
├── eas.json                      (se usar EAS Build)
├── firebase.ts                   ✅
├── .env                          ✅
└── package.json                  ✅
```

---

## 🐛 Troubleshooting

### Erro: "API key not valid"

```bash
# Sua API Key deve estar em .env como:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_...

# Verificar se está carregando:
./verify-firebase.sh
```

### Erro: "com.google.android.gms not found"

```bash
# Rodar prebuild
npx expo prebuild --clean

# Ou limpar cache
npm install
rm -rf node_modules/.cache
```

### SHA-1 não registrado

```bash
# Fazer login no Firebase com a mesma conta Google
# Registrar SHA-1 do debug.keystore CORRETO
# Esperar ~15 minutos para propagar
```

### google-services.json em lugar errado

```bash
# Verificar localização correta:
ls -la android/app/google-services.json

# Ou se estiver em root do Android:
ls -la android/google-services.json

# Mover se necessário:
mv android/google-services.json android/app/
```

---

## ✅ Checklist Final

- [ ] App registrado no Firebase Console
- [ ] `google-services.json` baixado e em `android/app/`
- [ ] SHA-1 do debug.keystore registrado no Firebase
- [ ] Google Sign-In habilitado em Autenticação
- [ ] Package name correto em `app.json`
- [ ] Variáveis de ambiente em `.env`
- [ ] Firebase SDK instalado (`npm install firebase`)
- [ ] Prebuild realizado (`npx expo prebuild --clean`)
- [ ] App testado no emulador Android

---

## 📚 Referências

- [Firebase Console](https://console.firebase.google.com/)
- [Expo Firebase Docs](https://docs.expo.dev/guides/using-firebase/)
- [Android Firebase Setup](https://firebase.google.com/docs/android/setup)
- [Google Cloud Console](https://console.cloud.google.com/)

