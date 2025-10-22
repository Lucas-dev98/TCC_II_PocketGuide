# 🎯 Executar Checklist - Guia Interativo

## 📊 Status Geral

```
🔄 Iniciando checklist...
✅ Web Server: http://localhost:8081 (RODANDO)
✅ Firebase: Credenciais carregadas
❌ Firestore Rules: Precisa atualizar
⏳ Próximo: PASSO 1
```

---

## 🚀 PASSO 1: Acessar Firebase Console

### Tarefa
Abrir a página de Rules do Firestore

### Instruções

**Opção A: Link Direto**
```
Clique aqui (ou copie e abra no navegador):
https://console.firebase.google.com/project/pocketguide-bf350/firestore/rules
```

**Opção B: Manual**
1. Vá para: https://console.firebase.google.com/
2. Selecione projeto: **pocketguide-bf350**
3. Clique em **Firestore Database** (esquerda)
4. Clique na aba **Rules** (topo)

### O que você deve ver

```
┌────────────────────────────────────────────┐
│ Cloud Firestore                             │
├────────────────────────────────────────────┤
│ [Data] [Rules] [Indexes] [Usage]           │
├────────────────────────────────────────────┤
│                                             │
│ rules_version = '2';                       │
│ service cloud.firestore {                   │
│   match /databases/{database}/documents {  │
│     match /{document=**} {                  │
│       allow read, write: if false;         │ ← ISTO BLOQUEIA TUDO
│     }                                       │
│   }                                         │
│ }                                           │
│                                             │
└────────────────────────────────────────────┘
```

### ✅ Próximo: PASSO 2

---

## 🔧 PASSO 2: Editar Regras

### Tarefa
Copiar e colar a nova regra

### Instruções

1. **Clique no código** (para entrar em modo edição)
2. **Selecione TUDO:** `Ctrl+A`
3. **Delete:** `Delete` ou `Backspace`
4. **Cole isto:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### O que você deve ver

```
┌────────────────────────────────────────────┐
│ rules_version = '2';                       │
│ service cloud.firestore {                   │
│   match /databases/{database}/documents {  │
│     match /{document=**} {                  │
│       allow read, write: if                │
│         request.auth != null;              │ ← PERMITE AUTENTICADO
│     }                                       │
│   }                                         │
│ }                                           │
│                                             │
│ ✓ No errors (verde = correto!)            │
│ [Publish] ← Botão azul aparece             │
└────────────────────────────────────────────┘
```

### ✅ Próximo: PASSO 3

---

## 📤 PASSO 3: Publicar Regras

### Tarefa
Clicar botão Publish para aplicar mudanças

### Instruções

1. **Localize o botão "Publish"** (canto inferior direito, geralmente azul)
2. **Clique nele**
3. **Aguarde mensagem de sucesso:**

```
✅ Rules published successfully
```

### O que você deve ver

```
┌────────────────────────────────────────────┐
│ Publishing...                              │
│                                             │
│ ✅ Rules published successfully             │
│                                             │
│ Last modified: Oct 22, 2025, 6:52 AM UTC  │
└────────────────────────────────────────────┘
```

### ⏱️ Próximo: PASSO 4 (Aguardar)

---

## ⏳ PASSO 4: Aguardar Propagação

### Tarefa
Deixar as mudanças se propagarem na nuvem

### Instruções

**Tempo necessário:** 1-2 minutos

**Enquanto aguarda, você pode:**
- ✅ Ir para o próximo passo (recarregar página)
- ✅ Fazer um café ☕
- ✅ Revisar a documentação

### Status

```
⏱️  Aguardando: 0s

[███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 10%
```

### ✅ Próximo: PASSO 5

---

## 🔄 PASSO 5: Recarregar Aplicação

### Tarefa
Atualizar página web para carregar novas regras

### Instruções

**Abra em abas diferentes:**

1. **Aba 1:** Aplicação
   ```
   URL: http://localhost:8081
   Tecla: F5 (recarregar)
   ```

2. **Aba 2:** Firebase Console
   ```
   URL: https://console.firebase.google.com/project/pocketguide-bf350/firestore/data
   (mantenha aberta para PASSO 8)
   ```

### Passos Detalhados

