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
