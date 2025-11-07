/**
 * destinationRecommendationService.ts - AI-powered Destination Recommendations with Gemini
 * 
 * Generates personalized destination recommendations based on:
 * - Travel type and interests
 * - Group composition and size
 * - Budget constraints
 * - Travel dates and season
 * 
 * Uses Gemini 2.0 Flash API for intelligent analysis
 */

import { TripType, BudgetPerDay, GroupType } from '../types';
import { DestinationScore } from '../utils/destinationMatcher';
import logger from './logger';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Language prompts
const SYSTEM_PROMPTS = {
  'pt-BR': `Você é um especialista em viagens com conhecimento profundo sobre destinos internacionais e regionais.
Analise as preferências do usuário e recomende 4-5 destinos perfeitamente alinhados com suas necessidades.

IMPORTANTE:
- Sempre retorne um JSON válido (sem markdown, sem \`\`\`json)
- Considere ALL os fatores: tipo de viagem, interesses, grupo, orçamento, datas
- Mostre porquê cada destino é adequado
- Retorne exatamente este formato:
{
  "recommendations": [
    {
      "name": "Nome do Destino",
      "country": "País",
      "emoji": "🏖️",
      "score": 95,
      "reasons": [
        "Razão 1 específica",
        "Razão 2 específica"
      ]
    }
  ]
}`,
  
  'en-US': `You are a travel expert with deep knowledge of international and regional destinations.
Analyze the user's preferences and recommend 4-5 destinations perfectly aligned with their needs.

IMPORTANT:
- Always return valid JSON (no markdown, no \`\`\`json)
- Consider ALL factors: travel type, interests, group, budget, dates
- Show why each destination is suitable
- Return exactly this format:
{
  "recommendations": [
    {
      "name": "Destination Name",
      "country": "Country",
      "emoji": "🏖️",
      "score": 95,
      "reasons": [
        "Specific reason 1",
        "Specific reason 2"
      ]
    }
  ]
}`,
  
  'es-ES': `Eres un experto en viajes con profundo conocimiento de destinos internacionales y regionales.
Analiza las preferencias del usuario y recomienda 4-5 destinos perfectamente alineados con sus necesidades.

IMPORTANTE:
- Siempre devuelve JSON válido (sin markdown, sin \`\`\`json)
- Considera TODOS los factores: tipo de viaje, intereses, grupo, presupuesto, fechas
- Muestra por qué cada destino es adecuado
- Retorna exactamente este formato:
{
  "recommendations": [
    {
      "name": "Nombre del Destino",
      "country": "País",
      "emoji": "🏖️",
      "score": 95,
      "reasons": [
        "Razón específica 1",
        "Razón específica 2"
      ]
    }
  ]
}`,
};

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

/**
 * Builds a comprehensive prompt for Gemini based on user preferences
 */
function buildRecommendationPrompt(
  tripTypes: TripType[],
  interests: string[] | undefined,
  groupType: GroupType | undefined,
  numPeople: number | undefined,
  numChildren: number | undefined,
  budget: BudgetPerDay | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  season: 'primavera' | 'verão' | 'outono' | 'inverno' | undefined,
  month: number | undefined
): string {
  const budgetDescriptions: Record<BudgetPerDay, string> = {
    'ultra-economico': 'Ultra-economical (under €30/day)',
    'economico': 'Budget-friendly (€30-€60/day)',
    'medio': 'Mid-range (€60-€150/day)',
    'premium': 'Premium (€150-€300/day)',
    'luxo': 'Luxury (over €300/day)',
  };

  const tripTypeTranslations: Record<TripType, string> = {
    'cultura': 'Culture',
    'aventura': 'Adventure',
    'relaxamento': 'Relaxation',
    'exploracao': 'Exploration',
    'diversao': 'Fun/Party',
    'romantica': 'Romantic',
  };

  const groupDescriptions: Record<GroupType, string> = {
    'solo': 'Solo traveler',
    'casal': 'Couple',
    'familia': 'Family',
    'amigos': 'Friends group',
    'group': 'Large group',
  };

  const seasonDescriptions: Record<string, string> = {
    'primavera': 'Spring (April-May)',
    'verão': 'Summer (June-August)',
    'outono': 'Fall/Autumn (September-October)',
    'inverno': 'Winter (November-March)',
  };

  let prompt = `Recommend destinations based on these preferences:\n\n`;

  // Trip types
  prompt += `📍 Travel Type: ${tripTypes.map(t => tripTypeTranslations[t]).join(', ')}\n`;

  // Interests
  if (interests && interests.length > 0) {
    prompt += `⭐ Interests: ${interests.join(', ')}\n`;
  }

  // Group composition
  if (groupType) {
    prompt += `👥 Group: ${groupDescriptions[groupType]}`;
    if (numPeople) prompt += ` (${numPeople} people`;
    if (numChildren) prompt += `, ${numChildren} children`;
    if (numPeople || numChildren) prompt += `)`;
    prompt += `\n`;
  }

  // Budget
  if (budget) {
    prompt += `💰 Budget: ${budgetDescriptions[budget]}\n`;
  }

  // Season
  if (season && seasonDescriptions[season]) {
    prompt += `🌍 Season: ${seasonDescriptions[season]}\n`;
  }

  // Dates
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    prompt += `📅 Dates: ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (~${duration} days)\n`;
  } else if (month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    prompt += `📅 Preferred Month: ${months[month - 1]}\n`;
  }

  prompt += `\nProvide 4-5 best destination recommendations considering ALL these factors. Focus on destinations that match the indicated season for optimal experience.`;

  return prompt;
}

