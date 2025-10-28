# 🔓 ANÁLISE: SEGURANÇA DE AUTENTICAÇÃO - Pocket Guide

**Data**: 28 de outubro de 2025  
**Análise**: Verificação de restrições de login Google

---

## ❓ PERGUNTA
> "Qualquer conta do google pode entrar e fazer login, criar suas viagens e etc ?"

---

## ✅ RESPOSTA: **SIM, QUALQUER CONTA GOOGLE PODE ACESSAR**

### 🔑 Análise Técnica

#### 1. **Autenticação Google (firebase.ts)**
```typescript
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};
```

**O que isso significa:**
- ✅ `GoogleAuthProvider` está configurado para aceitar **QUALQUER** conta Google
- ✅ Não há restrição de domínio (@domain.com)
- ✅ Não há whitelist de usuários
- ✅ Não há verificação de email específico
- ✅ O `prompt: 'select_account'` permite que qualquer usuário Google escolha sua conta

---

## 🔐 SEGURANÇA DO BANCO DE DADOS

### ✅ Firestore Rules (Implementado)

**Proteção por UID:**
```firestore
allow read: if request.auth.uid == resource.data.userId;
allow write: if request.auth.uid == resource.data.userId;
allow create: if request.auth != null;
```

**O que isso garante:**
- ✅ **Qualquer usuário autenticado** pode **criar viagens**
- ✅ Cada usuário pode **ver/editar apenas suas próprias viagens**
- ✅ Impossível um usuário acessar viagens de outro
- ✅ Dados isolados por `userId` (Firebase UID)

---

## 🎯 FLUXO ATUAL

### 1️⃣ **Qualquer Pessoa**
```
📱 Abre app → Clica "Login com Google" → Seleciona conta Google → ✅ ENTRA
```

### 2️⃣ **Acesso ao Dados**
```
✅ Pode criar viagens
✅ Pode criar dias/atrações
✅ Pode adicionar favoritos
✅ Pode compartilhar (link público)
❌ Não pode ver viagens de outro usuário
```

### 3️⃣ **Isolamento de Dados**
```
usuário@gmail.com           → viagens de usuário A
outrausuario@gmail.com      → viagens de usuário B
                               (isoladas com UID no Firestore)
```

---

## 🚨 IMPLICAÇÕES DE SEGURANÇA

### ✅ O Que É Seguro
| Aspecto | Status | Por quê |
|---------|--------|--------|
| Dados isolados | ✅ Seguro | Cada usuário vê só suas viagens |
| Acesso a dados alheios | ✅ Bloqueado | Firestore Rules por UID |
| Modificação de dados alheios | ✅ Bloqueado | Write rules verificam UID |
| Compartilhamento | ✅ Controlado | Links públicos apenas se compartilhado |

### ⚠️ O Que NÃO É Restrito
| Aspecto | Status | Observação |
|---------|--------|-----------|
| Qualquer Gmail pode entrar | ⚠️ Aberto | Intencional ou configurável |
| Número de usuários | ⚠️ Ilimitado | Sem limite de quotas |
| Viagens por usuário | ⚠️ Ilimitado | Sem limite de storage |
| Compartilhamento público | ⚠️ Aberto | Qualquer pessoa vê link público |

---

## 🔧 SE VOCÊ QUISER RESTRINGIR

### Opção 1: **Permitir Apenas Domínio Específico** (ex: @seuuniverso.edu.br)

**Implementação:**

```typescript
// firebase.ts
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Verifica domínio do email
    const allowedDomains = ['seuuniverso.edu.br', 'outrouniverso.edu.br'];
    const userDomain = user.email?.split('@')[1];
    
    if (!userDomain || !allowedDomains.includes(userDomain)) {
      // Deleta usuário se email não está no domínio permitido
      await user.delete();
      throw new Error('Email de domínio não autorizado');
    }
    
    return user;
  } catch (error) {
    // error handling
  }
};
```

### Opção 2: **Whitelist de Emails Específicos**

```typescript
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const whitelist = [
    'lucas@email.com',
    'admin@email.com',
    'usuario1@email.com'
  ];
  
  if (!user.email || !whitelist.includes(user.email)) {
    await user.delete();
    throw new Error('Email não autorizado');
  }
  
  return user;
};
```

### Opção 3: **Verificação de Email Customizado (Firestore)**

```typescript
// Salvar domínios permitidos no Firestore
const allowedDomainsRef = doc(db, 'config', 'allowedDomains');
const config = await getDoc(allowedDomainsRef);
const domains = config.data()?.domains || [];

// Verificar durante login
if (!domains.some(d => user.email?.endsWith(d))) {
  throw new Error('Domínio não autorizado');
}
```

### Opção 4: **Cloud Function (Backend)**

```typescript
// functions/index.ts
export const verifyUserOnCreate = functions.auth.user().onCreate(async (user) => {
  const allowedDomains = ['seuuniverso.edu.br'];
  const domain = user.email?.split('@')[1];
  
  if (!domain || !allowedDomains.includes(domain)) {
    await admin.auth().deleteUser(user.uid);
    console.log(`User ${user.email} deleted - unauthorized domain`);
  }
});
```

---

## 📊 CONFIGURAÇÃO ATUAL vs RECOMENDADO

| Aspecto | Atual | Recomendado para TCC |
|--------|-------|-----|
| **Qualquer Gmail** | ✅ Sim (Aberto) | Depende do escopo |
| **Validação de Domínio** | ❌ Não | ✅ Se for acadêmico |
| **Whitelist** | ❌ Não | ✅ Se for MVP/piloto |
| **Limite de Quota** | ❌ Não | ⚠️ Considerar |
| **Dados Isolados** | ✅ Sim (UID) | ✅ Mantém |

---

## 💡 RECOMENDAÇÃO

### Para **Produção Pública** (Como está agora)
✅ **Deixar como está** - Qualquer Google ID pode entrar
- Pro: Máxima acessibilidade
- Con: Sem controle de usuários
- Solução: Usar regras do Firestore (já implementadas) para isolar dados

### Para **MVP/Piloto** (Recomendado para TCC)
✅ **Adicionar Whitelist Simples**
```typescript
const ALLOWED_EMAILS = [
  'seu@email.com',
  'professor@universidade.edu.br',
  'colega1@universidade.edu.br'
];

// Verificar durante login
```

### Para **Produção Corporativa**
✅ **Usar Google Cloud Identity Platform**
- Verificação de domínio
- Custom claims
- Cloud Functions para validação

---

## 🔐 CHECKLIST DE SEGURANÇA

- ✅ Dados isolados por UID: **SIM**
- ✅ Firebase Rules implementadas: **SIM**
- ✅ HTTPS em produção: **SIM** (Vercel)
- ✅ Env vars protegidas: **SIM**
- ❌ Validação de domínio: **NÃO** (configurável)
- ❌ Rate limiting: **NÃO** (usar Firebase limits)
- ❌ 2FA: **NÃO** (Firebase pode adicionar)

---

## 📝 CONCLUSÃO

**Sim, qualquer conta Google pode entrar e usar o app.** Mas os dados são **isolados por usuário**, então não há risco de um usuário acessar viagens de outro.

Se você precisa restringir a entrada:
1. **Domínio específico** → Opção 1
2. **Lista de emails** → Opção 2
3. **Domínios dinâmicos** → Opção 3
4. **Validação backend** → Opção 4

---

**Status**: 🟢 **Seguro (mas aberto a qualquer Gmail)**

Quer que eu implemente uma das opções de restrição?

