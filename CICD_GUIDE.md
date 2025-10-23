# 🚀 CI/CD Pipeline - Pocket Guide

> Automatização de testes, build e deploy com GitHub Actions

---

## 📋 Workflows Implementados

### 1. **Test & Build** (`.github/workflows/test.yml`)

Roda em **cada push e pull request**

```yaml
Triggers: push (main, develop), PR
Node versions: 18.x, 20.x
Steps:
  1. Type check (TypeScript)
  2. Unit tests (Jest)
  3. Integration tests
  4. Coverage report (Codecov)
  5. Build verification
```

**Executado em**:
- Todas as PRs (antes de merge)
- Todos os pushes para main/develop
- Backend também testado

---

### 2. **Deploy** (`.github/workflows/deploy.yml`)

Roda **automaticamente ao fazer push em main**

```yaml
Triggers: push to main (apenas src/, backend/, package.json mudaram)
Steps:
  1. Backend:
     - Type check
     - Build
     - Deploy para Vercel
  2. Frontend:
     - Build Expo web
     - Deploy para Vercel
```

---

## 🔧 Configuração Local

### Prerequisitos
- GitHub account
- Vercel account (para deploy)
- npm

### Setup

1. **Instalar dependências**
```bash
npm ci
cd backend && npm ci && cd ..
```

2. **Rodar testes localmente**
```bash
npm test
```

3. **Verificar types**
```bash
npm run type-check
```

4. **Build local**
```bash
cd backend && npm run build
```

---

## 🔐 Secrets Necessários

Para deploy automático, configure estes secrets no GitHub:

```
Settings → Secrets and variables → Actions
```

| Secret | Descrição |
|--------|-----------|
| `VERCEL_TOKEN` | Token de autenticação Vercel |
| `VERCEL_PROJECT_ID` | Project ID no Vercel (backend) |
| `VERCEL_ORG_ID` | Organization ID no Vercel |
| `GEMINI_API_KEY` | Chave da API Gemini (runtime) |
| `GRAPHHOPPER_API_KEY` | Chave GraphHopper (runtime) |

### Como gerar tokens

**Vercel Token**:
```bash
vercel login
# Token está em ~/.vercel/auth.json
```

**Secrets no GitHub**:
```bash
# Navegue para:
# https://github.com/seu-usuario/TCC_II_PocketGuide/settings/secrets/actions
# Clique em "New repository secret"
# Adicione cada um dos secrets acima
```

---

## 📊 Test Reports

### Local Coverage
```bash
npm test -- --coverage
# Gera: coverage/lcov.info
```

### GitHub Actions Coverage
Automaticamente enviado para Codecov.io

```
Coverage Report:
- Statements: 40%+
- Branches: 40%+
- Functions: 40%+
- Lines: 40%+
```

---

## ✅ Check Status

### No GitHub
Cada PR mostra:
- ✅ Tests passed
- ✅ Build succeeded
- ✅ Type check OK
- ✅ Coverage report

### No Vercel Dashboard
- Frontend: `https://pocket-guide.vercel.app`
- Backend: `https://pocket-guide-api.vercel.app`

---

## 🔄 Workflow Detalhado

### Ao fazer um PR

```
1. Workflow Dispara
   ├─ Checkout code
   ├─ Setup Node.js
   ├─ Install deps
   ├─ Type check ✓
   ├─ Run tests ✓
   ├─ Upload coverage ✓
   └─ Build ✓

2. GitHub mostra status na PR

3. Se todos passam → Permite merge
```

### Ao fazer merge em main

```
1. Test workflow roda (novamente)
2. Deploy workflow dispara (se teste passou)
   ├─ Backend build → Vercel deploy
   ├─ Frontend build → Vercel deploy
   └─ Notification (sucesso/erro)

3. App disponível em produção
```

---

## 🚨 Troubleshooting

### "Build failed"
```bash
# Testar localmente
npm run type-check
npm run build
```

### "Tests failed"
```bash
# Rodar testes
npm test

# Verificar imports
npm run type-check
```

### "Deploy failed"
```bash
# Verificar secrets
echo $VERCEL_TOKEN  # Deve ter um valor

# Testar build localmente
cd backend && npm run build
```

### "Coverage report not uploaded"
```bash
# Código.io precisa estar ativo
# Adicione no secrets: CODECOV_TOKEN
```

---

## 📈 Métricas

### Tempo de execução

| Workflow | Tempo | Custo |
|----------|-------|-------|
| Test & Build | ~2-3 min | Free (GitHub) |
| Deploy | ~5-10 min | Free (Vercel tier 1) |
| Total | ~10-15 min | FREE |

### Capacidade

- **Concurrent workflows**: Unlimited para public repos
- **Artifacts**: 500MB total
- **Job execution time**: 6 horas max
- **Workflow run time**: 35 dias max

---

## 🎯 Melhorias Futuras

- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Add performance benchmarks
- [ ] Add security scanning (SAST)
- [ ] Add dependency updates (Dependabot)
- [ ] Add mobile build (EAS Build)
- [ ] Add database migrations
- [ ] Add Sentry error tracking
- [ ] Add staging environment

---

## 📝 Best Practices

✅ **DO**:
- Sempre fazer testes antes de PR
- Incluir descrição clara nas PRs
- Usar branch protection rules
- Revisar GitHub Actions logs

❌ **DON'T**:
- Fazer push direto em main
- Ignorar failed tests
- Committar API keys
- Usar secrets sem masking

---

## 🔗 Links Úteis

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Jest Testing](https://jestjs.io)
- [TypeScript Compiler](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

---

**Status**: ✅ Production Ready  
**Last Updated**: 22 de outubro de 2025  
**Maintained by**: TCC Team
