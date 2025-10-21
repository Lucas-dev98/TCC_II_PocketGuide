# 🤖 POCKET GUIDE - PROMPTS MESTRES (GEMINI API)

## Visão Geral

Este documento contém os prompts otimizados para a **Google Gemini API** que geram roteiros inteligentes, personalizados e offline-ready.

---

## 🎯 ESTRATÉGIA DE PROMPTS

### Princípios de Design

1. **Determinístico:** Retorna JSON estruturado, nunca texto livre
2. **Personalizador:** Adapta-se aos tags/preferências do usuário
3. **Prático:** Inclui horários, durações, dicas reais
4. **Geográfico:** Localiza atrações com lat/lng
5. **Escalável:** Funciona para 1-21 dias

### Estrutura Geral

```
ROLE → Define expertise (especialista em viagens)
↓
CONSTRAINTS → Retorne APENAS JSON
↓
INPUT → {destination}, {days}, {tags}, {budget}, {companion}
↓
OUTPUT → Array de objetos Attraction com estrutura fixa
↓
ERROR HANDLING → Parse JSON, validar campos obrigatórios
```

---

## 📋 PROMPT 1: GERAR ROTEIRO PRINCIPAL

### Use Case
Quando usuário cria uma viagem nova, gera um roteiro completo para todos os dias.

### Prompt Template

```text
Você é um especialista em roteiros de viagem com experiência em {destination}.

Crie um roteiro de {days} dias em {destination} para um viajante com estas preferências:

PERFIL DO VIAJANTE:
- Interesses: {tags}
- Orçamento: {budget}
- Viaja com: {companion}
- Idioma: português

INSTRUÇÕES:
1. Crie {days} dias de roteiro completo
2. Distribua as atrações igualmente entre os dias
3. Cada atração deve ter um horário realista (09:00-20:00)
4. Considere tempo de deslocamento entre atrações
5. Priorize atrações alinhadas com os interesses do viajante
6. Inclua pelo menos 1 experiência gastronômica por dia
7. Adicione dicas práticas e realistas
8. Locais devem ter coordenadas geográficas precisas

FORMATO: Retorne APENAS um array JSON válido, sem explicações adicionais.
Cada item deve ter EXATAMENTE estes campos:

[
  {
    "day": number,
    "time": "HH:00" ou "HH:30",
    "name": "string",
    "duration": number (em minutos),
    "reason": "string (por que visitar)",
    "tip": "string (dica prática)",
    "location": {
      "lat": number (precisão: 2-4 casas decimais),
      "lng": number (precisão: 2-4 casas decimais)
    }
  }
]

RESPONDA AGORA:
```

### Exemplo de Entrada

```javascript
const params = {
  destination: "Lisboa, Portugal",
  days: 3,
  tags: ["gastronomia", "história", "médio"],
  budget: "médio", // baixo, médio, alto
  companion: "casal"
};

const prompt = `Você é um especialista em roteiros de viagem com experiência em Lisboa, Portugal.

Crie um roteiro de 3 dias em Lisboa, Portugal para um viajante com estas preferências:

PERFIL DO VIAJANTE:
- Interesses: gastronomia, história, médio
- Orçamento: médio
- Viaja com: casal
- Idioma: português

INSTRUÇÕES:
...
`;
```

### Exemplo de Resposta Esperada

```json
[
  {
    "day": 1,
    "time": "09:00",
    "name": "Café A Brasileira",
    "duration": 60,
    "reason": "Café histórico onde Pessoa passava tempo, famoso pelos pastéis de nata",
    "tip": "Reserve mesa com antecedência, peça o café com leite e prove o pastel quente",
    "location": {
      "lat": 38.7100,
      "lng": -9.1410
    }
  },
  {
    "day": 1,
    "time": "11:00",
    "name": "Torre de Belém",
    "duration": 90,
    "reason": "Monumento UNESCO do século XVI com vista para o Tejo",
    "tip": "Suba até ao topo para fotos panorâmicas, melhor luz no final da tarde",
    "location": {
      "lat": 38.6917,
      "lng": -9.2155
    }
  },
  {
    "day": 1,
    "time": "14:00",
    "name": "Pastel de Nata na Fábrica Jerónimos",
    "duration": 45,
    "reason": "Provar o autêntico pastel de nata na origem",
    "tip": "Fila rápida ao meio-dia, melhor vir entre 14:00-16:00",
    "location": {
      "lat": 38.6968,
      "lng": -9.2053
    }
  }
]
```

