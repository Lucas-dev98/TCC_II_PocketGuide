# 🔧 Resolver Erros do Firebase Firestore

## ❌ Erro Atual

```
[code=unavailable]: The operation could not be completed
This typically indicates that your device does not have a healthy Internet connection at the moment.
The client will operate in offline mode...
```

Status HTTP: **400**

---

## 🔍 Análise

### Causas Possíveis:

1. **Regras de Firestore muito restritivas** ← Mais provável
2. Firestore não inicializado
3. Problema de CORS
4. Modo offline ativado

---

## ✅ Solução

### Passo 1: Verificar Regras Firestore

No Firebase Console:

1. Vá para: **Firestore Database**
2. Clique na aba **Rules**
3. Você deve ver algo assim:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default: nega tudo
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Se estiver assim (`if false`), nenhuma leitura/escrita é permitida!

### Passo 2: Atualizar Regras para Desenvolvimento

Substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita autenticada em qualquer documento
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permitir criar usuário quando não autenticado (para signup)
    match /users/{userId} {
      allow create: if request.auth == null;
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Passo 3: Publicar Regras

1. Clique em **Publicar** (botão azul no canto inferior direito)
2. Aguarde 1-2 minutos para propagar

### Passo 4: Testar

```bash
# Recarregar a página
# Abrir F12 → Console
# Procurar por mensagens do Firebase
```

---

## 🚀 Regras de Produção (Depois)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seu próprio perfil
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Trips - leitura/escrita apenas pelo proprietário
    match /trips/{tripId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Adicione outras collections conforme necessário
  }
}
```

---

## 🔗 Links Úteis

- [Firebase Firestore Rules](https://firebase.google.com/docs/firestore/security)
- [Get Started with Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Common Patterns](https://firebase.google.com/docs/firestore/security/rules-patterns)

---

## ⚠️ Avisos

- **NÃO use `allow read, write: if true` em produção!** (inseguro)
- Regras com `if false` bloqueiam tudo
- Mudanças podem levar 1-2 minutos para propagar
- Se ainda não funcionar, limpe cache: `Ctrl+Shift+Delete` no browser

---

## 📋 Checklist

- [ ] Acessar Firestore Rules no Console
- [ ] Verificar regra atual
- [ ] Copiar regra de desenvolvimento acima
- [ ] Clicar "Publicar"
- [ ] Aguardar 1-2 minutos
- [ ] Recarregar página http://localhost:8081
- [ ] Verificar console (F12) para novos erros
- [ ] Tentar fazer login
- [ ] Verificar se documento foi criado em /users/

---

**Próximo passo:** Atualize as regras Firestore e recarregue a página!
