# 🎯 Checklist - Passo a Passo com Screenshots

## Status Atual do Projeto

```
✅ Web server: http://localhost:8081 (RODANDO)
✅ Firestore: Bloqueando sem autenticação (CORRETO - 403)
❌ Regras Firestore: Ainda não atualizadas
⏳ Próximo: Atualizar regras
```

---

## 📱 Executar o Checklist Agora

### PASSO 1: Abrir Firebase Console

**Clique aqui:**
👉 https://console.firebase.google.com/project/pocketguide-bf350/firestore/rules

Você verá algo assim:

```
┌─────────────────────────────────────────┐
│ Cloud Firestore                          │
├─────────────────────────────────────────┤
│ Rules  | Indexes                         │
├─────────────────────────────────────────┤
│ rules_version = '2';                    │
│ service cloud.firestore {                │
│   match /databases/{database}/docs {    │
│     match /{document=**} {               │
│       allow read, write: if false;      │
│     }                                    │
│   }                                      │
│ }                                        │
└─────────────────────────────────────────┘
```

---

### PASSO 2: Editar Regras

1. Clique no código (ou procure por botão "Edit")
2. **Selecione TUDO** (Ctrl+A)
3. **Delete TUDO**
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

Resultado esperado:

```
┌─────────────────────────────────────────┐
│ rules_version = '2';                    │
│ service cloud.firestore {                │
│   match /databases/{database}/docs {    │
│     match /{document=**} {               │
│       allow read, write: if             │
│         request.auth != null;           │
│     }                                    │
│   }                                      │
│ }                                        │
│                                          │
│ [Publish] ← Clique aqui!                │
└─────────────────────────────────────────┘
```

---

### PASSO 3: Publicar

1. Localize o botão **"Publish"** (geralmente azul, inferior direito)
2. Clique
3. Aguarde mensagem de sucesso

```
✅ Rules published successfully
```

---

### PASSO 4: Aguardar Propagação

⏱️ **1-2 minutos**

Use este tempo para ir para o próximo passo (recarregar a página).

---

### PASSO 5: Recarregar Aplicação

1. Abra: http://localhost:8081
2. Pressione **F5** (recarregar)
3. Pressione **F12** (abrir console)

Procure por:

```
🔧 Firebase Config Keys: {
  apiKey: '✅ Present',
  authDomain: '✅ Present',
  projectId: '✅ Present',
  measurementId: '✅ Present'
}
```

---

### PASSO 6: Testar Login

1. Na página, procure pelo botão:
   ```
   ┌─────────────────────────────┐
   │   Sign in with Google       │
   │         [Google logo]       │
   └─────────────────────────────┘
   ```

2. Clique nele
3. Complete o login com sua conta Google
4. Você deve ver **HomeScreen**

---

### PASSO 7: Verificar Firestore

1. Vá para: https://console.firebase.google.com/project/pocketguide-bf350/firestore/data

2. Procure pela collection `users`

3. Dentro dela, deve haver um documento com seu ID do Google

4. Você deve ver:

```
📁 users (collection)
  └─ [seu-uid-do-google] (document)
      ├─ email: "seu.email@gmail.com"
      ├─ name: "Seu Nome Completo"
      ├─ photoURL: "https://lh3.googleusercontent.com/..."
      └─ createdAt: Oct 22, 2025 at 6:51:44 AM
```

---

## ✅ Checklist Final

- [ ] **Passo 1:** Acessou Firebase Console (Rules)
- [ ] **Passo 2:** Editou e colou nova regra
- [ ] **Passo 3:** Publicou regras (viu mensagem de sucesso)
- [ ] **Passo 4:** Aguardou 1-2 minutos
- [ ] **Passo 5:** Recarregou http://localhost:8081
- [ ] **Passo 6:** Testou login com Google
- [ ] **Passo 7:** Viu documento criado em /users/

---

## 🎉 Se Tudo Funcionar

Você verá:

```
✅ Página carrega sem erros Firestore
✅ Login com Google funciona
✅ Documento criado em Firestore
✅ Console mostra credenciais presentes
✅ HomeScreen aparece após login
```

---

## 🆘 Se Algo Não Funcionar

### Erro: Ainda vejo "Failed to load resource: 400"

```bash
Solução:
1. Verifique se a regra foi REALMENTE publicada
2. Aguarde mais 2-3 minutos
3. Limpe cache do navegador (Ctrl+Shift+Delete)
4. Recarregue (F5)
```

### Erro: Login não funciona

```bash
Solução:
1. Abra F12 → Console
2. Procure por erros em vermelho
3. Verifique se Google Sign-In está ativado:
   https://console.firebase.google.com/project/pocketguide-bf350/authentication/providers
```

### Erro: Usuário não aparece em /users/

```bash
Solução:
1. Verifique se useAuth.ts está salvando em Firestore
2. Procure por logs em F12 → Console
3. Confirme que a regra permite escrita
```

---

## 🚀 Próximos Passos (Após sucesso)

1. Testar Quiz onboarding
2. Testar criação de viagem
3. Testar integração com IA
4. Testar mapa com rotas
5. Build para Android

---

**Comece pelo PASSO 1 agora!** 👆

⏰ Tempo estimado: **5-10 minutos**
