/**
 * promptTranslator.ts - Translate Gemini AI prompts based on user language
 * 
 * Features:
 * - Generate Gemini prompts in PT-BR, EN-US, ES-ES
 * - Translate activity categories
 * - Translate tips and descriptions
 * - Support multi-language itinerary generation
 */

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Get system instruction in the specified language
 */
export const getSystemInstruction = (language: LanguageCode): string => {
  const instructions: Record<LanguageCode, string> = {
    'pt-BR': 'Retorne apenas JSON válido. Sem markdown. Sem explicações. Sem pensamentos.',
    'en-US': 'Return only valid JSON. No markdown. No explanation. No thinking.',
    'es-ES': 'Devuelva solo JSON válido. Sin markdown. Sin explicación. Sin pensamientos.',
  };
  
  return instructions[language] || instructions['en-US'];
};

/**
 * Generate itinerary prompt in the specified language
 */
export const generateItineraryPrompt = (
  days: number,
  destination: string,
  budget: string,
  groupType: string,
  tags: string[],
  language: LanguageCode
): string => {
  const tagsString = tags.join(', ');
  
  const prompts: Record<LanguageCode, (days: number, dest: string, budget: string, group: string, tags: string) => string> = {
    'pt-BR': (days, dest, budget, group, tags) => 
      `Gere um roteiro de ${days} dias para ${dest} (orçamento ${budget}, grupo ${group}, interesses: ${tags})
Retorne apenas JSON com ${days * 3} atividades no seguinte formato:
{"itinerary":[{"day":1,"time":"09:00","name":"Local","duration":120,"reason":"Por que visitar","tip":"Dica útil","category":"Categoria","lat":0,"lng":0}]}
As atividades devem estar em português e incluir nomes reais de locais, horários realistas e dicas práticas.`,
    
    'en-US': (days, dest, budget, group, tags) =>
      `Generate a ${days}-day itinerary for ${dest} (${budget} budget, ${group} group, interests: ${tags})
Return only JSON with ${days * 3} activities in the following format:
{"itinerary":[{"day":1,"time":"09:00","name":"Place","duration":120,"reason":"Why visit","tip":"Practical tip","category":"Category","lat":0,"lng":0}]}
Activities should include real place names, realistic times, and practical tips.`,
    
    'es-ES': (days, dest, budget, group, tags) =>
      `Genere un itinerario de ${days} días para ${dest} (presupuesto ${budget}, grupo ${group}, intereses: ${tags})
Devuelva solo JSON con ${days * 3} actividades en el siguiente formato:
{"itinerary":[{"day":1,"time":"09:00","name":"Lugar","duration":120,"reason":"Por qué visitar","tip":"Consejo práctico","category":"Categoría","lat":0,"lng":0}]}
Las actividades deben incluir nombres de lugares reales, horarios realistas y consejos prácticos.`,
  };
  
  const promptGenerator = prompts[language] || prompts['en-US'];
  return promptGenerator(days, destination, budget, groupType, tagsString);
};

/**
 * Translate activity categories
 */
export const translateCategory = (category: string, language: LanguageCode): string => {
  const categoryTranslations: Record<string, Record<LanguageCode, string>> = {
    'Historical': {
      'pt-BR': 'Histórico',
      'en-US': 'Historical',
      'es-ES': 'Histórico',
    },
    'Cultural': {
      'pt-BR': 'Cultural',
      'en-US': 'Cultural',
      'es-ES': 'Cultural',
    },
    'Food & Beverage': {
      'pt-BR': 'Gastronomia',
      'en-US': 'Food & Beverage',
      'es-ES': 'Gastronomía',
    },
    'Nature': {
      'pt-BR': 'Natureza',
      'en-US': 'Nature',
      'es-ES': 'Naturaleza',
    },
    'Adventure': {
      'pt-BR': 'Aventura',
      'en-US': 'Adventure',
      'es-ES': 'Aventura',
    },
    'Relaxation': {
      'pt-BR': 'Relaxamento',
      'en-US': 'Relaxation',
      'es-ES': 'Relajación',
    },
    'Shopping': {
      'pt-BR': 'Compras',
      'en-US': 'Shopping',
      'es-ES': 'Compras',
    },
    'Art & Museums': {
      'pt-BR': 'Arte & Museus',
      'en-US': 'Art & Museums',
      'es-ES': 'Arte & Museos',
    },
    'Entertainment': {
      'pt-BR': 'Entretenimento',
      'en-US': 'Entertainment',
      'es-ES': 'Entretenimiento',
    },
    'Exploration': {
      'pt-BR': 'Exploração',
      'en-US': 'Exploration',
      'es-ES': 'Exploración',
    },
    'Beach': {
      'pt-BR': 'Praia',
      'en-US': 'Beach',
      'es-ES': 'Playa',
    },
    'Nightlife': {
      'pt-BR': 'Vida Noturna',
      'en-US': 'Nightlife',
      'es-ES': 'Vida Nocturna',
    },
  };
  
  return categoryTranslations[category]?.[language] || category;
};

