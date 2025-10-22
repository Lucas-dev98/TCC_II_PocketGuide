# 🛣️ Como Obter Chave do GraphHopper (5 minutos)

## ✅ Passo 1: Criar Conta no GraphHopper
1. Acesse: https://www.graphhopper.com/
2. Clique em **"Sign Up"** ou **"Get started"**
3. Preencha:
   - **Email**: seu email
   - **Password**: senha forte
   - **Company/Name**: seu nome ou projeto
4. Clique em **"Create account"**
5. Confirme o email (verifique sua caixa de entrada)

## ✅ Passo 2: Criar Chave de API
1. Após login, vá para **"Dashboard"**
2. Clique em **"API Keys"** no menu esquerdo
3. Clique em **"Create New Key"**
4. Configure:
   - **Name**: `Pocket Guide MVP`
   - **Description**: `Travel itinerary routing for Pocket Guide app`
5. Clique em **"Create"**
6. **COPIE A CHAVE** (formato: `sua_chave_aqui`)

## ✅ Passo 3: Adicionar ao .env
Cole a chave no seu `.env`:

```
EXPO_PUBLIC_GRAPHHOPPER_API_KEY=sua_chave_aqui
```

Exemplo:
```
EXPO_PUBLIC_GRAPHHOPPER_API_KEY=2d4c3e5f7a8b9c0d1e2f3g4h
```

## ✅ Passo 4: Verificar Cota Gratuita
- Vá para **"Dashboard"** > **"API Keys"**
- Você tem: **25.000 solicitações/mês grátis** (free tier)
- Cada rota = 1 solicitação
- **Suficiente para**: ~800 rotas/dia ou 100+ usuários

## 📊 O que a Chave Permite

Com esta chave, você pode:
- ✅ Calcular rotas otimizadas entre múltiplos pontos
- ✅ Suportar diferentes modos de transporte (carro, bike, a pé)
- ✅ Obter distância e tempo de viagem
- ✅ Polylines para visualizar rotas no mapa
- ✅ Matrix API (calcular distância entre vários pontos)

## 📊 Plano Gratuito vs Pago

| Feature | Gratuito | Pago |
|---------|----------|------|
| Requisições/mês | 25.000 | Ilimitado |
| Modo de transporte | Básico (carro, bike, a pé) | 20+ opções |
| Pontos por rota | Até 500 | Sem limite |
| Custo | R$ 0 | USD $0.50/1000 req |

## 🚀 Próximo Passo
Depois de copiar a chave, me avisa que vou:
1. Adicionar ao `.env`
2. Implementar o MapDayScreen com Mapbox
3. Integrar rotas com GraphHopper
4. Testar no Android

**Tem a chave do GraphHopper? Manda para eu integrar! 🎯**

## ⚠️ Importante
- Não compartilhe sua chave publicamente
- Use a chave apenas no `.env` local
- Se vazar, regenere a chave no dashboard
