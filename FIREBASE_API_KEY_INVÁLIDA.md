# 🚨 Firebase API Key Inválida

## Status Atual
❌ A chave `AIzaSyDo_yJ5pK8qL2mN9oP3rS6tU1vW4xY7zA` é um **placeholder e não funciona**.

Resultado do teste:
```
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key."
  }
}
```

## Solução

### Opção 1: Obter chave da console Firebase (Recomendado)

1. **Acesse Firebase Console:**
   ```
   https://console.firebase.google.com/project/pocketguide-bf350/settings/general
   ```

2. **Clique em "Seus apps"** (na aba Settings)

3. **Procure pelo app Web** (deve ter um ícone `</>`)

4. **Copie o `apiKey`** do config:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",  // ← COPIE ESTE VALOR
     authDomain: "...",
     // etc
   };
   ```

5. **Atualize o `.env`:**
   ```bash
   # Abra o arquivo .env e substitua a linha:
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_YOUR_REAL_KEY_HERE
   ```

### Opção 2: Criar nova API Key

Se não encontrar a chave anterior:

1. **Firebase Console → Configurações do Projeto**
2. **Aba "Chaves de API"**
3. **Clique "Criar uma chave de API"** (ou "Criar credencial" → "Chave de API")
4. Copie a chave criada
5. Atualize `.env`

### Opção 3: Usar Google Cloud Console

Se o projeto Firebase está vinculado ao Google Cloud:

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: `pocketguide-bf350`
3. **APIs & Services → Credentials**
4. **API Keys** → Procure por uma chave de API
5. Copie ou crie uma nova

## ⚡ Passos Rápidos

```bash
# 1. Obter a chave real do Firebase Console
# 2. Editar .env
nano .env

# Substitua:
# EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDo_yJ5pK8qL2mN9oP3rS6tU1vW4xY7zA
# Por:
# EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_SUA_CHAVE_REAL_AQUI

# 3. Verificar
./verify-firebase.sh

# 4. Reiniciar app
npm start -- --clear
```

## ✅ Como Confirmar que Funciona

Após atualizar, execute:

```bash
API_KEY=$(grep "EXPO_PUBLIC_FIREBASE_API_KEY=" .env | cut -d'=' -f2)
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"returnSecureToken":true}' | grep -q "missing_email" && echo "✅ API Key VÁLIDA!" || echo "❌ API Key inválida"
```

Se retornar "✅ API Key VÁLIDA!", está pronto para usar.

## 📝 Nota Importante

- Nunca commite credenciais reais no Git
- O `.env` já está em `.gitignore`
- Cada projeto Firebase tem uma única API Key
- A chave pode ser recuperada a qualquer momento no Firebase Console

---

**Próximo passo:** Obtenha a chave correta e atualize o `.env`. Depois rode `npm start`.
