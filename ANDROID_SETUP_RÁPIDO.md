# 🔧 Setup Firebase Android - Resumo Rápido

## Seu App

```
Projeto Firebase: pocketguide-bf350
Package name: com.lucasbastos.pocketguide
App: Meu app Android
```

---

## 4 Passos Simples

### 1️⃣ Registrar App Android

```
Firebase Console:
https://console.firebase.google.com/project/pocketguide-bf350

1. Clique em "Adicionar app" → Android
2. Nome do pacote: com.lucasbastos.pocketguide
3. Apelido: Meu app Android
4. Clique em "Registrar app"
```

### 2️⃣ Baixar google-services.json

```
1. Clique no botão "google-services.json"
2. Download automático

3. Coloque em:
   android/app/google-services.json

4. Verificar:
   ls -la android/app/google-services.json
```

### 3️⃣ Adicionar SDK Firebase

```bash
# Já está instalado, mas confirme:
npm install firebase

# Preparar para Android:
npx expo prebuild --clean
```

### 4️⃣ Próximas Etapas

#### A) Habilitar Google Sign-In

```
Firebase Console → Autenticação:
1. Clique em "Primeiros passos"
2. Procure por "Google"
3. Clique em "Google" → "Ativar"
4. Configure e-mail de suporte
5. Salve
```

#### B) Registrar SHA-1

```bash
# Obter SHA-1:
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android | grep SHA1

# Exemplo de saída:
# SHA1: AB:CD:EF:12:34:56:78:90:...

# No Firebase:
# 1. Android app → Configuração
# 2. "Impressão digital SHA-1"
# 3. Adicionar: ABCDEF1234567890... (sem os dois-pontos)
```

#### C) Configurar OAuth (Automático)

```
Firebase configura automaticamente quando você:
1. Registra o package name
2. Registra o SHA-1
3. Habilita Google Sign-In
```

---

## ✅ Verificar Tudo

```bash
# Script helper:
chmod +x check-android-setup.sh
./check-android-setup.sh

# Output esperado:
# ✅ Package name encontrado: com.lucasbastos.pocketguide
# ✅ Encontrado em: android/app/google-services.json
# ✅ SHA-1 encontrado: AB:CD:EF:...
```

---

## 🚀 Testar

```bash
# Opção 1: Emulador
npm run android

# Opção 2: EAS Build (APK real)
eas build --platform android --local

# Opção 3: Expo Go
npm start
# Escanear QR code
```

---

## 🐛 Problemas Comuns

| Erro | Solução |
|------|---------|
| `API key not valid` | Verificar `.env` com `./verify-firebase.sh` |
| `com.google.android.gms not found` | Rodar `npx expo prebuild --clean` |
| SHA-1 rejeitado | Remover dois-pontos e tentar novamente |
| `google-services.json` não encontrado | Baixar novamente do Firebase Console |

---

## 📚 Documentos Completos

- **FIREBASE_CREDENTIALS.md** - Setup geral
- **FIREBASE_ANDROID_SETUP.md** - Setup detalhado Android
- **FIREBASE_API_KEY_INVÁLIDA.md** - Debug da API Key

---

## 📋 Estrutura Esperada

```
android/app/
├── google-services.json  ✅ IMPORTANTE
├── build.gradle
├── src/
└── ...
```

Pronto! 🎉
