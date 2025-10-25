# 🚀 DEPLOYMENT - Deploy em Produção

## 📋 Pré-requisitos

- ✅ Conta Vercel (gratuita)
- ✅ Repositório GitHub sincronizado
- ✅ Variáveis de ambiente configuradas

---

## 🔗 Deploy no Vercel

### Opção 1: Via Dashboard (Mais Fácil)

#### 1. Conectar Repositório
```
1. Acesse https://vercel.com
2. Login com GitHub
3. Clique em "Add New..." → Project
4. Selecione repositório "TCC_II_POCKET_GUIDE"
5. Clique "Import"
```

#### 2. Configurar
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3. Adicionar Variáveis
No painel Vercel, vá para Settings → Environment Variables

Copie TODAS as variáveis do `.env.local`:
```env
VITE_GEMINI_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_MAPBOX_API_KEY
```

#### 4. Deploy
```
Clique "Deploy"
Aguarde ~5 minutos
Acesse seu link único (xxx.vercel.app)
```

---

### Opção 2: Via CLI (Mais Controle)

#### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login
```bash
vercel login
```
Siga as instruções no navegador

#### 3. Deploy
```bash
cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE/pocket-guide-web
vercel deploy --prod
```

#### 4. Selecionar Opções
```
? Set up and deploy "pocket-guide-web"? [Y/n] → Y
? Which scope? → seu-usuario
? Link to existing project? [y/N] → N
? What's your project's name? → pocket-guide-web
? In which directory is your code? [./] → ./
? Want to modify these settings? [y/N] → N
? Deploying your project...
```

---

## 📊 Gerenciar Deploy

### Ver Deployments
```bash
vercel ls
```

### Ver Logs em Tempo Real
```bash
vercel logs
```

### Rollback para Versão Anterior
```bash
vercel rollback
```

Selecione a data para voltar

---

## ✅ Verificação Pós-Deploy

### 1. Teste de Carregamento
```
✅ Página carrega sem erros
✅ CSS aplica corretamente
✅ Sem erro 404 em assets
```

### 2. Teste de Auth
```
✅ Botão Google Sign-In funciona
✅ Login redireciona para Home
✅ Session persiste ao refresh
```

### 3. Teste de Funcionalidades
```
✅ Criar viagem funciona
✅ Itinerário gera corretamente
✅ Mapa renderiza
✅ Dados salvam no Firestore
```

### 4. Teste de Performance
Acesse DevTools → Lighthouse:
```
Performance: 90+
Accessibility: 90+
Best Practices: 90+
SEO: 90+
```

---

## 🔄 Continuous Deployment (CD)

### GitHub Integration
Vercel já está conectado! Cada `git push` dispara deploy automático:

```bash
git add .
git commit -m "Feature: Nova página"
git push origin main
```

**Vercel detecta mudança → Compila → Testa → Deploy automático**

---

## 🌍 Domínio Customizado

### Adicionar Domínio
1. Painel Vercel → Settings → Domains
2. Clique "Add"
3. Digite seu domínio (ex: pocket-guide.com)
4. Siga instruções de DNS

### Certificado SSL
✅ Automático com Let's Encrypt

---

## 🐛 Troubleshooting

### Build Falha com Erro TS
```
Solução: Verificar types/ e corrigir imports
Teste local: npm run build
```

### Variáveis Não Funcionam
```
Solução: Verificar nomes exatos (VITE_ prefix)
Redeploy após adicionar: vercel deploy --prod
```

### Firebase Não Conecta
```
Solução: Verificar credenciais em .env
Regenerar se necessário em Firebase Console
```

### Mapbox Não Renderiza
```
Solução: Confirmar token público
Verificar domain restrictions em Mapbox
```

### Página Branca
```
Solução: Abrir DevTools → Console
Procurar erros de API
Verificar Network tab
```

---

## 📈 Monitoramento

### Vercel Analytics
Painel automático com:
- Requisições
- Duração builds
- Última implantação
- Status em tempo real

### Google Analytics (Integrado)
Código: `VITE_FIREBASE_MEASUREMENT_ID`

Acessar em Firebase → Analytics

---

## 🔐 Segurança em Produção

### Checklist
- ✅ Nunca committar `.env` com chaves reais
- ✅ Usar variáveis de ambiente Vercel
- ✅ Revisar Security Rules do Firebase
- ✅ Validar requisições de API
- ✅ Usar HTTPS obrigatório (automático)

### Regenerar Chaves (Se Comprometidas)
```
1. Firebase: Project Settings → Regenerar API Key
2. Gemini: aistudio.google.com/app/apikey → Delete old
3. Mapbox: account.mapbox.com → Regenerar token
4. Atualizar em Vercel Environment Variables
5. Redeploy automático
```

---

## 🔄 Rollback Rápido

Se algo der errado:

```bash
# Ver deployments
vercel ls

# Voltar para versão anterior
vercel rollback
```

Ou via Painel: Deployments → Selecione versão → Set as Production

---

## 🚀 Otimizações de Produção

### Build Otimizado
```bash
npm run build
```
Resultado:
- ✅ Minificação JS
- ✅ Tree-shaking
- ✅ Code splitting
- ✅ CSS otimizado
- ✅ Bundle ~1.9 MB

### Service Worker
✅ PWA funciona offline
✅ 9 assets precacheados
✅ Atualização automática

### Cache Strategy
- Static files: 1 ano
- HTML: sem cache (sempre fresh)
- API: sem cache (dados em tempo real)

---

## 📊 Links Úteis

| Recurso | URL |
|---------|-----|
| **App Produção** | https://pocket-guide-web.vercel.app |
| **Painel Vercel** | https://vercel.com/dashboard |
| **Firebase Console** | https://console.firebase.google.com |
| **GitHub Repo** | https://github.com/seu-usuario/TCC_II_POCKET_GUIDE |

---

## ✨ Próximos Passos

- 🔄 Monitorar performance
- 📊 Analisar user analytics
- 🎯 Coletar feedback dos usuários
- 🚀 Implementar melhorias (veja [FEATURES.md](./FEATURES.md))

---

**Obrigado por usar Pocket Guide!**

Dúvidas? Abra uma issue no GitHub ou verifique os logs em `vercel logs`
