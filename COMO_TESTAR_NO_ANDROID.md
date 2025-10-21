# 🚀 Como Testar o Pocket Guide no Android

## ✅ Status Atual
- ✅ **Expo Server está rodando**
- ✅ **Metro Bundler compilou com sucesso**
- ✅ **Pronto para testar**

## 📱 Opção 1: Testar via Expo Go (RECOMENDADO)

### Passo 1: Abra o Expo Go no Emulador/Dispositivo
- Se não tiver, baixe do Google Play Store: **"Expo Go"**
- Abra o app

### Passo 2: Conecte ao Seu Computador
No terminal, rode:
```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE
npm start
```

### Passo 3: Escaneie o QR Code
- Pressione `s` no terminal para mostrar o QR code
- **OU** copie a URL que aparece (formato: `exp://xxx.xxx.xxx.xxx:8081`)
- No Expo Go, escolha "Scan QR code" e escaneie
- **OU** Cole a URL no campo "Enter URL manually"

### Passo 4: Aguarde o App Carregar
- O Metro Bundler preparará o app (pode levar 30-60 segundos)
- O app aparecerá no seu Android!

## 🌐 Opção 2: Testar no Navegador (Web)

```bash
npm run web
```

Abrirá automaticamente: `http://localhost:8081`

## 📊 Opção 3: Testar com Android Studio (Nativo)

Requer Android SDK configurado:

```bash
npm run android
```

## 🔧 Troubleshooting

### ❌ "Não consigo escanear o QR code"
- Verifique se você está na mesma rede WiFi
- Tente copiar a URL manualmente no Expo Go
- Pressione `s` no terminal para mostrar a URL

### ❌ "Expo Go não encontra o servidor"
- Verifique o endereço IP (deve ser o IP do seu computador)
- Abra o firewall se necessário
- Tente restartar o Expo: `Ctrl+C` e `npm start` novamente

### ❌ "Erro de módulos não encontrados"
- Certifique-se que `npm install` completou sem erros
- Delete `node_modules` e reinstale: `rm -rf node_modules && npm install`

### ❌ "LoginScreen está em branco"
- As variáveis de ambiente no `.env` podem estar ausentes
- A autenticação com Google pode estar desabilitada
- Teste primeiro sem login - pressione reload no Expo Go

## 📝 Componentes do App

O app possui:
1. **LoginScreen** - Tela de login com Google
2. **OnboardingQuiz** - Quiz para preferências
3. **HomeScreen** - Dashboard principal
4. **CreateTripScreen** - Criar nova viagem
5. **TripDetailScreen** - Detalhes da viagem
6. **MapDayScreen** - Mapa/Plano do dia

## 🎯 Teste Rápido (Sem Firebase)

Se não tiver Firebase configurado:
1. O app pode não fazer login
2. Mas consegue navegar pelas telas
3. Dados não serão salvos

## ✨ Próximas Ações

1. Escaneie o QR code no Expo Go
2. Veja o app em ação!
3. Teste todas as telas
4. Reporte qualquer erro

---

**Dúvidas?** Check the terminal logs - eles mostram exatamente o que está acontecendo!

**Expo está rodando em:** `http://localhost:8081`