### Validação

```typescript
interface GeminiResponse {
  day: number;           // ✅ 1-30
  time: string;          // ✅ "HH:00" ou "HH:30"
  name: string;          // ✅ não vazio
  duration: number;      // ✅ 15-360 minutos
  reason: string;        // ✅ > 20 caracteres
  tip: string;           // ✅ não vazio
  location: {
    lat: number;         // ✅ -90 a 90
    lng: number;         // ✅ -180 a 180
  };
}
```

---

## 📋 PROMPT 2: GERAR ATRAÇÕES POR DIA

### Use Case
Quando usuário quer adicionar mais uma atração para um dia específico.

### Prompt Template

```text
Você é um guia turístico especializado em {destination}.

O usuário está visitando {destination} no dia {dayNumber} de um roteiro de {days} dias.
Já tem {existingAttractionsCount} atrações neste dia.

PERFIL DO USUÁRIO:
- Interesses: {tags}
- Orçamento: {budget}
- Viaja com: {companion}

CONTEXTO DO ROTEIRO:
{existingAttractionsForDay}

Sugira {numberOfAttractions} atração(ões) adicional(is) para {destination} que:
1. Complemente as já planejadas
2. Alinhe com os interesses do usuário
3. Seja viável para inserir neste dia
4. Tenha horários realistas (não conflitar com existentes)
5. Considere tempo de deslocamento

FORMATO: Retorne APENAS um array JSON válido com a estrutura:
[
  {
    "day": {dayNumber},
    "time": "HH:00" ou "HH:30",
    "name": "string",
    "duration": number,
    "reason": "string",
    "tip": "string",
    "location": { "lat": number, "lng": number }
  }
]

RESPONDA AGORA:
```

### Exemplo de Uso

```javascript
const dayNumber = 2;
const existingAttractionsForDay = `
09:00-10:00: Miradouro de São Jorge
11:00-12:00: Castelo de São Jorge
14:00-16:00: Basílica da Estrela
`;

// Sugerir próxima atração
const prompt = `Você é um guia turístico especializado em Lisboa, Portugal.

O usuário está visitando Lisboa no dia 2 de um roteiro de 3 dias.
Já tem 3 atrações neste dia.

PERFIL:
- Interesses: gastronomia, história, médio
- Orçamento: médio
- Viaja com: casal

CONTEXTO:
${existingAttractionsForDay}

Sugira 1 atração adicional...
`;
```

---

## 📋 PROMPT 3: EXPLICAR ATRAÇÃO

### Use Case
Quando usuário clica em uma atração para entender melhor.

### Prompt Template

```text
Forneça uma descrição detalhada e prática de "{attractionName}" em {destination}.

INCLUA:
1. História e contexto (1-2 frases)
2. O que esperar (1-2 frases)
3. Tempo ideal de visita (duração)
4. Melhor hora para visitar
5. Quanto custa (estimativa)
6. Como chegar (transporte)
7. Dicas insider (2-3 dicas)
8. Acessibilidade
9. O que não perder

FORMATO: Retorne um JSON com a estrutura:
{
  "titulo": "string",
  "historia": "string",
  "oQueEsperar": "string",
  "tempoIdeal": "number (minutos)",
  "melhorHora": "string (ex: 09:00-11:00)",
  "custo": "string (ex: €10-15)",
  "comoChegar": "string",
  "dicas": ["string", "string", "string"],
  "acessibilidade": "string",
  "oQueNaoPerder": "string"
}

RESPONDA AGORA:
```

### Exemplo de Resposta

