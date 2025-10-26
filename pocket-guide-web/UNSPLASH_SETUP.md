# 📸 Configuração da Unsplash API para Fotos de Atrações

## O que é Unsplash API?

A **Unsplash API** fornece acesso a milhões de fotos de alta qualidade e gratuitas que podem ser usadas para pesquisar imagens relevantes para as atrações do seu itinerário.

## Como Configurar

### Passo 1: Registre-se no Unsplash

1. Acesse [https://unsplash.com/developers](https://unsplash.com/developers)
2. Clique em **"Create an app"** (ou faça login se já tiver conta)
3. Preencha o formulário com as informações do seu projeto:
   - **App name**: ex. "Pocket Guide"
   - **Description**: ex. "Photo search for travel itineraries"
   - **Intended use**: Selecione "For a website or mobile app"
   - Aceite os termos e clique em "Create app"

### Passo 2: Obtenha a Chave de Acesso

1. Depois que o app for criado, você verá uma página com as credentials
2. Procure por **"Access Key"** (é uma string longa como `abc123def456ghi789jkl012`)
3. Copie essa chave
4. **⚠️ Importante**: Não compartilhe essa chave! Mantenha-a privada.

### Passo 3: Configure no Projeto

1. No diretório do projeto, crie ou edite o arquivo `.env.local`:

```bash
# arquivo: .env.local
VITE_UNSPLASH_API_KEY=sua_chave_aqui
```

2. Substitua `sua_chave_aqui` pela chave que você copiou

3. Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Como Funciona

Uma vez configurado, o sistema fará:

1. **Busca por Atração**: Quando carregar as atrações de um dia, o `PhotoService` procura as fotos
2. **Query Inteligente**: Converte nomes de atrações (ex: "Colosseum", "Restaurant") em queries de busca otimizadas
3. **Fallback Automático**: Se a API não encontrar imagem ou não tiver chave, usa gradiente SVG com emoji

### Exemplo de Buscas

- "Colosseum" → busca "colosseum rome"
- "Pizza Restaurant" → busca "pizza italian"
- "Park" → busca "park nature"
- "Museum" → busca "museum rome"

## Limites da API Gratuita

- **Rate limit**: 50 requisições/hora no plano de demonstração
- **Cache local**: O app armazena em cache as fotos já carregadas
- **Fallback inteligente**: Se atingir limite, usa gradientes SVG (sempre funciona)

## Sem Chave API?

Não se preocupe! Se não configurar a chave:

1. ✅ O app continua funcionando normalmente
2. 📸 Mostra gradientes coloridos com emojis no lugar das fotos
3. 🎨 Cada tipo de atração tem uma cor diferente:
   - 🏛️ Monumentos: Âmbar
   - 🍽️ Restaurantes: Vermelho
   - 🎨 Museus: Roxo
   - 🌳 Parques: Verde
   - 🏖️ Praias: Azul

## Problemas Comuns

### "Erro 401 Unauthorized"
- Verifique se a chave está correta no `.env.local`
- Certifique-se de que não há espaços extras na chave

### "Nenhuma imagem encontrada"
- A query de busca pode não ter resultados
- Tente com um nome de atração mais genérico
- Adicione a atração ao mapeamento de queries em `photoService.ts`

### "Cheguei ao limite de 50 requisições/hora"
- Espere uma hora para o limite ser resetado
- O cache ajuda a não fazer requisições redundantes
- Considere um plano pago para maior limite

## Próximos Passos

Para aumentar a quantidade de fotos ou melhorar a relevância:

1. **Adicionar mais queries**: Edite `ATTRACTION_SEARCH_QUERIES` em `photoService.ts`
2. **Usar outras APIs**: Pexels, Pixabay, ou Flickr têm APIs similares
3. **Plano pago**: Unsplash oferece planos com mais requisições/mês

## Recursos

- 📚 Documentação Unsplash: https://unsplash.com/documentation
- 🔑 Console da API: https://unsplash.com/oauth/applications
- 💡 Exemplos: https://unsplash.com/napi/search/photos

---

**Desenvolvido para Pocket Guide - Seu assistente de viagens inteligente! ✈️**