/**
 * Generates AI-powered destination recommendations using Gemini
 */
export async function getGeminiDestinationRecommendations(
  tripTypes: TripType[],
  interests: string[] | undefined,
  groupType: GroupType | undefined,
  numPeople: number | undefined,
  numChildren: number | undefined,
  budget: BudgetPerDay | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  season: 'primavera' | 'verão' | 'outono' | 'inverno' | undefined,
  month: number | undefined,
  language: string = 'pt-BR'
): Promise<DestinationScore[]> {
  if (!GEMINI_API_KEY) {
    logger.warn('⚠️  VITE_GEMINI_API_KEY not configured, using fallback');
    return [];
  }

  try {
    const systemPrompt = SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['en-US'];
    const userPrompt = buildRecommendationPrompt(
      tripTypes,
      interests,
      groupType,
      numPeople,
      numChildren,
      budget,
      startDate,
      endDate,
      season,
      month
    );

    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      logger.error(`❌ Gemini API error: ${response.status}`, new Error('Gemini API request failed'));
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      logger.warn('⚠️  Gemini returned empty candidates');
      throw new Error('Gemini returned empty response');
    }

    const responseText = data.candidates[0].content.parts[0].text;

    // Try to parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(responseText);
    } catch {
      // If direct parse fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.error('❌ Gemini did not return valid JSON', new Error('Invalid JSON response'));
        throw new Error('Gemini did not return valid JSON');
      }
      recommendations = JSON.parse(jsonMatch[0]);
    }

    // Transform Gemini recommendations to DestinationScore format
    if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
      throw new Error('Invalid recommendations format from Gemini');
    }

    const scores: DestinationScore[] = recommendations.recommendations.map(
      (rec: any) => ({
        name: rec.name || 'Unknown',
        country: rec.country || 'Unknown',
        emoji: rec.emoji || '📍',
        score: Math.min(100, Math.max(0, rec.score || 75)),
        matchPercentage: Math.min(100, Math.max(0, rec.score || 75)),
        reasons: Array.isArray(rec.reasons) ? rec.reasons : ['AI recommended'],
      })
    );

    logger.info(`✅ Gemini recommendations generated: ${scores.length} destinations`, { scores: scores.length });
    return scores;
  } catch (error) {
    logger.error('❌ Error generating Gemini recommendations:', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

/**
 * Hybrid approach: Use Gemini for better recommendations, fallback to rule-based matching
 */
export async function getHybridDestinationRecommendations(
  tripTypes: TripType[],
  interests: string[] | undefined,
  groupType: GroupType | undefined,
  numPeople: number | undefined,
  numChildren: number | undefined,
  budget: BudgetPerDay | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  season: 'primavera' | 'verão' | 'outono' | 'inverno' | undefined,
  month: number | undefined,
  fallbackFunction: () => DestinationScore[],
  language: string = 'pt-BR'
): Promise<DestinationScore[]> {
  // Try Gemini first
  if (GEMINI_API_KEY) {
    const geminiRecommendations = await getGeminiDestinationRecommendations(
      tripTypes,
      interests,
      groupType,
      numPeople,
      numChildren,
      budget,
      startDate,
      endDate,
      season,
      month,
      language
    );

    if (geminiRecommendations.length > 0) {
      return geminiRecommendations;
    }
  }

  // Fallback to rule-based matching
  logger.info('📊 Using fallback rule-based matching');
  return fallbackFunction();
}
