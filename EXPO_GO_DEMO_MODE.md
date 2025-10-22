# 📱 Expo Go Demo Mode - Testar sem Firebase Auth

## ⚠️ Problema
No Expo Go, Firebase Auth dá erro: "Component auth has not been registered yet"

Isso é **esperado** porque Expo Go não suporta módulos nativos do Firebase.

## ✅ Solução: 3 Opções

### OPÇÃO 1: Testar no WEB (MELHOR OPÇÃO AGORA)
```bash
npm run web
# Abre http://localhost:8081
# Funciona 100% com Firebase Auth
```

### OPÇÃO 2: Usar Expo Go com Demo Mode (Temporário)
1. Instale app "Expo Go" no Play Store/App Store
2. Execute:
```bash
npm run android  # ou ios
```
3. Escaneie o QR Code
4. **O app vai abrir sem autenticação (demo mode)**
5. Você verá os dados locais sem Firebase

### OPÇÃO 3: Criar Development Build (RECOMENDADO PARA PRODUÇÃO)
```bash
# Instale EAS CLI
npm install -g eas-cli

# Crie um development build
eas build --platform android --profile development

# Instale no seu device
eas build:run --platform android
```

---

## 🎯 Recomendação AGORA

**Faça o fluxo no WEB:**
1. Web: http://localhost:8081
2. Login com Google (✅ funciona)
3. Preencher Quiz (✅ funciona)
4. Criar viagem (✅ funciona)
5. **Ver mapa com coordenadas!** (✅ agora funciona com fix!)

**Depois de validar no WEB:**
- Opção 2: Testar demo mode no Expo Go
- Opção 3: Build release para produção

---

## 💡 Por que WEB agora?

- ✅ Autenticação com Firebase funciona 100%
- ✅ Sem dependências nativas problemáticas
- ✅ Mais rápido iterar
- ✅ Validar lógica do app

**Vamos começar pelo WEB! 🚀**
