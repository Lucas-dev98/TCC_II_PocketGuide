# 🔑 Configurar Firebase Credentials

## Problema Atual
```
Error: auth/api-key-not-valid.-please-pass-a-valid-api-key.
```

A chave no `.env` é um **placeholder** e não uma chave real do Firebase.

## Como Obter as Credenciais Corretas

### 1. Acessar Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione o projeto: **pocketguide-bf350**

### 2. Obter Web API Key
- Clique em **⚙️ Configurações do Projeto** (canto superior esquerdo)
- Vá para a aba **Apps**
- Procure por seu aplicativo Web (deve ter uma tag `</>`)
- Copie o **Firebase SDK config** completo

Deve parecer assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDo_yJ5pK8qL2mN9oP3rS6tU1vW4xY7zA", // ← VALOR REAL
  authDomain: "pocketguide-bf350.firebaseapp.com",
  projectId: "pocketguide-bf350",
  storageBucket: "pocketguide-bf350.appspot.com",
  messagingSenderId: "116935012681",
  appId: "1:116935012681:web:a1b2c3d4e5f6g7h8"
};
```

### 3. Atualizar `.env`

Abra o arquivo `.env` e substitua:

```properties
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDo_yJ5pK8qL2mN9oP3rS6tU1vW4xY7zA
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pocketguide-bf350.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pocketguide-bf350
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pocketguide-bf350.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=116935012681
EXPO_PUBLIC_FIREBASE_APP_ID=1:116935012681:web:a1b2c3d4e5f6g7h8
```

**Importante:** Use os valores reais da sua config do Firebase, não o placeholder acima!

### 4. Verificar Credenciais

```bash
# Ver o que está sendo carregado
grep EXPO_PUBLIC_FIREBASE .env
```

### 5. Habilitar Google Sign-In

No Firebase Console:

1. **Aba "Autenticação"**
2. Clique em **"Primeiros passos"**
3. Ative **"Google"**
4. Configure uma conta de suporte (seu email)
5. Salve

### 6. Adicionar OAuth Credentials (Android)

Se testar no Android:

1. Na aba **"Autenticação"** → **"Configurações"**
2. Role para baixo até **"Android"**
3. Adicione a SHA-1 do seu certificado:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Copie o **SHA-1** e cole no Firebase

## Verificação

Após atualizar, você verá logs como:

```
🔧 Firebase Config Keys: {
  apiKey: '✅ Present',
  authDomain: '✅ Present',
  projectId: '✅ Present'
}
```

## Debugging

Se ainda houver erro:

1. **Teste a chave manualmente:**
   ```bash
   curl -X POST \
     "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"returnSecureToken":true}'
   ```

2. **Verifique restrições de chave:**
   - Firebase Console → APIs & Services → Credentials
   - Procure por sua API Key
   - Verifique se está restrita a "Android apps", "iOS apps", ou "HTTP referrers"
   - Se estiver muito restrita, remova as restrições ou crie uma nova chave sem restrições

3. **Limpe cache:**
   ```bash
   npx expo start --clear
   ```

## Próximos Passos

1. ✅ Obter credenciais corretas do Firebase
2. ✅ Atualizar `.env`
3. ✅ Rodar `npm start`
4. ✅ Testar Google Sign-In no web (http://localhost:8082)
5. ✅ Testar no Android Emulator

---

**Nota:** Nunca comite credenciais reais no Git! O `.env` deve estar no `.gitignore` (já está configurado).