```json
{
  "titulo": "Torre de Belém",
  "historia": "Construída em 1514 como fortaleza defensiva do Tejo, patrimônio UNESCO",
  "oQueEsperar": "Monumento imponente de arquitetura manuelina com vistas panorâmicas do rio",
  "tempoIdeal": 90,
  "melhorHora": "17:00-19:00",
  "custo": "€12",
  "comoChegar": "Autocarro 15, 17 ou a pé desde Belém",
  "dicas": [
    "Suba até ao topo para as melhores fotos",
    "Leve protetor solar, há pouca sombra",
    "Leve água, a fila de entrada é longa"
  ],
  "acessibilidade": "Parcialmente acessível, degraus e escadas",
  "oQueNaoPerder": "A vista para o Tejo ao pôr do sol"
}
```

---

## 📋 PROMPT 4: REESCREVER ROTEIRO

### Use Case
Quando usuário quer uma versão diferente (mais aventura, mais relaxo, etc).

### Prompt Template

```text
O usuário tem um roteiro de {days} dias em {destination} e quer reescrever seguindo uma nova vibe.

ROTEIRO ATUAL:
{currentItinerary}

NOVA VIBE DESEJADA: {newVibe}
(ex: mais relaxado, mais aventura, mais místico, mais gastronômico, etc)

RESTRIÇÕES:
- Manter alguns locais icônicos de {destination}
- Respeitar os interesses: {tags}
- Orçamento: {budget}
- Viaja com: {companion}

Reescreva o roteiro com a nova vibe, mantendo a estrutura (dias, horários, durações).

FORMATO: Retorne APENAS um array JSON válido com a estrutura:
[
  {
    "day": number,
    "time": "HH:00" ou "HH:30",
    "name": "string",
    "duration": number,
    "reason": "string",
    "tip": "string",
    "location": { "lat": number, "lng": number }
  }
]

RESPONDA AGORA:
```

---

## 📋 PROMPT 5: OTIMIZAR ROTA

### Use Case
Quando usuário clica em "Otimizar rota" para reorganizar atrações por proximidade.

### Prompt Template

```text
O usuário tem estas atrações planejadas para o dia {dayNumber} em {destination}:

{attractionsForDay}

A rota atual está desordenada. Reorganize para minimizar deslocamento.

REGRAS:
1. Mantenha os mesmos horários, só reordene as atrações
2. Considere: proximidade, tempo entre atrações, abertura dos locais
3. Horários devem respeitar operação dos locais
4. Evite ida/volta ao mesmo lugar

Retorne um array JSON com mesma estrutura, mas reordenado:

[
  {
    "day": number,
    "time": "HH:00",
    "name": "string",
    "duration": number,
    "reason": "string",
    "tip": "string",
    "location": { "lat": number, "lng": number }
  }
]

RESPONDA AGORA:
```

---

## 📋 PROMPT 6: SUGERIR ALTERNATIVAS

### Use Case
Quando usuário quer 3 opções diferentes para a mesma atração.

### Prompt Template

```text
O usuário tem uma atração planejada: "{currentAttraction}" em {destination} no dia {dayNumber}.

Sugira 3 alternativas similares que:
1. Estejam próximas à atração original
2. Alinha com interesses: {tags}
3. Tenham duração similar ({currentDuration} minutos)
4. Encaixem no orçamento: {budget}

FORMATO: Retorne um JSON com 3 alternativas:
{
  "original": {
    "name": "string",
    "location": { "lat": number, "lng": number }
  },
  "alternativas": [
    {
      "name": "string",
      "reason": "string",
      "duration": number,
      "location": { "lat": number, "lng": number },
      "porque_melhor": "string"
    }
  ]
}

RESPONDA AGORA:
```

---

## 📋 PROMPT 7: CRIAR ROTEIRO DO ZERO (CONVERSA)

### Use Case
Chat interativo para criar roteiro customizado conversa.

### Prompt Template

