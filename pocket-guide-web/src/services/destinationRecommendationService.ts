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
 * Determines which hemisphere the user is in based on language
 * pt-BR (Brazil) = Southern Hemisphere
 * en-US (USA) & es-ES (Spain) = Northern Hemisphere
 */
function getHemisphere(language: string): 'north' | 'south' {
  if (language === 'pt-BR') {
    return 'south';
  }
  return 'north'; // Default to Northern Hemisphere for other locales
}

/**
 * Detects the season based on the provided date and hemisphere
 * 
 * Northern Hemisphere (en-US, es-ES):
 * - Primavera (Spring): March-May (months 3-5)
 * - Verão (Summer): June-August (months 6-8)
 * - Outono (Autumn): September-November (months 9-11)
 * - Inverno (Winter): December-February (months 12, 1-2)
 * 
 * Southern Hemisphere (pt-BR):
 * - Primavera (Spring): September-November (months 9-11)
 * - Verão (Summer): December-February (months 12, 1-2)
 * - Outono (Autumn): March-May (months 3-5)
 * - Inverno (Winter): June-August (months 6-8)
 */
function detectSeasonFromDate(dateString: string, language: string = 'en-US'): 'primavera' | 'verão' | 'outono' | 'inverno' | undefined {
  if (!dateString) return undefined;
  
  try {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    const hemisphere = getHemisphere(language);
    
    if (hemisphere === 'north') {
      // Northern Hemisphere
      if (month >= 3 && month <= 5) return 'primavera';
      if (month >= 6 && month <= 8) return 'verão';
      if (month >= 9 && month <= 11) return 'outono';
      return 'inverno'; // December-February
    } else {
      // Southern Hemisphere (inverted)
      if (month >= 9 && month <= 11) return 'primavera';
      if (month >= 12 || month <= 2) return 'verão';
      if (month >= 3 && month <= 5) return 'outono';
      return 'inverno'; // June-August
    }
  } catch (error) {
    logger.warn(`Error detecting season from date: ${dateString}`);
    return undefined;
  }
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
  month: number | undefined,
  language: string = 'pt-BR'
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
    'primavera': 'Spring (March-May) - mild weather, flowers, pleasant temperatures',
    'verão': 'Summer (June-August) - hot weather, beach activities, outdoor events',
    'outono': 'Autumn/Fall (September-November) - cool weather, colorful foliage, harvest season',
    'inverno': 'Winter (December-February) - cold weather, snow activities, holiday season',
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

  // Dates and Season
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    prompt += `📅 Dates: ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (~${duration} days)\n`;
    
    // Use explicitly selected season if provided, otherwise auto-detect
    if (season && seasonDescriptions[season]) {
      prompt += `🌍 Season (User Preference): ${season} - ${seasonDescriptions[season]}\n`;
    } else {
      const detectedSeason = detectSeasonFromDate(startDate, language);
      if (detectedSeason && seasonDescriptions[detectedSeason]) {
        prompt += `🌍 Season (Auto-detected): ${detectedSeason} - ${seasonDescriptions[detectedSeason]}\n`;
      }
    }
  } else if (month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    prompt += `📅 Preferred Month: ${months[month - 1]}\n`;
    
    // Auto-detect season from month if not explicitly provided
    const hemisphere = getHemisphere(language);
    let detectedSeason: 'primavera' | 'verão' | 'outono' | 'inverno' | undefined;
    
    if (hemisphere === 'north') {
      detectedSeason = season || (month >= 3 && month <= 5 ? 'primavera' : month >= 6 && month <= 8 ? 'verão' : month >= 9 && month <= 11 ? 'outono' : 'inverno');
    } else {
      // Southern Hemisphere
      detectedSeason = season || (month >= 9 && month <= 11 ? 'primavera' : month >= 12 || month <= 2 ? 'verão' : month >= 3 && month <= 5 ? 'outono' : 'inverno');
    }
    
    if (detectedSeason && seasonDescriptions[detectedSeason]) {
      prompt += `🌍 Season: ${detectedSeason} - ${seasonDescriptions[detectedSeason]}\n`;
    }
  } else if (season && seasonDescriptions[season]) {
    // If no dates/month but season is provided
    prompt += `🌍 Season Preference: ${season} - ${seasonDescriptions[season]}\n`;
  }

  prompt += `\n⚠️ CRITICAL INSTRUCTIONS:
1. The user wants to travel DURING THESE DATES: ${startDate && endDate ? new Date(startDate).toLocaleDateString() + ' to ' + new Date(endDate).toLocaleDateString() : 'Month: ' + (month || 'not specified')}
2. The user prefers the "${season}" season for their travel experience
3. IMPORTANT: Match the ACTUAL season in the destination's hemisphere during the travel dates:
   - If user wants "primavera" (Spring): Recommend destinations in SOUTHERN hemisphere where it's spring (Sep-Nov) OR NORTHERN hemisphere where it's spring (Mar-May). For Nov dates, prioritize SOUTHERN hemisphere destinations!
   - If user wants "verão" (Summer): Recommend destinations in SOUTHERN hemisphere where it's summer (Dec-Feb) OR NORTHERN hemisphere where it's summer (Jun-Aug). For Nov dates, this is transition season!
   - If user wants "outono" (Autumn): Recommend destinations in NORTHERN hemisphere where it's autumn (Sep-Nov) OR SOUTHERN hemisphere where it's autumn (Mar-May)
   - If user wants "inverno" (Winter): Recommend destinations in SOUTHERN hemisphere where it's winter (Jun-Aug) OR NORTHERN hemisphere where it's winter (Dec-Feb)

4. For November specifically:
   - Southern Hemisphere = PRIMAVERA (Spring) - use: Brazil (South), Argentina, Chile, New Zealand, Australia, Uruguay
   - Northern Hemisphere = OUTONO (Autumn) - use: Japan, Korea, USA Northeast, Europe East, Thailand, India (for fall colors/mild weather)

5. DO NOT recommend a destination in the wrong season! Example: If user wants "primavera" in November, do NOT recommend India/Nepal/Thailand (Northern Hemisphere Autumn)

6. Each recommendation MUST explain why the season is appropriate

Provide 4-5 destinations that match ALL criteria: travel type, interests, group, budget, dates, AND correct seasonal hemisphere.`;

  logger.info('🎯 Final Destination Recommendation Prompt:', { season, language, prompt });
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
    // DEBUG: Log parameters being sent to Gemini
    logger.info('📊 Destination Recommendations Parameters:', {
      season,
      language,
      startDate,
      endDate,
      tripTypes: tripTypes.join(','),
      interests: interests?.join(','),
    });

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
      month,
      language
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
