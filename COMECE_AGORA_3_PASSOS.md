# 🚀 Comece AGORA! - Guia Rápido de 3 Passos

## ⏱️ Tempo Total: 15 minutos

---

## PASSO 1️⃣: Configurar Firebase (5-10 minutos)

### 1. Abra o Firebase Console
```
https://console.firebase.google.com/
```

### 2. Crie um Projeto
- Clique em "Criar projeto"
- Nome: `Pocket Guide`
- Clique "Criar"

### 3. Adicione um App Web
- Clique em `</>` (Web)
- Nome: `Pocket Guide Web`
- Registre o app

### 4. Copie as Credenciais
Você verá um código assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy_XXXX",
  authDomain: "pocket-guide-xxxxx.firebaseapp.com",
  projectId: "pocket-guide-xxxxx",
  storageBucket: "pocket-guide-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc"
};
```

### 5. Edite o Arquivo `.env`

No seu computador, abra:
```
/home/lucasbastos/TCC/TCC_II_POCKET_GUIDE/.env
```

E preencha com os valores do Firebase:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_XXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=pocket-guide-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=pocket-guide-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=pocket-guide-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc

# Você pode deixar estes com valores teste por enquanto:
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=test_key
EXPO_PUBLIC_GEMINI_API_KEY=test_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=test_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=test_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=test_client_id
```

**Salve o arquivo** (Ctrl+S ou Cmd+S)

---

## PASSO 2️⃣: Rodar a Aplicação (1 minuto)

Abra um terminal e execute:

```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE
npm start
```

Você verá algo assim:

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▀▀▄▄ ▀█ █ ▄▄▄▄▄ █
█ █   █ ███▄█  ▀███ █   █ █
█ █▄▄▄█ ██▄▀▄▀ ██▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ █ ▀▄▀ ▀ █▄▄▄▄▄▄▄█
█▄▄█  ▀▄▀▀ ▄▄▀▀█▀ █▄█▀█▀▀▄█
██▄▀▀▀▀▄ ▄▀  ▀█▄▄▀▀███▄▀▀ █
█ █▀▀█▀▄▄▀ █▄▄▀▄▀█ ▄▀▀█▀ ██
█ ▄█▀█ ▄▄ ▄▄ ▄▄▀▄▀█▄▀ ▄▀  █
█▄█▄▄▄▄▄█▀█ ▀▀    ▄▄▄  ▄▀▄█
█ ▄▄▄▄▄ ██▀▀▄▀  █ █▄█ ██▀▄█
█ █   █ █ ▀▀█▄██▄▄▄  ▄ █  █
█ █▄▄▄█ █▀█▄█ █ █▄▀▀▀▄█   █
█▄▄▄▄▄▄▄█▄▄▄█▄▄▄▄▄▄▄▄▄███▄█

› Metro waiting on exp://172.20.18.70:8081
```

**✅ Perfeito! O Expo está rodando!**

---

## PASSO 3️⃣: Testar no Android (1 minuto)

### Opção A: Usar Expo Go (RECOMENDADO)

1. **No seu emulador/telefone**, abra o app **Expo Go**
   - Se não tiver: Google Play Store → Busque "Expo Go"

2. **No terminal**, pressione `s`
   ```
   › Press s │ show QR code
   ```

3. Você verá o QR code aparecer

4. **No Expo Go**, clique em "Scan QR Code"

5. **Escaneie** o QR code

6. **Aguarde 30-60 segundos** enquanto o app carrega

7. 🎉 **Seu app aparecerá!**

### Opção B: Testar no Navegador

Pressione `w` no terminal:
```
› Press w │ open web
```

Abrirá automaticamente: http://localhost:8081

---

## 📱 O Que Você Verá

Quando o app carregar, você verá:

1. **LoginScreen** 
   - Botão "Sign in with Google"
   - Campo para entrar

2. **HomeScreen** (após login)
   - Lista de viagens
   - Botão para criar nova viagem

3. **CreateTripScreen**
   - Formulário para criar viagem
   - Integração com IA Gemini

4. **Outras telas**
   - Detalhes da viagem
   - Mapa do dia
   - E mais!

---

## 🔄 Após o Primeiro Teste

### Fazer Mudanças no Código

1. Edite qualquer arquivo em `src/`
2. **Salve** (Ctrl+S)
3. O app vai **recarregar automaticamente** no emulador/web!

### Parar o Expo

Pressione `Ctrl+C` no terminal

### Iniciar Novamente

```bash
npm start
```

---

## ⚠️ Se Algo Não Funcionar

### "QR code não funciona"
- Copie a URL (ex: `exp://172.20.18.70:8081`)
- No Expo Go, escolha "Enter URL manually"
- Cole a URL

### "App aparece em branco"
- Pressione `r` no terminal para recarregar
- Espere 30 segundos

### "Não consigo escanear"
- Verifique se você está na **mesma rede WiFi**
- Tente outra vez

### "Erro no terminal"
- Leia o erro (ele mostra o arquivo e linha)
- Corrija o código
- Salve

---

## 🎯 Comandos Úteis

| Comando | O que faz |
|---------|----------|
| `npm start` | Inicia o Expo |
| `npm run web` | Abre no navegador |
| `r` (no terminal) | Recarrega o app |
| `s` (no terminal) | Mostra QR code |
| `w` (no terminal) | Abre web |
| `Ctrl+C` | Parar o Expo |

---

## ✅ Checklist

- [ ] Criei projeto no Firebase
- [ ] Copiei as chaves do Firebase
- [ ] Preencheu o arquivo `.env`
- [ ] Rodei `npm start`
- [ ] Abri Expo Go no emulador
- [ ] Escaneei o QR code
- [ ] Vi o app aparecer!

---

## 🎉 Pronto!

Você agora tem uma **aplicação React Native completamente funcional** rodando em seu Android! 

**Próximas ações:**
1. ✅ Teste todas as telas
2. ✅ Faça uma viagem
3. ✅ Teste a IA Gemini
4. ✅ Explore o código
5. ✅ Faça suas modificações!

---

## 📚 Documentação Completa

- `README.md` - Visão geral do projeto
- `GUIA_FIREBASE_PASSO_A_PASSO.md` - Firebase detalhado
- `COMO_TESTAR_NO_ANDROID.md` - Todos os detalhes
- `RESUMO_FINAL_SETUP.md` - Checklist final

---

**GitHub:** https://github.com/Lucas-dev98/TCC_II_PocketGuide

**Bom coding!** 🚀✨