```text
Você é um especialista em roteiros de viagem conversacional.

O usuário quer criar um roteiro para {destination} em {days} dias.

FAÇA estas perguntas se não tiver respostas:
1. Quais são seus principais interesses? (gastronomia, história, natureza, etc)
2. Qual é seu orçamento? (baixo/médio/alto)
3. Com quem você viaja? (solo/casal/família/grupo)
4. Qual é seu ritmo? (relaxado/moderado/intenso)
5. Tem alguma atração que NÃO quer perder?

APÓS COLETAR INFO: Gere um roteiro inicial baseado nas respostas.

FORMATO: Se solicitar roteiro, retorne JSON conforme padrão anterior.
Se conversando, retorne texto conversacional.

RESPONDA AGORA:
```

---

## 🔧 IMPLEMENTAÇÃO: FUNÇÃO WRAPPER

### Em `src/services/gemini.ts`

```typescript
import axios from 'axios';

interface GeminiPromptParams {
  destination: string;
  days: number;
  tags: string[];
  budget: 'baixo' | 'médio' | 'alto';
  companion: string;
}

interface GeminiAttraction {
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip: string;
  location: {
    lat: number;
    lng: number;
  };
}

// ✅ PROMPT 1: Roteiro Principal
export async function generateItineraryWithGemini(
  params: GeminiPromptParams
): Promise<GeminiAttraction[]> {
  const { destination, days, tags, budget, companion } = params;

  const prompt = `Você é um especialista em roteiros de viagem com experiência em ${destination}.

Crie um roteiro de ${days} dias em ${destination} para um viajante com estas preferências:

PERFIL DO VIAJANTE:
- Interesses: ${tags.join(', ')}
- Orçamento: ${budget}
- Viaja com: ${companion}
- Idioma: português

INSTRUÇÕES:
1. Crie ${days} dias de roteiro completo
2. Distribua as atrações igualmente entre os dias
3. Cada atração deve ter um horário realista (09:00-20:00)
4. Considere tempo de deslocamento entre atrações
5. Priorize atrações alinhadas com os interesses do viajante
6. Inclua pelo menos 1 experiência gastronômica por dia
7. Adicione dicas práticas e realistas
8. Locais devem ter coordenadas geográficas precisas

FORMATO: Retorne APENAS um array JSON válido, sem explicações adicionais.
Cada item deve ter EXATAMENTE estes campos:

[
  {
    "day": number,
    "time": "HH:00" ou "HH:30",
    "name": "string",
    "duration": number (em minutos),
    "reason": "string (por que visitar)",
    "tip": "string (dica prática)",
    "location": {
      "lat": number (precisão: 2-4 casas decimais),
      "lng": number (precisão: 2-4 casas decimais)
    }
  }
]

