/**
 * Destination Suggestion Service
 * Uses Gemini AI to provide personalized destination suggestions
 * based on user preferences and manual search input
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripType, BudgetPerDay, GroupType } from '../types';

interface DestinationSuggestion {
  name: string;
  country: string;
  emoji: string;
  reason: string;
  matchScore: number; // 0-100
  whyRecommended: string[];
}

export async function getAISuggestionsForSearchInput(
  searchInput: string,
  tripTypes: TripType[],
  interests?: string[],
  groupType?: GroupType,
  budget?: BudgetPerDay,
  language: string = 'pt-BR',
  tripScope?: 'nacional' | 'internacional' | ''
): Promise<DestinationSuggestion[]> {
  if (!searchInput || searchInput.trim().length < 2) {
    return [];
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY not found, skipping AI suggestions');
      return [];
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-pro' });

    // Build preference context
    const tripTypeStr = tripTypes.join(', ');
    const interestsStr = interests?.join(', ') || 'não especificados';
    const budgetStr = budget || 'não especificado';
    const groupStr = groupType || 'não especificado';
    const langStr = language === 'pt-BR' ? 'português' : language === 'es-ES' ? 'espanhol' : 'inglês';

  const prompt = `Você é um especialista em viagens e turismo. O usuário está buscando por "${searchInput}" como destino de viagem.

Preferências do usuário:
- Tipos de viagem: ${tripTypeStr}
- Interesses: ${interestsStr}
- Tipo de grupo: ${groupStr}
- Orçamento: ${budgetStr}
- Idioma da resposta: ${langStr}
 - Escopo da viagem: ${tripScope || 'não especificado'}

Com base nessas preferências, forneça até 3 MELHORES sugestões de destinos que correspondem à busca do usuário.

IMPORTANTE: Responda APENAS com um JSON válido, nada mais. Não inclua marcadores de código ou explicações adicionais.

Formato da resposta (JSON):
[
  {
    "name": "Nome da Cidade",
    "country": "País",
    "emoji": "🏖️",
    "reason": "Uma frase curta explicando por que este destino",
    "matchScore": 85,
    "whyRecommended": [
      "Razão 1",
      "Razão 2",
      "Razão 3"
    ]
  }
]

Certifique-se de que o JSON está válido e que cada destino tem um matchScore entre 0-100.`;

    console.log('🤖 Requesting AI suggestions for:', searchInput);
  const response = await model.generateContent(prompt);
    const textResponse = response.response.text();

    console.log('🤖 Raw AI response:', textResponse.substring(0, 200));

    // Parse JSON response
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not find JSON in AI response');
      return [];
    }

    const suggestions: DestinationSuggestion[] = JSON.parse(jsonMatch[0]);

    // Validate and filter suggestions
    const validSuggestions = suggestions.filter(
      (s): s is DestinationSuggestion =>
        s &&
        typeof s === 'object' &&
        typeof s.name === 'string' &&
        typeof s.country === 'string' &&
        typeof s.matchScore === 'number' &&
        s.matchScore >= 0 &&
        s.matchScore <= 100
    );

    console.log('✅ AI suggestions generated:', validSuggestions.length);
    return validSuggestions;
  } catch (error) {
    console.error('❌ Error generating AI suggestions:', error);
    return [];
  }
}
