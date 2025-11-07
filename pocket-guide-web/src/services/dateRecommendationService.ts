/**
 * dateRecommendationService.ts - Smart Date Recommendation with Gemini AI
 * 
 * Provides intelligent date suggestions based on:
 * - Destination
 * - Trip type (solo, casal, família, amigos)
 * - User interests (natureza, cultura, gastronomia, etc)
 * - Budget level
 * 
 * Returns 3 date suggestions with explanations (climate, crowds, budget, events)
 */

import { TripType, BudgetPerDay } from '../types';
import { generateDateRecommendationPrompt, getSystemInstructionForDates, LanguageCode } from './promptTranslator';
import logger from './logger';

export interface DateSuggestion {
  id: string;
  label: string; // "🌞 Melhor Clima"
  startDate: string; // YYYY-MM-DD
  endDate: string;
  duration: number; // dias
  
  // Razões explicadas em detalhes
  reasons: {
    climate: string;
    crowds: string;
    budget: string;
    events: string;
  };
  
  score: number; // 1-100
  emoji: string;
  originalResponse?: string; // para debug
}

export interface DateRecommendationResult {
  destination: string;
  suggestions: DateSuggestion[];
  generatedAt: Date;
  totalTokensUsed?: number;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Fallback sugestões quando API falha
const FALLBACK_SUGGESTIONS: DateSuggestion[] = [
  {
    id: 'fallback-1',
    label: '🌞 Próximas 4 semanas',
    startDate: getDateAfterDays(14),
    endDate: getDateAfterDays(21),
    duration: 7,
    reasons: {
      climate: 'Próximas 4 semanas, clima estável',
      crowds: 'Quantidade de turistas média',
      budget: 'Preços moderados',
      events: 'Eventos variados',
    },
    score: 70,
    emoji: '🌞',
  },
  {
    id: 'fallback-2',
    label: '✨ Mês que vem',
    startDate: getDateAfterDays(30),
    endDate: getDateAfterDays(37),
    duration: 7,
    reasons: {
      climate: 'Clima em transição',
      crowds: 'Menos turistas, mais local',
      budget: 'Preços reduzidos',
      events: 'Oportunidade de planejamento',
    },
    score: 65,
    emoji: '✨',
  },
  {
    id: 'fallback-3',
    label: '🎭 Fin de semana prolongado',
    startDate: getNextWeekend(),
    endDate: getDateAfterDays(4),
    duration: 4,
    reasons: {
      climate: 'Sem previsão disponível',
      crowds: 'Variável',
      budget: 'Preços rápidos',
      events: 'Teste curto antes de viagem completa',
    },
    score: 60,
    emoji: '🎭',
  },
];

/**
 * Gera recomendações inteligentes de datas usando Gemini
 * Com fallback para recomendações hardcoded
 */
export async function getSmartDateRecommendations(
  destination: string,
  tripType: TripType,
  interests: string[],
  budget: BudgetPerDay = 'medio',
  language: LanguageCode = 'pt-BR',
  minDuration: number = 7,
  maxDuration: number = 10,
): Promise<DateRecommendationResult> {
  if (!GEMINI_API_KEY) {
    logger.warn('⚠️  GEMINI_API_KEY não configurada, usando fallback');
    return {
      destination,
      suggestions: FALLBACK_SUGGESTIONS,
      generatedAt: new Date(),
    };
  }

  try {
    logger.info(`🤖 Gerando recomendações de datas para ${destination}...`);

    const systemPrompt = getSystemInstructionForDates(language);
    const userPrompt = generateDateRecommendationPrompt(
      destination,
      tripType,
      interests,
      budget,
      minDuration,
      maxDuration,
      language,
    );

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system: [{ text: systemPrompt }],
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error('❌ Erro Gemini:', error);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('Gemini retornou resposta vazia');
    }

    // Parse JSON da resposta
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Gemini não retornou JSON válido');
    }

    const parsedSuggestions = JSON.parse(jsonMatch[0]);
    const suggestions = parsedSuggestions.map((s: any, index: number) => ({
      id: `suggestion-${Date.now()}-${index}`,
      label: s.label || `Sugestão ${index + 1}`,
      startDate: s.dateRange?.start || s.startDate,
      endDate: s.dateRange?.end || s.endDate,
      duration: calculateDaysBetween(
        s.dateRange?.start || s.startDate,
        s.dateRange?.end || s.endDate,
      ),
      reasons: s.reasons || {
        climate: 'Informação não disponível',
        crowds: 'Informação não disponível',
        budget: 'Informação não disponível',
        events: 'Informação não disponível',
      },
      score: s.score || 75,
      emoji: s.emoji || '✈️',
      originalResponse: textContent,
    })).filter((s: DateSuggestion) => validateSuggestion(s));

    logger.info(`✅ ${suggestions.length} sugestões geradas com sucesso`);

    return {
      destination,
      suggestions: suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS,
      generatedAt: new Date(),
      totalTokensUsed: data.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    logger.error('💥 Erro ao gerar recomendações de datas:', error instanceof Error ? error : new Error(String(error)));
    // Fallback para sugestões hardcoded
    return {
      destination,
      suggestions: FALLBACK_SUGGESTIONS,
      generatedAt: new Date(),
    };
  }
}

/**
 * Valida se as datas sugeridas são válidas e futuras
 */
export function validateSuggestion(suggestion: DateSuggestion): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(suggestion.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(suggestion.endDate);
  end.setHours(0, 0, 0, 0);

  // Data inicial não pode ser no passado
  if (start < today) {
    logger.warn(`⚠️  Sugestão com data no passado: ${suggestion.startDate}`);
    return false;
  }

  // Data final deve ser após a inicial
  if (end <= start) {
    logger.warn(`⚠️  Sugestão com datas inválidas: ${suggestion.startDate} - ${suggestion.endDate}`);
    return false;
  }

  // Duração razoável
  const days = calculateDaysBetween(suggestion.startDate, suggestion.endDate);
  if (days < 2 || days > 30) {
    logger.warn(`⚠️  Sugestão com duração inválida: ${days} dias`);
    return false;
  }

  return true;
}

// ========== Utilitários ==========

function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateForDB(date);
}

function getNextWeekend(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = dayOfWeek === 0 ? 6 : (6 - dayOfWeek) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(saturday.getDate() + daysUntilSaturday);
  return formatDateForDB(saturday);
}

export function formatDateForDB(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDaysBetween(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
