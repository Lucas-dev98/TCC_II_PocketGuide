# 🔧 GitHub Workflow Configuration

## ✅ Automated Deployment Setup

Este projeto usa **GitHub Actions** para fazer deploy automático no Vercel a cada push.

---

## 📋 Requisitos de Configuração

### 1. Criar Tokens no Vercel

**Passo 1:** Acesse https://vercel.com/account/tokens

**Passo 2:** Crie um novo token com nome `GitHub CI`:
- Tipo: Scoped
- Scope: Todos os projetos
- Expiration: Nenhuma (opcional)

**Passo 3:** Copie o token

---

### 2. Configurar Secrets no GitHub

**Passo 1:** Vá para seu repositório → **Settings** → **Secrets and variables** → **Actions**

**Passo 2:** Crie 3 secrets:

#### Secret 1: `VERCEL_TOKEN`
- **Valor:** Token copiado do Vercel
- **Descrição:** Token de acesso Vercel para CI/CD

#### Secret 2: `VERCEL_ORG_ID`
- **Onde encontrar:** 
  1. Acesse https://vercel.com/account/settings/teams
  2. Copie o "Team ID" (ou deixe vazio se usar conta pessoal)
- **Valor:** ID da organização ou conta

#### Secret 3: `VERCEL_PROJECT_ID`
- **Onde encontrar:**
  1. Vá para seu projeto no Vercel
  2. Vá para **Settings** → **General**
  3. Copie o "Project ID"
- **Valor:** ID único do projeto Pocket Guide Web

---

### 3. Exemplo Visual

```
GitHub Settings → Secrets and variables → Actions
├── VERCEL_TOKEN         = vk_abc123xyz...
├── VERCEL_ORG_ID        = (deixar vazio ou seu team ID)
└── VERCEL_PROJECT_ID    = prj_xyz789abc...
```

---

## 🚀 Como Funciona

### Workflow Automático

```
git push origin main
    ↓
GitHub Actions inicia
    ├─ test-and-verify (Ubuntu)
    │  ├─ Checkout code
    │  ├─ Setup Node 20
    │  ├─ npm ci (instalar deps)
    │  ├─ TypeScript check (tsc --noEmit)
    │  ├─ npm run build
    │  └─ Verificar dist/
    │
    └─ deploy-to-vercel (se test passou)
       ├─ Checkout code
       ├─ Deploy com vercel/action@v4
       └─ Notificação de sucesso/erro
    ↓
App em produção: https://pocket-guide-web.vercel.app
```

---

## 📝 Detalhes do Workflow

### Jobs Executados

**1. `test-and-verify`** (Obrigatório)
- Testa se o código compila
- Verifica TypeScript errors
- Valida build output
- Roda automaticamente em cada push

**2. `deploy-to-vercel`** (Depende de test passar)
- Só executa se test-and-verify passar
- Usa credenciais GitHub Secrets
- Deploy automático para produção
- Envia notificações de status

---

## ✅ Checklist de Setup

- [ ] Criar token em https://vercel.com/account/tokens
- [ ] Adicionar `VERCEL_TOKEN` em GitHub Secrets
- [ ] Adicionar `VERCEL_ORG_ID` em GitHub Secrets (opcional)
- [ ] Adicionar `VERCEL_PROJECT_ID` em GitHub Secrets
- [ ] Fazer um teste: `git push` e verificar em Actions tab
- [ ] Confirmar app disponível em https://pocket-guide-web.vercel.app

---

## 🧪 Testar o Workflow

### Primeiro Deploy

```bash
# 1. Faça uma mudança pequena
echo "# Teste" >> README.md

# 2. Commit e push
git add README.md
git commit -m "test: Trigger workflow test"
git push origin main

# 3. Monitorar
# Vá para GitHub → Actions → Deploy React Web
# Aguarde até ver ✅ Deploy successful
```

### Monitorar Execução

```
GitHub Repo → Actions Tab → Workflows
├── Deploy React Web (nome do workflow)
│  ├── test-and-verify ✅
│  └── deploy-to-vercel ✅
```

---

## 🐛 Troubleshooting

### Erro: "VERCEL_TOKEN secret not found"
**Solução:** 
1. Verificar se secret está configurado (Settings → Secrets)
2. Certificar que nome está **exato**: `VERCEL_TOKEN`

### Erro: "Failed to build"
**Solução:**
1. Verificar localmente: `cd pocket-guide-web && npm run build`
2. Checar se há erros TypeScript
3. Verificar se dependências estão todas instaladas

### Erro: "project not found"
**Solução:**
1. Verificar `VERCEL_PROJECT_ID` está correto
2. Confirmar projeto existe em https://vercel.com
3. Regenerar ID se necessário

---

## 📊 Monitorar Deployments

### GitHub Actions Tab
```
https://github.com/Lucas-dev98/TCC_II_PocketGuide/actions
```

### Vercel Deployments
```
https://vercel.com/dashboard
→ Selecionar projeto pocket-guide-web
→ Aba "Deployments"
```

---

## 🔄 CI/CD Flow Resumido

```
┌─────────────────────────────────────────┐
│ git push origin main                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ GitHub Actions Triggered                │
│ - Checkout                              │
│ - Node 20                               │
│ - npm ci                                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Test Phase                              │
│ - TypeScript: tsc --noEmit              │
│ - Build: npm run build                  │
│ - Verify: dist/ exists                  │
└─────────────────────────────────────────┘
              ↓
        ✅ PASS?
       ↙        ↘
      ✅        ❌
   Deploy    Notify Error
      ↓
   Vercel
      ↓
  Production Live
```

---

**Próximo:** Depois de configurar, faça um push de teste para verificar se tudo funciona! 🚀
