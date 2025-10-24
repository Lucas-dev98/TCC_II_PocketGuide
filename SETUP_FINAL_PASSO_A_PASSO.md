# ⚙️ GUIA PASSO A PASSO - Completar Configuração

## 📋 Passo 1: Reúna suas 10 API Keys (5 minutos)

### Do Firebase Console (console.firebase.google.com)

1. **Acesse o projeto Firebase**
   - Vá para: https://console.firebase.google.com
   - Selecione seu projeto "pocket-guide" (ou o nome do seu projeto)

2. **Vá para Project Settings**
   - Clique na engrenagem ⚙️ no canto superior esquerdo
   - Clique em "Project Settings"

3. **Copie os valores da aba "General"**
   ```
   Você verá um bloco como este:
   
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto-12345",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcd1234",
     measurementId: "G-XXXXXXXX"
   };
   ```

4. **Crie uma lista com estes valores:**
   ```
   VITE_FIREBASE_API_KEY = AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = seu-projeto-12345
   VITE_FIREBASE_DATABASE_URL = https://seu-projeto.firebaseio.com
   VITE_FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
   VITE_FIREBASE_APP_ID = 1:123456789:web:abcd1234
   VITE_FIREBASE_MEASUREMENT_ID = G-XXXXXXXX
   ```

### Do Google Cloud Console (console.cloud.google.com)

5. **Obtenha a chave Gemini API**
   - Vá para: https://console.cloud.google.com
   - Selecione seu projeto
   - Vá para: APIs & Services → Credentials
   - Procure por "Gemini API Key" ou crie uma nova
   - Copie o valor
   ```
   VITE_GEMINI_API_KEY = AIzaSy...
   ```

6. **Obtenha a chave Google Maps API**
   - No mesmo Google Cloud Console
   - Vá para: APIs & Services → Credentials
   - Procure por "Google Maps Platform" ou crie uma nova
   - Copie o valor
   ```
   VITE_GOOGLE_MAPS_API_KEY = AIzaSy...
   ```

---

## 🌐 Passo 2: Adicione ao Vercel Dashboard (5 minutos)

### Acesse o Vercel Dashboard

1. **Abra: https://vercel.com/dashboard**

2. **Procure e clique no projeto "pocket-guide-web"**
   - Você verá a lista de seus projetos
   - Clique em "pocket-guide-web"

3. **Clique na aba "Settings"** (no topo do página)
   - Você verá várias opções à esquerda

4. **Clique em "Environment Variables"** (no menu esquerdo)
   - Você verá um formulário "Add New"

### Adicione cada variável

5. **Para CADA uma das 10 variáveis:**

   **Variável 1:**
   - Name: `VITE_FIREBASE_PROJECT_ID`
   - Value: (seu valor do Firebase)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 2:**
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 3:**
   - Name: `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 4:**
   - Name: `VITE_FIREBASE_DATABASE_URL`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 5:**
   - Name: `VITE_FIREBASE_STORAGE_BUCKET`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 6:**
   - Name: `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 7:**
   - Name: `VITE_FIREBASE_APP_ID`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 8:**
   - Name: `VITE_FIREBASE_MEASUREMENT_ID`
   - Value: (seu valor)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 9:**
   - Name: `VITE_GEMINI_API_KEY`
   - Value: (seu valor do Google Cloud)
   - Environments: ✓ Production
   - Clique: "Add"

   **Variável 10:**
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: (seu valor do Google Cloud)
   - Environments: ✓ Production
   - Clique: "Add"

### Salve tudo

6. **Após adicionar TODAS as 10 variáveis:**
   - Clique em "Save" ou confirme
   - Você deve ver todas as 10 variáveis listadas

---

## 🚀 Passo 3: Redeploy (2 minutos)

### Execute o redeploy

1. **Abra seu terminal**

2. **Execute:**
   ```bash
   cd /home/lucasbastos/TCC/TCC_II_POCKET_GUIDE/pocket-guide-web
   vercel --prod
   ```

3. **Aguarde a conclusão (20-30 segundos)**
   
   Você verá algo como:
   ```
   ✓ Production: https://pocket-guide-...vercel.app
   ✓ built in 12.97s
   ```

4. **Pronto! 🎉**

---

## ✅ Passo 4: Whitelist Firebase (2 minutos)

### Configure o domínio autorizado no Firebase

1. **Vá para Firebase Console**
   - https://console.firebase.google.com
   - Selecione seu projeto

2. **Vá para Authentication → Settings**
   - No menu esquerdo, clique em "Authentication"
   - Clique na aba "Settings"

3. **Role até "Authorized Domains"**

4. **Clique em "Add Domain"**

5. **Cole seu domínio de produção:**
   ```
   pocket-guide-myuihuurd-lucas-bastos-projects-349d7c70.vercel.app
   ```
   (ou use o URL exato que apareceu no seu deploy)

6. **Clique "Add"**

---

## 🧪 Passo 5: Teste (2-5 minutos)

### Teste a aplicação

1. **Abra sua aplicação:**
   ```
   https://pocket-guide-...vercel.app
   ```

2. **Teste o login:**
   - Clique em "Sign in with Google"
   - Use sua conta Google
   - Deve fazer login com sucesso

3. **Teste criar uma viagem:**
   - Após login, clique "Create New Trip"
   - Preencha os dados
   - Clique "Generate Itinerary"
   - Aguarde a resposta da IA (10-20 segundos)
   - Clique "Save"

4. **Teste visualizar:**
   - Clique em uma viagem
   - Verifique se o mapa carrega
   - Verifique se o itinerário aparece

---

## ⏱️ RESUMO DO TEMPO

- Passo 1 (Gather keys): **5 minutos**
- Passo 2 (Vercel config): **5 minutos**
- Passo 3 (Redeploy): **2 minutos**
- Passo 4 (Firebase domain): **2 minutos**
- Passo 5 (Testing): **5 minutos**

**TOTAL: ~20 minutos para app 100% funcional! 🚀**

---

## ❓ DÚVIDAS COMUNS

**P: Onde encontro o Firebase Project ID?**
R: Firebase Console → Project Settings → General → Project ID (campo "projectId")

**P: Como obtenho a chave Gemini API?**
R: Google Cloud Console → APIs & Services → Create Credentials → API Key

**P: O Maps não carrega depois que adiciono a key**
R: Você pode precisar ativar a "Maps JavaScript API" no Google Cloud Console

**P: Recebo erro "Cannot find Firebase credentials"**
R: Verifique se TODAS as 10 variáveis foram adicionadas corretamente no Vercel

**P: Quanto custa usar estas APIs?**
R: Firebase e Google Maps têm tier gratuito. Gemini API também tem tier gratuito.

---

## 🎯 PRÓXIMOS PASSOS

Após completar os 5 passos:

1. ✅ Aplicação estará 100% funcional
2. ✅ Usuários conseguem fazer login
3. ✅ Trips salvas no banco de dados
4. ✅ IA gera itinerários
5. ✅ Mapas funcionam

Você estará **PRONTO PARA LANÇAR** em produção! 🚀

---

**Está pronto para começar? Avise quando terminar cada passo!**