/**
 * Get budget translations
 */
export const translateBudget = (budget: string, language: LanguageCode): string => {
  const budgetTranslations: Record<string, Record<LanguageCode, string>> = {
    'econômico': {
      'pt-BR': 'econômico',
      'en-US': 'budget',
      'es-ES': 'económico',
    },
    'médio': {
      'pt-BR': 'médio',
      'en-US': 'mid-range',
      'es-ES': 'medio',
    },
    'luxo': {
      'pt-BR': 'luxo',
      'en-US': 'luxury',
      'es-ES': 'lujo',
    },
    'economic': {
      'pt-BR': 'econômico',
      'en-US': 'budget',
      'es-ES': 'económico',
    },
    'mid': {
      'pt-BR': 'médio',
      'en-US': 'mid-range',
      'es-ES': 'medio',
    },
    'luxury': {
      'pt-BR': 'luxo',
      'en-US': 'luxury',
      'es-ES': 'lujo',
    },
  };
  
  const budgetLower = budget.toLowerCase();
  return budgetTranslations[budgetLower]?.[language] || budget;
};

/**
 * Get group type translations
 */
export const translateGroupType = (groupType: string, language: LanguageCode): string => {
  const groupTranslations: Record<string, Record<LanguageCode, string>> = {
    'casal': {
      'pt-BR': 'casal',
      'en-US': 'couple',
      'es-ES': 'pareja',
    },
    'family': {
      'pt-BR': 'família',
      'en-US': 'family',
      'es-ES': 'familia',
    },
    'friends': {
      'pt-BR': 'amigos',
      'en-US': 'friends',
      'es-ES': 'amigos',
    },
    'solo': {
      'pt-BR': 'viagem solo',
      'en-US': 'solo traveler',
      'es-ES': 'viaje en solitario',
    },
    'group': {
      'pt-BR': 'grupo',
      'en-US': 'group',
      'es-ES': 'grupo',
    },
    'couple': {
      'pt-BR': 'casal',
      'en-US': 'couple',
      'es-ES': 'pareja',
    },
  };
  
  const groupLower = groupType.toLowerCase();
  return groupTranslations[groupLower]?.[language] || groupType;
};

/**
 * Get error messages in the specified language
 */
export const getErrorMessage = (errorType: string, language: LanguageCode): string => {
  const errorMessages: Record<string, Record<LanguageCode, string>> = {
    'API_ERROR': {
      'pt-BR': 'Erro ao conectar com a IA. Tente novamente.',
      'en-US': 'Error connecting to AI service. Please try again.',
      'es-ES': 'Error al conectar con el servicio de IA. Intente de nuevo.',
    },
    'INVALID_RESPONSE': {
      'pt-BR': 'Resposta inválida da IA. Usando itinerário padrão.',
      'en-US': 'Invalid response from AI. Using default itinerary.',
      'es-ES': 'Respuesta inválida de la IA. Usando itinerario predeterminado.',
    },
    'RETRY_FAILED': {
      'pt-BR': 'Falha ao gerar itinerário após várias tentativas.',
      'en-US': 'Failed to generate itinerary after multiple attempts.',
      'es-ES': 'No se pudo generar el itinerario después de varios intentos.',
    },
    'NO_API_KEY': {
      'pt-BR': 'Chave da API não configurada.',
      'en-US': 'API key not configured.',
      'es-ES': 'Clave de API no configurada.',
    },
  };
  
  return errorMessages[errorType]?.[language] || 'An error occurred';
};

/**
 * Get system instruction for date recommendations
 */
export const getSystemInstructionForDates = (language: LanguageCode = 'pt-BR'): string => {
  const instructions: Record<LanguageCode, string> = {
    'pt-BR': `Você é um especialista em planejamento de viagens com profundo conhecimento de:
- Melhor época para cada destino (clima, preços, eventos, turismo)
- Padrões sazonais e variações climáticas mundiais
- Períodos de festas e eventos culturais
- Flutuações de preço de viagens por temporada

Quando um usuário descreve uma viagem, você fornecerá exatamente 3 recomendações de datas com:
1. Período específico (data início e fim)
2. Motivos em 4 categorias: clima, multidão, orçamento, eventos
3. Score de confiança (1-100)
4. Emoji representativo

Responda SEMPRE em JSON válido, nunca em markdown.`,
    
    'en-US': `You are an expert travel planning specialist with deep knowledge of:
- Best season for each destination (weather, prices, events, tourism)
- Seasonal patterns and climate variations worldwide
- Holiday and cultural event periods
- Travel price fluctuations by season

When a user describes a trip, provide exactly 3 date recommendations with:
1. Specific period (start and end date)
2. Reasons in 4 categories: climate, crowds, budget, events
3. Confidence score (1-100)
4. Representative emoji

Always respond in valid JSON, never in markdown.`,
    
    'es-ES': `Eres un especialista en planificación de viajes con profundo conocimiento de:
- Mejor época para cada destino (clima, precios, eventos, turismo)
- Patrones estacionales y variaciones climáticas mundiales
- Períodos de fiestas y eventos culturales
- Fluctuaciones de precios de viajes por temporada

Cuando un usuario describe un viaje, proporciona exactamente 3 recomendaciones de fechas con:
1. Período específico (fecha inicio y fin)
2. Razones en 4 categorías: clima, multitud, presupuesto, eventos
3. Puntuación de confianza (1-100)
4. Emoji representativo

Responde SIEMPRE en JSON válido, nunca en markdown.`,
  };

  return instructions[language] || instructions['pt-BR'];
};

