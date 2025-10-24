# 🆘 Quick Troubleshooting - Problemas Comuns

## Problema 1: "Cannot find Firebase credentials"

### Sintoma:
- Página mostra erro quando você tenta fazer login
- Console mostra: `TypeError: Cannot read property 'project_id' of undefined`

### Solução:
1. Verifique se TODAS as 8 variáveis Firebase foram adicionadas no Vercel
2. Confirme que:
   - `VITE_FIREBASE_PROJECT_ID` está correto
   - `VITE_FIREBASE_API_KEY` está correto
   - Nenhuma variável foi deixada em branco

### Teste:
```bash
# Se estiver testando localmente:
cat .env.local
# Verifique se todas as variáveis estão lá
```

---

## Problema 2: Login funciona mas não consegue acessar trips

### Sintoma:
- Login bem-sucedido (página redireciona para home)
- HomeScreen mostra: "Error loading trips"
- Nenhuma trip aparece na lista

### Solução:
1. Verifique se `VITE_FIREBASE_PROJECT_ID` está correto
2. Cheque no Firebase Console se as Firestore Rules estão configuradas:
   ```
   match /trips/{document=**} {
     allow read, write: if request.auth != null;
   }
   ```
3. Confirme que o usuário está autenticado (veja no console do navegador)

### Teste:
```bash
# No DevTools do navegador (F12):
# Cole no console:
firebase.auth().currentUser
# Deve mostrar seu usuário, não null
```

---

## Problema 3: Maps não carrega

### Sintoma:
- Página de trip detail carrega
- Mapa está em branco ou mostra erro
- Console: "Google Maps API key invalid"

### Solução:
1. Verifique se `VITE_GOOGLE_MAPS_API_KEY` está adicionado no Vercel
2. Confirme que no Google Cloud Console você ativou:
   - "Maps JavaScript API"
   - "Maps Embed API"
3. Pode levar alguns minutos para a key ficar ativa

### Teste:
```bash
# No DevTools (F12), console:
console.log(process.env.VITE_GOOGLE_MAPS_API_KEY)
# Deve mostrar a key, não "undefined"
```

---

## Problema 4: AI Itinerary retorna erro

### Sintoma:
- Clica "Generate Itinerary"
- Aparece: "Error generating itinerary"
- Nada acontece

### Solução:
1. Verifique se `VITE_GEMINI_API_KEY` está correto
2. Confirme que no Google Cloud Console você ativou:
   - "Generative Language API"
3. Verifique se sua quota não foi excedida
4. Teste se a key é válida

### Teste:
```bash
# Teste a key localmente:
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SEU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
# Deve retornar uma resposta, não um erro
```

---

## Problema 5: Página fica em branco após deploy

### Sintoma:
- Deploy aparenta ter sucesso
- Abra a URL mas a página fica branca/em branco
- Nenhuma mensagem de erro

### Solução:
1. Força um refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Limpe o Service Worker:
   - DevTools → Application → Service Workers
   - Clique "Unregister"
3. Limpe o cache:
   - DevTools → Application → Cache Storage
   - Delete todos os caches
4. Feche completamente e reabra o navegador

---

## Problema 6: Build falha no Vercel

### Sintoma:
- Deploy iniciado mas falha na build
- Erro: `npm ERR! ERESOLVE could not resolve dependencies`

### Solução:
1. Verifique se `.npmrc` tem `legacy-peer-deps=true`
2. Execute localmente:
   ```bash
   npm run build
   ```
3. Se passar localmente mas falhar no Vercel, tente:
   - Deletar `node_modules` e `package-lock.json`
   - Executar `npm install` novamente
   - Fazer push para forçar novo deploy

---

## Problema 7: Login redireciona para branco

### Sintoma:
- Clica "Sign in with Google"
- Google abre popup de login
- Após login, página fica branca

### Solução:
1. Verifique se domínio está whitelisted no Firebase:
   - Firebase Console → Authentication → Settings
   - "Authorized Domains"
   - Deve incluir seu domínio Vercel
   
2. Limpe localStorage:
   ```bash
   # No console do navegador:
   localStorage.clear()
   # Recarregue a página
   ```

---

## Problema 8: Trips não salvam

### Sintoma:
- Clica "Save"
- Aparece mensagem de sucesso
- Mas trip não aparece na lista depois

### Solução:
1. Verifique Firestore Rules no Firebase Console:
   ```
   // CORRETO:
   match /trips/{document=**} {
     allow read, write: if request.auth != null;
   }
   ```

2. Confirme que usuário está autenticado:
   ```bash
   # Console do navegador:
   firebase.auth().currentUser.uid
   # Deve mostrar um UID
   ```

3. Verifique se database está criada:
   - Firebase Console → Firestore Database
   - Deve ter uma coleção "trips"

---

## Problema 9: Dark mode não persiste

### Sintoma:
- Clica ícone dark mode
- Tema muda
- Atualiza página
- Volta para tema anterior

### Solução:
1. Verifique se localStorage está habilitado
2. Abra DevTools (F12) e teste:
   ```bash
   localStorage.setItem('test', 'value')
   localStorage.getItem('test')
   # Deve retornar 'value'
   ```

3. Se localStorage não funciona, seu navegador pode estar em modo privado
   - Saia do modo privado

---

## Problema 10: Performance lenta

### Sintoma:
- App abre lentamente
- Ações demoram muito
- Muitos pedidos de API no Network

### Solução:
1. Verifique a velocidade:
   - DevTools → Network
   - Recarregue (F5)
   - Veja tempo de carregamento

2. Se lento:
   - Pode ser conexão lenta
   - Ou Firebase/Gemini APIs lentas
   - Tente em outro momento

3. Para otimizar:
   - Implemente cache local
   - Use Firestore cache
   - Limite queries

---

## 🆘 Se nada disso resolver:

1. **Verifique console do navegador** (F12 → Console)
   - Cole aqui a mensagem de erro exata

2. **Verifique Vercel logs**
   - Vercel Dashboard → Deployments → último deploy
   - Veja "Build logs"

3. **Teste localmente**
   ```bash
   cd pocket-guide-web
   npm run dev
   # Se funciona localmente, problema é no deploy
   ```

4. **Consulte documentação**
   - TESTING_GUIDE.md
   - DEPLOYMENT_NEXT_STEPS.md
   - FINAL_REPORT.md

---

## ⚡ Quick Checklist

Antes de pedir ajuda, confirme:

- [ ] Todas as 10 variáveis adicionadas no Vercel
- [ ] Todas as variáveis estão corretas (copie exatamente)
- [ ] Firebase domain está whitelisted
- [ ] Google Cloud APIs ativadas (Maps, Gemini)
- [ ] Build passa localmente (`npm run build`)
- [ ] Você limpou cache/localStorage
- [ ] Você esperou 1-2 minutos após deploy

---

**Ainda com problema? Mostre:**

1. O erro exato do console
2. Sua configuração do Firebase
3. O que está tentando fazer
4. Screenshots se possível

Ficarei feliz em ajudar! 🚀
