# 🗺️ Como Obter Token do Mapbox (5 minutos)

## ✅ Passo 1: Criar Conta no Mapbox
1. Acesse: https://account.mapbox.com/auth/signin
2. Clique em **"Sign up"** (canto inferior)
3. Preencha:
   - **Email**: seu email
   - **Password**: senha forte
   - **Name**: seu nome
4. Clique em **"Create account"**
5. Confirme o email (verifique sua caixa de entrada)

## ✅ Passo 2: Gerar Token Público
1. Após login, vá para **"Tokens"** no menu esquerdo
2. Clique em **"Create a token"**
3. Configure:
   - **Name**: `Pocket Guide MVP`
   - **Scopes**: Marque `STYLES:READ`, `FONTS:READ`, `DATASETS:READ`
   - **Resource restrictions**: Deixe em branco (ou seu domínio depois)
4. Clique em **"Create token"**
5. **COPIE O TOKEN** (você não verá de novo!)

## ✅ Passo 3: Adicionar ao .env
Cole o token no seu `.env`:

```
EXPO_PUBLIC_MAPBOX_API_KEY=seu_token_aqui
```

Exemplo:
```
EXPO_PUBLIC_MAPBOX_API_KEY=pk.eyJ1IjoibHVjYXMtZGV2OTgiLCJhIjoiY201dG...
```

## ✅ Passo 4: Verificar Cota Gratuita
- Vá para **"Billing"** no Mapbox
- Você tem: **200.000 solicitações/mês grátis**
- Isso dá para ~6.600 requisições/dia ou ~100 usuários ativos/dia

## 📊 O que o Token Permite

Com este token, você pode:
- ✅ Exibir mapas Mapbox GL
- ✅ Usar 200 estilos de mapa diferentes
- ✅ Geocodificação (buscar endereços)
- ✅ Renderizar rotas
- ✅ Markers e popups ilimitados

## 🚀 Próximo Passo
Depois de copiar o token, me avisa que vou:
1. Instalar a lib do Mapbox
2. Implementar o MapDayScreen
3. Testar no Android

**Tem o token? Manda para eu integrar! 🎯**
