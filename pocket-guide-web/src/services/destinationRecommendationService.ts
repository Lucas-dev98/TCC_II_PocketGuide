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

  let prompt = `You are a destination recommendation expert. CRITICAL: You MUST recommend destinations that match the user's PREFERRED SEASON, not just any season.\n\n`;

  prompt += `USER PREFERENCES:\n`;
  prompt += `📍 Travel Type: ${tripTypes.map(t => tripTypeTranslations[t]).join(', ')}\n`;
  
  if (interests && interests.length > 0) {
    prompt += `⭐ Interests: ${interests.join(', ')}\n`;
  }
  
  if (groupType) {
    prompt += `👥 Group: ${groupDescriptions[groupType]}`;
    if (numPeople) prompt += ` (${numPeople} people`;
    if (numChildren) prompt += `, ${numChildren} children`;
    if (numPeople || numChildren) prompt += `)`;
    prompt += `\n`;
  }
  
  if (budget) {
    prompt += `💰 Budget: ${budgetDescriptions[budget]}\n`;
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    prompt += `📅 Travel Dates: ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (~${duration} days)\n`;
  } else if (month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    prompt += `📅 Travel Month: ${months[month - 1]}\n`;
  }

  // CRITICAL: Season takes priority
  if (season && seasonDescriptions[season]) {
    prompt += `🌍 PREFERRED SEASON: ${season.toUpperCase()} - ${seasonDescriptions[season]}\n`;
  }

  prompt += `\n${'='.repeat(80)}\n`;
  prompt += `🚨 MANDATORY REQUIREMENTS (MUST FOLLOW):\n`;
  prompt += `${'='.repeat(80)}\n\n`;

  if (season === 'primavera') {
    prompt += `1. User MUST experience SPRING (primavera) during their travel
2. Spring months: March-May (Northern), September-November (Southern)
3. For November travel dates: MUST prioritize SOUTHERN hemisphere destinations in spring
4. CORRECT destinations for Nov Primavera: Brazil (South), Argentina, Chile, Uruguay, New Zealand, Australia
5. REJECT these: India, Nepal, Vietnam, Thailand, Indonesia, Japan, Korea (these are AUTUMN in Nov, NOT SPRING)
6. Each destination MUST have spring-like activities: flower festivals, mild weather, outdoor activities
7. EXPLAIN in reasons why each destination is ideal for spring travelers\n\n`;
  } else if (season === 'verão') {
    prompt += `1. User MUST experience SUMMER (verão) during their travel
2. Summer months: June-August (Northern), December-February (Southern)
3. For November travel dates: Recommend warm/beach destinations with summer vibes
4. CORRECT destinations: Caribbean, Mediterranean, Northern hemisphere beach destinations
5. REJECT: Cold weather destinations
6. Each destination MUST have beach/outdoor activities\n\n`;
  } else if (season === 'outono') {
    prompt += `1. User MUST experience AUTUMN (outono) during their travel
2. Autumn months: September-November (Northern), March-May (Southern)
3. For November travel dates: MUST prioritize NORTHERN hemisphere destinations in autumn
4. CORRECT destinations for Nov Outono: Japan, Korea, USA Northeast, Europe East (Prague, Budapest)
5. REJECT: Southern hemisphere destinations (these are AUTUMN there, not spring or summer)
6. Each destination MUST have autumn activities: fall foliage, harvest festivals, cool weather
7. EXPLAIN in reasons the autumn appeal\n\n`;
  } else if (season === 'inverno') {
    prompt += `1. User MUST experience WINTER (inverno) during their travel
2. Winter months: December-February (Northern), June-August (Southern)
3. CORRECT destinations: Ski resorts, snow activities, holiday markets, tropical destinations
4. Each destination MUST offer winter-appropriate activities\n\n`;
  }

  prompt += `${'='.repeat(80)}\n`;
  prompt += `RESPONSE FORMAT (MANDATORY):\n`;
  prompt += `${'='.repeat(80)}\n`;
  prompt += `Return EXACTLY this JSON format (no markdown, no additional text):\n{\n  "recommendations": [\n    {\n      "name": "Destination Name",\n      "country": "Country",\n      "emoji": "🌍",\n      "score": 95,\n      "reasons": [\n        "Reason 1 explaining why this matches the PREFERRED SEASON",\n        "Reason 2 explaining seasonal activities/weather"\n      ]\n    }\n  ]\n}\n\n`;

  prompt += `${'='.repeat(80)}\n`;
  prompt += `⚠️ VERIFICATION CHECKLIST (ALL MUST BE TRUE):\n`;
  prompt += `${'='.repeat(80)}\n`;
  prompt += `☑️ Every destination has the user's preferred season during ${month ? `month ${month}` : 'the specified dates'}\n`;
  prompt += `☑️ All destinations match the travel type: ${tripTypes.join(', ')}\n`;
  prompt += `☑️ All destinations are suitable for interests: ${interests?.join(', ') || 'general interests'}\n`;
  prompt += `☑️ All destinations match budget range: ${budget}\n`;
  prompt += `☑️ Each destination has seasonal activities/weather explained in reasons\n`;
  prompt += `☑️ NO destinations are in the WRONG season for the travel dates\n\n`;

  prompt += `Provide 4-5 destinations that match ALL criteria above. Start with the HIGHEST match first.`;

  // DEBUG: Log all parameters and final prompt
  console.log('════════════════════════════════════════════════════════');
  console.log('🎯 DESTINATION RECOMMENDATION - FINAL PARAMETERS:');
  console.log('════════════════════════════════════════════════════════');
  console.log('📍 Trip Types:', tripTypes.join(', '));
  console.log('⭐ Interests:', interests?.join(', ') || 'None');
  console.log('👥 Group Type:', groupType, '| People:', numPeople, '| Children:', numChildren);
  console.log('💰 Budget:', budget);
  console.log('📅 Dates:', startDate, 'to', endDate);
  console.log('🌍 SEASON (CRITICAL):', season?.toUpperCase() || 'NOT SET!');
  console.log('🗓️ Month:', month);
  console.log('🌐 Language:', language);
  console.log('════════════════════════════════════════════════════════');
  console.log('📝 PROMPT BEING SENT TO GEMINI:');
  console.log('════════════════════════════════════════════════════════');
  console.log(prompt);
  console.log('════════════════════════════════════════════════════════\n');
  
  logger.info('🎯 Final Destination Recommendation Prompt - Season:', { season, language });
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