**Na Aba 1 (http://localhost:8081):**

1. Pressione **F5** (recarregar página)
2. Se ainda tiver erros, faça:
   - **Ctrl+Shift+Delete** (limpar cache)
   - **F5** novamente

### O que você deve ver

```
Página recarregando...

✅ Sem erros Firestore 400
✅ LoginScreen visible com botão "Sign in with Google"
```

### ✅ Próximo: PASSO 6

---

## 🔍 PASSO 6: Verificar Console

### Tarefa
Abrir ferramentas de desenvolvimento e verificar logs

### Instruções

1. **Pressione F12** (abrir Developer Tools)
2. **Vá para aba "Console"**
3. **Procure por:**

✅ Deve conter:
```
🔧 Firebase Config Keys: {
  apiKey: '✅ Present',
  authDomain: '✅ Present',
  projectId: '✅ Present',
  measurementId: '✅ Present'
}
```

❌ Não deve conter:
```
Failed to load resource: the server responded with a status of 400
Firestore: Could not reach Cloud Firestore backend
```

### Se ainda ver erro 400:
```
1. Aguarde mais 2-3 minutos
2. F5 novamente
3. Se persistir, verifique se regra foi realmente publicada
```

### ✅ Próximo: PASSO 7

---

## 🔐 PASSO 7: Testar Login com Google

### Tarefa
Fazer login via Google para testar OAuth

### Instruções

**Na página http://localhost:8081:**

1. **Procure pelo botão:**
   ```
   ┌──────────────────────────────┐
   │  Sign in with Google         │
   │     [Google 🔵 Logo]         │
   └──────────────────────────────┘
   ```

2. **Clique nele**

3. **Janela pop-up abre:**
   - Selecione sua conta Google
   - Ou faça login

4. **Verifique autorização:**
   - Clique "Permitir" se solicitado

5. **Você deve ser redirecionado para:**
   ```
   HomeScreen (página principal)
   ```

### Se der erro:
```
Abra F12 → Console e procure por mensagens de erro
Verifique se Google Sign-In está ativado em:
https://console.firebase.google.com/project/pocketguide-bf350/authentication/providers
```

### ✅ Próximo: PASSO 8 (Final!)

---

## 📁 PASSO 8: Verificar Firestore

### Tarefa
Confirmar que usuário foi criado no banco de dados

### Instruções

**Abra em nova aba:**
```
https://console.firebase.google.com/project/pocketguide-bf350/firestore/data
```

**Procure por:**

1. Collection: **`users`** (lado esquerdo)
2. Dentro dela, um documento com seu **UID do Google**
3. O documento deve conter:
   ```
   email: seu.email@gmail.com
   name: Seu Nome Completo
   photoURL: https://lh3.googleusercontent.com/...
   createdAt: Oct 22, 2025, 6:52:44 AM
   ```

### O que você deve ver

```
📁 Firestore Database
├─ 📁 Collection: users
│  └─ 📄 Document: 1a2b3c4d5e6f7g8h9i0j
│     ├─ email: "seu.email@gmail.com" [string]
│     ├─ name: "Seu Nome Completo" [string]
│     ├─ photoURL: "https://..." [string]
│     └─ createdAt: Oct 22, 2025 at 6:52:44 AM [timestamp]
```

---

## 🎉 CHECKLIST COMPLETO

```
[✅] PASSO 1: Acessar Firebase Console
[✅] PASSO 2: Editar Regras Firestore
[✅] PASSO 3: Publicar Regras
[✅] PASSO 4: Aguardar Propagação
[✅] PASSO 5: Recarregar Aplicação
[✅] PASSO 6: Verificar Console
[✅] PASSO 7: Testar Login com Google
[✅] PASSO 8: Verificar /users/ no Firestore

🎊 SUCESSO TOTAL!
```

---

## 🚀 Próximos Passos (Após sucesso)

1. **Testar Quiz onboarding**
2. **Testar criação de viagem**
3. **Testar integração com IA**
4. **Testar mapa com rotas**
5. **Build para Android**

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Erro 400 persiste | Aguarde mais tempo, F5, limpe cache |
| Login não funciona | F12 → Console, procure erro |
| Usuário não em /users/ | Verifique regra, tente fazer login novamente |
| Pop-up Google bloqueado | Verifique bloqueador de pop-ups |
| Regra não publica | Verifique sintaxe, procure por erros vermelhos |

---

**Comece pelo PASSO 1 agora!** 👆

⏰ **Tempo estimado:** 5-10 minutos