/**
 * Generate date recommendation prompt in the specified language
 */
export const generateDateRecommendationPrompt = (
  destination: string,
  tripType: string,
  interests: string[],
  budget: string = 'medio',
  minDuration: number = 7,
  maxDuration: number = 10,
  language: LanguageCode = 'pt-BR',
): string => {
  const budgetMap: Record<string, Record<LanguageCode, string>> = {
    'econômico': { 'pt-BR': 'econômico', 'en-US': 'budget-friendly', 'es-ES': 'económico' },
    'médio': { 'pt-BR': 'médio', 'en-US': 'moderate', 'es-ES': 'moderado' },
    'luxo': { 'pt-BR': 'luxuoso', 'en-US': 'luxury', 'es-ES': 'lujoso' },
  };

  const tripTypeMap: Record<string, Record<LanguageCode, string>> = {
    'solo': { 'pt-BR': 'viajante solo', 'en-US': 'solo traveler', 'es-ES': 'viajero solo' },
    'casal': { 'pt-BR': 'casal', 'en-US': 'couple', 'es-ES': 'pareja' },
    'família': { 'pt-BR': 'família', 'en-US': 'family', 'es-ES': 'familia' },
    'amigos': { 'pt-BR': 'grupo de amigos', 'en-US': 'friends group', 'es-ES': 'grupo de amigos' },
  };

  const templates: Record<LanguageCode, string> = {
    'pt-BR': `Analise as seguintes preferências de viagem e recomende as 3 melhores épocas:

**Destino**: ${destination}
**Tipo de Viagem**: ${tripTypeMap[tripType]?.[language] || tripType}
**Interesses**: ${interests.join(', ')}
**Orçamento**: ${budgetMap[budget]?.[language] || budget}
**Duração Desejada**: ${minDuration}-${maxDuration} dias

Para cada recomendação, forneça um JSON com exatamente esta estrutura:
[
  {
    "label": "🌞 Descrição curta",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Descrição do clima nessa época",
      "crowds": "Informação sobre turismo/multidão",
      "budget": "Informação sobre preços e custos",
      "events": "Eventos ou festividades relevantes"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Importante:
- Datas devem ser futuras (a partir de hoje)
- Responda APENAS com JSON válido
- Scores: 90-100 (excelente), 75-89 (bom), 60-74 (aceitável)
- Emoji deve ser representativo da sugestão`,

    'en-US': `Analyze the following travel preferences and recommend the 3 best times to travel:

**Destination**: ${destination}
**Trip Type**: ${tripTypeMap[tripType]?.[language] || tripType}
**Interests**: ${interests.join(', ')}
**Budget**: ${budgetMap[budget]?.[language] || budget}
**Desired Duration**: ${minDuration}-${maxDuration} days

For each recommendation, provide JSON with exactly this structure:
[
  {
    "label": "🌞 Short description",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Weather description for this period",
      "crowds": "Information about tourism/crowds",
      "budget": "Information about prices and costs",
      "events": "Relevant events or festivities"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Important:
- Dates must be future (from today onwards)
- Respond ONLY with valid JSON
- Scores: 90-100 (excellent), 75-89 (good), 60-74 (acceptable)
- Emoji should be representative of the suggestion`,

    'es-ES': `Analiza las siguientes preferencias de viaje y recomienda los 3 mejores momentos:

**Destino**: ${destination}
**Tipo de Viaje**: ${tripTypeMap[tripType]?.[language] || tripType}
**Intereses**: ${interests.join(', ')}
**Presupuesto**: ${budgetMap[budget]?.[language] || budget}
**Duración Deseada**: ${minDuration}-${maxDuration} días

Para cada recomendación, proporciona JSON con exactamente esta estructura:
[
  {
    "label": "🌞 Descripción corta",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Descripción del clima en esta época",
      "crowds": "Información sobre turismo/multitud",
      "budget": "Información sobre precios y costos",
      "events": "Eventos o festividades relevantes"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Importante:
- Las fechas deben ser futuras (a partir de hoy)
- Responde SOLO con JSON válido
- Puntuaciones: 90-100 (excelente), 75-89 (bueno), 60-74 (aceptable)
- El emoji debe ser representativo de la sugestión`,
  };

  return templates[language] || templates['pt-BR'];
};

