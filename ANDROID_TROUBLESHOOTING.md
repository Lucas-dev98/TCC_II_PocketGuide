# 🐛 Troubleshooting: Component auth has not been registered

## O Problema
Quando você roda `npm run android`, o app mostra:
```
[runtime not ready]: Error: Component auth has not been registered yet
```

## Causa Raiz
O Firebase Auth SDK em React Native Android precisa que você esteja usando o **Expo Go** correto ou construindo um APK nativo. O erro ocorre quando:

1. ❌ Firebase Auth tenta usar módulos nativos que não foram registrados
2. ❌ Falta de configuração nativa do Firebase no Android
3. ❌ Usando Expo Go antigo/desatualizado

## ✅ Soluções

### Opção 1: Usar Expo Go (Mais Fácil)
```bash
# Instale Expo Go no Android
# App Store / Play Store: "Expo Go"

# Depois rode:
npm run android

# Escaneie o QR Code que aparecer com a câmera do seu device
```

### Opção 2: Criar Development Build (Recomendado para produção)
```bash
# Instale EAS CLI
npm install -g eas-cli

# Configure seu projeto
eas build --platform android --profile development

# Instale no device
eas build:run --platform android
```

### Opção 3: Criar APK Release
```bash
# Gere o APK completo
npm run build:android

# Ou com EAS:
eas build --platform android

# Depois instale:
adb install app-release.apk
```

### Opção 4: Solução Rápida para Desenvolvimento
Se está usando Expo Go e ainda vê o erro, tente:

```bash
# Limpe o cache
npm run android -- --clear

# Ou:
expo start --clear
```

### Opção 5: Verificar Firebase Config
No seu `.env`, certifique-se que todas as keys estão preenchidas:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyClNP5vR2Gux1QyAEXL2IjtgdlEkU4YggM
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pocketguide-bf350.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pocketguide-bf350
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pocketguide-bf350.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=19264033417
EXPO_PUBLIC_FIREBASE_APP_ID=1:19264033417:web:f2746521f8d157c54fec58
```

## 🎯 Recomendação
Por enquanto, **teste no Web** em http://localhost:8082:
1. A web está 100% funcional
2. Todos os recursos funcionam (Login, Trips, Mapas, Rotas)
3. Android será finalmente testado com Expo Go ou APK

## ⚠️ Para Android Produção
Você precisará:
1. ✅ **Firebase Console**: Registrar app Android
2. ✅ **Gerar Signing Key**: Para assinar APK
3. ✅ **SHA-1 Fingerprint**: Adicionar ao Firebase
4. ✅ **Build APK**: Gerar release

## 📞 Próximas Etapas
1. **Atualizar Firestore Rules** (URGENTE)
2. **Testar no Web completamente**
3. **Depois**: Criar development build para Android