RESPONDA AGORA:`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    // TODO: Extrair texto da resposta
    const responseText = response.data.candidates[0].content.parts[0].text;

    // TODO: Limpar JSON se tiver markdown code blocks
    let jsonString = responseText.trim();
    if (jsonString.includes('```json')) {
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonString.includes('```')) {
      jsonString = jsonString.replace(/```\n?/g, '');
    }

    // TODO: Parser JSON
    const attractions: GeminiAttraction[] = JSON.parse(jsonString);

    // TODO: Validar estrutura
    validateAttractions(attractions);

    return attractions;
  } catch (error) {
    console.error('❌ Erro ao gerar roteiro:', error);
    throw new Error('Falha ao gerar roteiro com IA');
  }
}

// ✅ PROMPT 2: Adicionar Atração em um Dia
export async function addAttractionToDay(
  destination: string,
  dayNumber: number,
  totalDays: number,
  existingAttractions: string,
  tags: string[],
  budget: string,
  companion: string
): Promise<GeminiAttraction[]> {
  const prompt = `Você é um guia turístico especializado em ${destination}.

O usuário está visitando ${destination} no dia ${dayNumber} de um roteiro de ${totalDays} dias.

PERFIL DO USUÁRIO:
- Interesses: ${tags.join(', ')}
- Orçamento: ${budget}
- Viaja com: ${companion}

CONTEXTO DO ROTEIRO:
${existingAttractions}

Sugira 1 atração adicional para ${destination} que:
1. Complemente as já planejadas
2. Alinhe com os interesses do usuário
3. Seja viável para inserir neste dia
4. Tenha horários realistas

FORMATO: Retorne APENAS um array JSON válido com 1 objeto...`;

  // TODO: Implementar similar a generateItineraryWithGemini
  return [];
}

// ✅ PROMPT 3: Explicar Atração
export async function explainAttraction(
  attractionName: string,
  destination: string
): Promise<{
  titulo: string;
  historia: string;
  oQueEsperar: string;
  tempoIdeal: number;
  melhorHora: string;
  custo: string;
  comoChegar: string;
  dicas: string[];
  acessibilidade: string;
  oQueNaoPerder: string;
}> {
  const prompt = `Forneça uma descrição detalhada e prática de "${attractionName}" em ${destination}.

INCLUA:
1. História e contexto (1-2 frases)
2. O que esperar (1-2 frases)
3. Tempo ideal de visita
4. Melhor hora para visitar
5. Quanto custa
6. Como chegar
7. Dicas insider
8. Acessibilidade
9. O que não perder

FORMATO: Retorne um JSON com a estrutura:
{
  "titulo": "string",
  "historia": "string",
  "oQueEsperar": "string",
  "tempoIdeal": "number (minutos)",
  "melhorHora": "string",
  "custo": "string",
  "comoChegar": "string",
  "dicas": ["string", "string", "string"],
  "acessibilidade": "string",
  "oQueNaoPerder": "string"
}`;

  // TODO: Implementar
  return {} as any;
}

// ✅ PROMPT 4: Reescrever Roteiro
export async function rewriteItinerary(
  currentItinerary: string,
  newVibe: string,
  destination: string,
  days: number,
  tags: string[],
  budget: string,
  companion: string
): Promise<GeminiAttraction[]> {
  const prompt = `O usuário tem um roteiro de ${days} dias em ${destination} e quer reescrever com vibe: ${newVibe}

ROTEIRO ATUAL:
${currentItinerary}

RESTRIÇÕES:
- Interesses: ${tags.join(', ')}
- Orçamento: ${budget}
- Viaja com: ${companion}

Reescreva o roteiro com a nova vibe...`;

  // TODO: Implementar
  return [];
}

// ✅ Função Auxiliar: Validar Atrações
function validateAttractions(attractions: GeminiAttraction[]): void {
  if (!Array.isArray(attractions)) {
    throw new Error('Resposta não é um array');
  }

  attractions.forEach((attraction, index) => {
    if (!attraction.day || !attraction.time || !attraction.name || !attraction.duration) {
      throw new Error(`Atração ${index} está incompleta`);
    }

    if (attraction.day < 1 || attraction.day > 30) {
      throw new Error(`Dia inválido: ${attraction.day}`);
    }

    if (!/^\d{2}:\d{2}$/.test(attraction.time)) {
      throw new Error(`Hora inválida: ${attraction.time}`);
    }

    if (attraction.location.lat < -90 || attraction.location.lat > 90) {
      throw new Error(`Latitude inválida: ${attraction.location.lat}`);
    }

    if (attraction.location.lng < -180 || attraction.location.lng > 180) {
      throw new Error(`Longitude inválida: ${attraction.location.lng}`);
    }
  });
}
```

---

## 🎯 BOAS PRÁTICAS

### ✅ DO:
- ✅ Incluir contexto detalhado no prompt
- ✅ Especificar formato exato esperado (JSON)
- ✅ Usar placeholders `{variável}` para dados dinâmicos
- ✅ Validar resposta JSON antes de usar
- ✅ Incluir instruções "RESPONDA AGORA" ao final
- ✅ Testar com múltiplos destinos/durações
- ✅ Cacheear respostas para evitar custos

### ❌ DON'T:
- ❌ Não confiar cegamente em resposta
- ❌ Não esquecer validação de campos obrigatórios
- ❌ Não usar prompts muito genéricos
- ❌ Não fazer parsing de JSON sem try-catch
- ❌ Não pedir texto livre, sempre JSON estruturado
- ❌ Não esquecer de testar edge cases (1 dia, 21 dias, etc)

---

## 🧪 TESTES

### Test 1: Roteiro 3 Dias - Lisboa

```typescript
const result = await generateItineraryWithGemini({
  destination: 'Lisboa, Portugal',
  days: 3,
  tags: ['gastronomia', 'história', 'médio'],
  budget: 'médio',
  companion: 'casal',
});

// ✅ Esperado:
// - Array com 9-12 atrações (3-4 por dia)
// - Todos dias 1, 2, 3
// - Horários entre 09:00-20:00
// - Durações entre 30-180 minutos
// - Lat/lng dentro de Portugal
```

### Test 2: Roteiro 1 Dia - Paris

```typescript
const result = await generateItineraryWithGemini({
  destination: 'Paris, França',
  days: 1,
  tags: ['arte', 'romântico'],
  budget: 'alto',
  companion: 'casal',
});

// ✅ Esperado:
// - Array com 4-6 atrações
// - Todos dia 1
// - Logicamente sequenciados
```

### Test 3: Roteiro 7 Dias - São Paulo

```typescript
const result = await generateItineraryWithGemini({
  destination: 'São Paulo, Brasil',
  days: 7,
  tags: ['gastronomia', 'arte', 'história', 'intenso'],
  budget: 'médio',
  companion: 'grupo',
});

// ✅ Esperado:
// - Array com 21-28 atrações (3-4 por dia)
// - Variação de atrações (não repetir)
// - Mix de gastronomia, museus, histórico
```

---

## 💰 OTIMIZAÇÃO DE CUSTOS

### Estratégia de Caching

```typescript
// Implementar cache local com AsyncStorage
interface CachedPromptResult {
  hash: string;           // Hash dos parâmetros
  result: GeminiAttraction[];
  timestamp: number;
  expiresAt: number;      // 7 dias de cache
}

async function generateWithCache(params: GeminiPromptParams) {
  const hash = hashParams(params);
  const cached = await AsyncStorage.getItem(`prompt_${hash}`);

  if (cached && JSON.parse(cached).expiresAt > Date.now()) {
    console.log('✅ Usando cache');
    return JSON.parse(cached).result;
  }

  console.log('🔄 Gerando novo roteiro');
  const result = await generateItineraryWithGemini(params);
  
  // Salvar em cache
  await AsyncStorage.setItem(
    `prompt_${hash}`,
    JSON.stringify({
      hash,
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
    })
  );

  return result;
}

function hashParams(params: GeminiPromptParams): string {
  const str = JSON.stringify(params);
  return crypto.createHash('md5').update(str).digest('hex');
}
```

### Custos Estimados

| Cenário | Requisições/mês | Custo (USD) |
|---------|-----------------|------------|
| 100 usuários, 1 roteiro/mês | 100 | $0.50 |
| 1K usuários, 2 roteiros/mês | 2,000 | $10 |
| 10K usuários, 3 roteiros/mês | 30,000 | $150 |

---

## 📚 REFERÊNCIAS

- [Gemini API Docs](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_design)
- [JSON Mode](https://ai.google.dev/docs/faq#json_mode)
- [Rate Limits](https://ai.google.dev/docs/rate_limit)

---

## 🚀 CHECKLIST DE IMPLEMENTAÇÃO

### Phase 1: Setup
- [ ] Adicionar Gemini API key ao .env
- [ ] Instalar axios (ou usar fetch)
- [ ] Criar arquivo `src/services/gemini.ts`

### Phase 2: Implementação
- [ ] Implementar `generateItineraryWithGemini()`
- [ ] Implementar validação JSON
- [ ] Implementar tratamento de erros

### Phase 3: Integração
- [ ] Conectar em `CreateTripScreen.tsx`
- [ ] Testar com 3+ destinos
- [ ] Implementar loading visual

### Phase 4: Otimização
- [ ] Implementar cache com AsyncStorage
- [ ] Monitorar custos de API
- [ ] Otimizar prompts baseado em feedback

---

**Status:** ✅ Prompts pronto para implementação  
**Última atualização:** 21 de outubro de 2025  
**Versão:** 1.0
