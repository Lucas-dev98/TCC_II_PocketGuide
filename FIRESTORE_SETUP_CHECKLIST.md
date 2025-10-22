# 📋 Firestore Rules Setup - Execução em Tempo Real

## ✅ Checklist de Configuração

- [x] **Passo 1:** Acessar Firestore Rules no Console
- [x] **Passo 2:** Verificar regra atual
- [ ] **Passo 3:** Copiar regra de desenvolvimento
- [ ] **Passo 4:** Clicar "Publicar"
- [ ] **Passo 5:** Aguardar 1-2 minutos
- [ ] **Passo 6:** Recarregar página
- [ ] **Passo 7:** Verificar console (F12)
- [ ] **Passo 8:** Testar login
- [ ] **Passo 9:** Verificar /users/ no Firestore

---

## 🔧 Instruções Detalhadas

### PASSO 1: Acessar Firebase Console

**URL:** https://console.firebase.google.com/project/pocketguide-bf350/firestore/rules

1. Abra o link acima
2. Você deve ver a aba "Rules" em destaque
3. Continue para o Passo 2

---

### PASSO 2: Verificar Regra Atual

Na aba **Rules**, você deve ver uma das seguintes configurações:

**Opção A (Padrão - BLOQUEADO):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Opção B (Desenvolvimento - LIBERADO):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Se estiver na Opção A (if false):** Passe para o Passo 3

---

### PASSO 3: Copiar Regra de Desenvolvimento

Na aba **Rules**, clique no botão de edição (lápis) ou clique diretamente no texto.

**Limpe tudo e cole isto:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Desenvolvimento: permitir tudo autenticado
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Screenshot esperado:**
- Arquivo editor aberto
- Código acima preenchido
- Botão "Publicar" azul disponível

---

### PASSO 4: Clicar "Publicar"

1. Localize o botão **"Publicar"** (canto inferior direito, ou no topo)
2. Clique nele
3. Você verá mensagem: "Rules published successfully" ou similar

**⏱️ IMPORTANTE:** Aguarde 1-2 minutos para propagar

---

### PASSO 5: Aguardar Propagação

⏳ **Tempo:** 1-2 minutos

Enquanto aguarda, continue com os passos 6 e 7 em paralelo.

---

### PASSO 6: Recarregar Página

**URL:** http://localhost:8081

1. Abra a URL acima no navegador
2. Pressione **F5** ou **Ctrl+R** para recarregar
3. Limpe cache se necessário: **Ctrl+Shift+Delete**

---

### PASSO 7: Verificar Console (F12)

1. Pressione **F12** para abrir Developer Tools
2. Vá para a aba **Console**
3. Procure por:
   - ✅ `🔧 Firebase Config Keys: { apiKey: '✅ Present'...}`
   - ✅ `Running application "main" with appParams`
   - ❌ Erros vermelhos sobre Firestore

**Se houver ainda erro 400:** Aguarde mais 1-2 minutos e recarregue

---

### PASSO 8: Testar Login

1. Na página http://localhost:8081
2. Procure pelo botão **"Sign in with Google"**
3. Clique nele
4. Use uma conta Google para fazer login
5. Você deve ser redirecionado para **HomeScreen**

**Se funcionar:** ✅ Passe para o Passo 9

**Se der erro:** Verifique o console (F12) para detalhes

---

### PASSO 9: Verificar /users/ no Firestore

Após fazer login com sucesso:

1. Vá para **Firebase Console → Firestore Database**
2. Procure pela collection **`users`**
3. Dentro dela, deve haver um documento com seu **UID do Google**
4. Dentro do documento, deve conter:
   - `email`: seu email Google
   - `name`: seu nome Google
   - `photoURL`: sua foto Google (se disponível)
   - `createdAt`: timestamp de quando foi criado

**Exemplo:**
```
Collection: users
├── Document: "google_uid_aqui"
│   ├── email: "seu.email@gmail.com"
│   ├── name: "Seu Nome"
│   ├── photoURL: "https://..."
│   └── createdAt: Timestamp
```

Se tudo aparecer: ✅ **SUCESSO TOTAL!**

---

## 🎯 Resumo Rápido

```bash
# Você precisa fazer:
1. Ir em: https://console.firebase.google.com/project/pocketguide-bf350/firestore/rules
2. Copiar a regra acima (PASSO 3)
3. Clicar "Publicar" (PASSO 4)
4. Aguardar 1-2 min
5. Recarregar http://localhost:8081
6. Testar Google Sign-In (PASSO 8)
7. Verificar /users/ no Firestore (PASSO 9)
```

---

## 🆘 Se Algo der Errado

### Erro: Ainda recebo HTTP 400

```
Solução:
1. Aguarde mais 2-3 minutos
2. Limpe cache: Ctrl+Shift+Delete
3. Recarregue: F5
4. Se persistir, verifique se a regra foi realmente publicada
```

### Erro: Login não funciona

```
Solução:
1. Abra F12 → Console
2. Procure por erros de autenticação
3. Verifique se Google Sign-In está ativado:
   Firebase Console → Autenticação → Google
```

### Erro: Usuário não é criado em /users/

```
Solução:
1. Verificar logs do useAuth.ts
2. Confirmar que Firestore.collection('users') existe
3. Testar regra manual: Firebase Console → Testing
```

---

## ✨ Próximas Funcionalidades (Depois)

- [ ] Verificar dados do usuário em HomeScreen
- [ ] Implementar Quiz onboarding
- [ ] Implementar Trip creation
- [ ] Integrar IA (Gemini)
- [ ] Implementar Map com rotas

---

**Status:** 🔄 EM PROGRESSO

Comece pelo **PASSO 1** agora! 🚀
