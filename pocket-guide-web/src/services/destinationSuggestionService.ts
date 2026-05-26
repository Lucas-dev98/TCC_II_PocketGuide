/**
 * Destination Suggestion Service
 * Uses Gemini AI to provide personalized destination suggestions
 * based on user preferences and manual search input
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripType, BudgetPerDay, GroupType } from '../types';
import { DESTINATIONS_DB, matchDestinations, DestinationScore } from '../utils/destinationMatcher';

interface DestinationSuggestion {
  name: string;
  country: string;
  emoji: string;
  reason: string;
  matchScore: number; // 0-100
  whyRecommended: string[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesTripScope(country: string, tripScope?: 'nacional' | 'internacional' | ''): boolean {
  if (!tripScope) return true;

  const normalizedCountry = normalizeText(country);
  const isBrazil = normalizedCountry === 'brazil' || normalizedCountry === 'brasil';
  if (tripScope === 'nacional') return isBrazil;
  if (tripScope === 'internacional') return !isBrazil;
  return true;
}

function getRuleBasedSuggestions(
  searchInput: string,
  tripTypes: TripType[],
  interests?: string[],
  groupType?: GroupType,
  budget?: BudgetPerDay,
  tripScope?: 'nacional' | 'internacional' | ''
): DestinationSuggestion[] {
  const normalizedSearch = normalizeText(searchInput);

  const ranking = matchDestinations(
    tripTypes,
    interests,
    groupType,
    undefined,
    undefined,
    budget,
    undefined,
    undefined,
    '',
    '',
    tripScope
  );

  const rankingMap = new Map<string, DestinationScore>();
  ranking.forEach((item) => {
    rankingMap.set(normalizeText(item.name), item);
  });

  const directMatches = DESTINATIONS_DB.filter((destination) => {
    if (!matchesTripScope(destination.country, tripScope)) {
      return false;
    }

    const normalizedName = normalizeText(destination.name);
    const normalizedCountry = normalizeText(destination.country);

    return (
      normalizedName.includes(normalizedSearch) ||
      normalizedSearch.includes(normalizedName) ||
      normalizedCountry.includes(normalizedSearch)
    );
  });

  const candidates = directMatches.length > 0
    ? directMatches
    : DESTINATIONS_DB.filter((destination) => matchesTripScope(destination.country, tripScope));

  return candidates
    .map((destination) => {
      const ranked = rankingMap.get(normalizeText(destination.name));
      const score = ranked?.score ?? 60;
      const reasons = ranked?.reasons ?? ['Compatibilidade com suas preferências'];

      return {
        name: destination.name,
        country: destination.country,
        emoji: destination.emoji,
        reason: reasons[0] || destination.description,
        matchScore: Math.min(100, Math.max(0, score)),
        whyRecommended: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function mergeSuggestions(
  aiSuggestions: DestinationSuggestion[],
  ruleSuggestions: DestinationSuggestion[]
): DestinationSuggestion[] {
  const merged = new Map<string, DestinationSuggestion>();

  ruleSuggestions.forEach((item) => {
    merged.set(normalizeText(item.name), item);
  });

  aiSuggestions.forEach((item) => {
    const key = normalizeText(item.name);
    const base = merged.get(key);

    if (!base) {
      merged.set(key, {
        ...item,
        matchScore: Math.round(item.matchScore * 0.8),
      });
      return;
    }

    const blendedScore = Math.round((base.matchScore * 0.7) + (item.matchScore * 0.3));
    const reasons = [...base.whyRecommended, ...item.whyRecommended];

    merged.set(key, {
      ...base,
      reason: base.reason || item.reason,
      matchScore: blendedScore,
      whyRecommended: Array.from(new Set(reasons)).slice(0, 3),
    });
  });

  return Array.from(merged.values())
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
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

  const ruleSuggestions = getRuleBasedSuggestions(
    searchInput,
    tripTypes,
    interests,
    groupType,
    budget,
    tripScope
  );

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ VITE_GEMINI_API_KEY not found, skipping AI suggestions');
      return ruleSuggestions;
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
        s.matchScore <= 100 &&
        matchesTripScope(s.country, tripScope)
    );

    console.log('✅ AI suggestions generated:', validSuggestions.length);
    return mergeSuggestions(validSuggestions, ruleSuggestions);
  } catch (error) {
    console.error('❌ Error generating AI suggestions:', error);
    return ruleSuggestions;
  }
}
