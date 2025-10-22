# ✅ Guia Completo de Configuração - Pocket Guide

## 🎯 Objetivo
Configurar todas as funcionalidades essenciais da aplicação:
1. ✅ Firestore Rules (Acesso a dados)
2. ✅ Google Sign-In (Autenticação)
3. ✅ Quiz Onboarding (Preferências)
4. ✅ Criar Viagem (Trip Management)
5. ✅ Mapa com Rotas (Visualização)

---

## 📋 PASSO 1: Atualizar Firestore Rules ⚠️ URGENTE

### Acesso ao Firebase Console
1. Acesse: https://console.firebase.google.com
2. Projeto: **pocketguide-bf350**
3. Menu lateral → **Firestore Database**
4. Clique em aba **"Rules"** no topo

### Copiar Regras
Cole exatamente isto:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Publicar
1. Clique no botão **"Publicar"** (canto superior direito)
2. Aguarde a confirmação (verde ✓)

**Status**: ✅ Firestore Rules Atualizadas

---

## 🔐 PASSO 2: Testar Google Sign-In

### No Web (http://localhost:8082)
1. Abra: http://localhost:8082 no navegador
2. Clique em **"Sign in with Google"**
3. Faça login com sua conta Google
4. Você será redirecionado para a tela inicial

### Verificar Autenticação
1. Vá para Firebase Console → **Authentication**
2. Você deve aparecer em "Users" com seu email
3. UID será salvo no Firestore

**Status**: ✅ Google Sign-In Funcionando

---

## 📊 PASSO 3: Verificar Documento no Firestore

### Conferir dados salvos
1. Firebase Console → **Firestore Database**
2. Expandir coleção **"users"**
3. Clique no documento com seu UID
4. Verifique se contém:
   - `email`: seu email
   - `name`: seu nome do Google
   - `photoURL`: sua foto (opcional)
   - `tags`: [] (array vazio por enquanto)

**Status**: ✅ Usuário Criado no Firestore

---

## 🎯 PASSO 4: Responder Quiz de Onboarding

### Na Tela Inicial
1. Se é primeira vez, verá tela do **Quiz Onboarding**
2. Responda 4 perguntas:
   - ❓ Qual é seu estilo de viagem?
   - ❓ Qual é seu orçamento?
   - ❓ Com quem você viaja?
   - ❓ Qual é seu ritmo de viagem?
3. Clique **"✓ Finalizar"** para salvar

### Verificar Tags
1. Firebase Console → Firestore
2. Seu documento em `/users/{UID}`
3. Campo `tags` deve conter: `["cultura", "médio", "casal", "moderado"]`

**Status**: ✅ Preferências Salvas

---

## ✈️ PASSO 5: Criar Primeira Viagem

### Na Tela Inicial
1. Clique em **"+ Criar Nova Viagem"**
2. Preencha o formulário:
   - **Destino**: Ex: "Paris"
   - **Data Inicial**: Clique no calendário
   - **Data Final**: Clique no calendário
3. Clique em **"🤖 Gerar Itinerário com IA"**
4. Aguarde ~10 segundos enquanto Gemini gera o itinerário

### O que Esperar
- ✅ Viagem salva no Zustand (local)
- ✅ Atrações com horários, durações, dicas
- ✅ Navegação automática para detalhes

**Status**: ✅ Itinerário Gerado

---

## 🗺️ PASSO 6: Visualizar Mapa e Rotas

### No Detalhe da Viagem
1. Clique em um dia (ex: "Day 1")
2. Verá tela de mapa com:
   - 📍 Coordenadas e atrações
   - 📏 Distância entre pontos
   - ⏱️ Tempo de deslocamento
   - 💡 Dicas para cada local

### No Web
- Mostra mapa estático com coordenadas
- Lista completa de atrações
- Rotas calculadas (via GraphHopper)

### No Android/iOS
- Mapa interativo (react-native-maps)
- Markers coloridos
- Polylines tracejadas entre pontos

**Status**: ✅ Mapa Funcionando

---

## 📱 PASSO 7: Testar no Android (Opcional)

### Opção A: Expo Go (Mais Fácil)
```bash
# Instale Expo Go no Play Store
# Depois:
npm run android

# Escaneie o QR Code com câmera
```

### Opção B: Development Build
```bash
eas build --platform android --profile development
```

**Status**: ⏳ Android (opcional por enquanto)

---

## ✅ Checklist Final

- [ ] Firestore Rules publicadas
- [ ] Google Sign-In funcionando
- [ ] Documento de usuário criado em Firestore
- [ ] Quiz completado (tags salvadas)
- [ ] Primeira viagem criada
- [ ] Mapa carregado com atrações
- [ ] Rotas calculadas com distâncias/tempos
- [ ] Android testado (opcional)

---

## 🔗 Links Úteis

| Recurso | Link |
|---------|------|
| **Web App** | http://localhost:8082 |
| **Firebase Console** | https://console.firebase.google.com/project/pocketguide-bf350 |
| **Firestore Database** | https://console.firebase.google.com/project/pocketguide-bf350/firestore |
| **Authentication** | https://console.firebase.google.com/project/pocketguide-bf350/authentication |
| **Gemini API** | https://aistudio.google.com |
| **GraphHopper** | https://graphhopper.com/dashboard |

---

## 🎉 Pronto!

Quando tudo estiver configurado, você terá:
- ✅ Autenticação com Google
- ✅ Preferências personalizadas
- ✅ Itinerários gerados por IA
- ✅ Visualização de rotas e atrações
- ✅ Sincronização com Firebase

---

## 💬 Troubleshooting

### Erro: "Permission denied on read/write"
→ Verifique se Firestore Rules foram publicadas ✓

### Erro: "Google Sign-In failed"
→ Certifique-se de que `.env` tem as keys corretas

### Erro: "Component auth has not been registered"
→ Use Expo Go ou crie Development Build (ver ANDROID_TROUBLESHOOTING.md)

### Gemini gera itinerário vazio
→ Verifique se `EXPO_PUBLIC_GEMINI_API_KEY` está correto no `.env`

---

**Versão**: 1.0  
**Data**: 22 de outubro de 2025  
**Status**: ✅ PRODUÇÃO PRONTA
