# 🚀 Guia de Implementação: Smart Date Recommendation

## Passo 1: Criar o Serviço `dateRecommendationService.ts`

```typescript
// src/services/dateRecommendationService.ts

import { TripType, BudgetPerDay } from '../types';
import { LanguageCode, generateDateRecommendationPrompt, getSystemInstructionForDates } from './promptTranslator';
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
    }));

    logger.info(`✅ ${suggestions.length} sugestões geradas com sucesso`);

    return {
      destination,
      suggestions,
      generatedAt: new Date(),
      totalTokensUsed: data.usageMetadata?.totalTokenCount,
    };
  } catch (error) {
    logger.error('💥 Erro ao gerar recomendações de datas:', error);
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
  const start = new Date(suggestion.startDate);
  const end = new Date(suggestion.endDate);

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
```

---

## Passo 2: Atualizar `promptTranslator.ts`

Adicionar as funções de prompt para recomendação de datas:

```typescript
// src/services/promptTranslator.ts - adicionar estas funções:

export function getSystemInstructionForDates(language: LanguageCode = 'pt-BR'): string {
  const instructions = {
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
}

export function generateDateRecommendationPrompt(
  destination: string,
  tripType: TripType,
  interests: string[],
  budget: BudgetPerDay = 'medio',
  minDuration: number = 7,
  maxDuration: number = 10,
  language: LanguageCode = 'pt-BR',
): string {
  const budgetMap = {
    'econômico': { en: 'budget-friendly', pt: 'econômico' },
    'médio': { en: 'moderate', pt: 'médio' },
    'luxo': { en: 'luxury', pt: 'luxuoso' },
  };

  const tripTypeMap = {
    'solo': { en: 'solo traveler', pt: 'viajante solo' },
    'casal': { en: 'couple', pt: 'casal' },
    'família': { en: 'family', pt: 'família' },
    'amigos': { en: 'friends group', pt: 'grupo de amigos' },
  };

  const templates = {
    'pt-BR': `Analise as seguintes preferências de viagem e recomende as 3 melhores épocas:

**Destino**: ${destination}
**Tipo de Viagem**: ${tripTypeMap[tripType]?.pt || tripType}
**Interesses**: ${interests.join(', ')}
**Orçamento**: ${budgetMap[budget]?.pt || budget}
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
**Trip Type**: ${tripTypeMap[tripType]?.en || tripType}
**Interests**: ${interests.join(', ')}
**Budget**: ${budgetMap[budget]?.en || budget}
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
**Tipo de Viaje**: ${tripTypeMap[tripType]?.pt || tripType}
**Intereses**: ${interests.join(', ')}
**Presupuesto**: ${budgetMap[budget]?.pt || budget}
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
}
```

---

## Passo 3: Criar Componente `SmartDateSuggestion.tsx`

```typescript
// src/components/SmartDateSuggestion.tsx

import React, { useEffect, useState } from 'react';
import useI18n from '../hooks/useI18n';
import { getSmartDateRecommendations, DateSuggestion } from '../services/dateRecommendationService';
import { TripType, BudgetPerDay } from '../types';
import { Card, Button } from '@/components';
import { ChevronDown, Sparkles, AlertCircle } from 'lucide-react';

interface SmartDateSuggestionProps {
  destination: string;
  tripType: TripType;
  interests: string[];
  budget?: BudgetPerDay;
  onAccept: (suggestion: DateSuggestion) => void;
  onReject: () => void;
  loading?: boolean;
}

export function SmartDateSuggestion({
  destination,
  tripType,
  interests,
  budget = 'medio',
  onAccept,
  onReject,
  loading: externalLoading,
}: SmartDateSuggestionProps) {
  const { t } = useI18n();
  const [suggestions, setSuggestions] = useState<DateSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [destination, tripType, interests, budget]);

  async function loadSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const result = await getSmartDateRecommendations(
        destination,
        tripType,
        interests,
        budget,
      );
      setSuggestions(result.suggestions);
    } catch (err) {
      setError('Erro ao gerar sugestões');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || externalLoading) {
    return (
      <Card elevation="lg" className="mb-6">
        <Card.Body className="text-center py-12">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-body font-medium text-slate-900 dark:text-white">
            {t('createTrip.analyzingBestDates') || 'Analisando melhor época...'}
          </p>
          <p className="text-small text-slate-600 dark:text-slate-300 mt-1">
            {t('createTrip.aiThinking') || 'IA pensando...'}
          </p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation="lg" className="mb-6 border-l-4 border-orange-500">
        <Card.Body className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{error}</p>
            <p className="text-small text-slate-600 dark:text-slate-300 mt-1">
              {t('createTrip.manualDateSelection') || 'Selecione manualmente suas datas'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={onReject}
              className="mt-3"
            >
              {t('common.continue') || 'Continuar'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-h3 font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {t('createTrip.smartDateSuggestion') || 'Recomendação de Datas'}
        </h2>
        <p className="text-body text-slate-600 dark:text-slate-300 mt-2">
          {t('createTrip.aiSuggestionDescription', {
            destination,
            type: tripType,
          }) ||
            `Com base em sua viagem ${tripType} para ${destination}, aqui estão as melhores épocas:`}
        </p>
      </div>

      {/* Sugestões */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            isExpanded={expandedId === suggestion.id}
            isSelected={selectedId === suggestion.id}
            onToggleExpand={() =>
              setExpandedId(expandedId === suggestion.id ? null : suggestion.id)
            }
            onSelect={() => {
              setSelectedId(suggestion.id);
              onAccept(suggestion);
            }}
          />
        ))}
      </div>

      {/* Rejeitar sugestão */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="secondary"
          onClick={onReject}
          className="w-full"
        >
          {t('createTrip.preferManualSelection') ||
            'Prefiro escolher as datas manualmente'}
        </Button>
      </div>
    </div>
  );
}

// ========== Componente da Sugestão Individual ==========

interface SuggestionCardProps {
  suggestion: DateSuggestion;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
}

function SuggestionCard({
  suggestion,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
}: SuggestionCardProps) {
  const start = new Date(suggestion.startDate);
  const end = new Date(suggestion.endDate);
  const dateStr = `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <Card
      elevation="md"
      className={`cursor-pointer transition ${
        isSelected
          ? 'ring-2 ring-primary border-primary'
          : 'hover:elevation-lg'
      }`}
    >
      <Card.Body
        className="space-y-3"
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{suggestion.emoji}</span>
              {suggestion.label}
            </h3>
            <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
              {dateStr}
            </p>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {suggestion.score}%
              </div>
              <div
                className={`w-12 h-6 ${getScoreColor(suggestion.score)} rounded-full`}
              />
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Detalhes expandidos */}
        {isExpanded && (
          <div className="space-y-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Climate */}
            <DetailRow
              icon="🌡️"
              label="Clima"
              value={suggestion.reasons.climate}
            />

            {/* Crowds */}
            <DetailRow
              icon="👥"
              label="Turismo"
              value={suggestion.reasons.crowds}
            />

            {/* Budget */}
            <DetailRow
              icon="💰"
              label="Orçamento"
              value={suggestion.reasons.budget}
            />

            {/* Events */}
            <DetailRow
              icon="🎭"
              label="Eventos"
              value={suggestion.reasons.events}
            />

            {/* Botão de seleção */}
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="w-full mt-4"
            >
              Escolher esta data
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </p>
        <p className="text-small text-slate-600 dark:text-slate-400 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
```

---

## Passo 4: Integração no CreateTripScreen

```typescript
// Adicionar no topo
import { SmartDateSuggestion } from '../components/SmartDateSuggestion';

// Modificar StepType
type StepType = 1 | 2 | 3 | 4 | 5 | 6;

// Adicionar novo step para sugestão inteligente de datas
// Entre "Destino" (Step 2) e "Datas Manuais" (Step 2b)

{step === 2_SMART_DATES && formData.destination && (
  <SmartDateSuggestion
    destination={formData.destination}
    tripType={formData.tripTypes[0]}
    interests={formData.interests}
    budget={formData.budgetPerDay}
    onAccept={(suggestion) => {
      // Preenche datas automaticamente
      setFormData(prev => ({
        ...prev,
        startDate: suggestion.startDate,
        endDate: suggestion.endDate,
      }));
      setStep(3); // Próximo step
    }}
    onReject={() => {
      // Mostra seletor manual
      setStep(2_MANUAL_DATES);
    }}
  />
)}
```

---

## Testes Unitários

```typescript
// tests/dateRecommendationService.test.ts

import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  getSmartDateRecommendations,
  validateSuggestion,
  formatDateForDB,
  calculateDaysBetween,
} from '../src/services/dateRecommendationService';

describe('dateRecommendationService', () => {
  describe('getSmartDateRecommendations', () => {
    it('should return fallback suggestions when API key is missing', async () => {
      const result = await getSmartDateRecommendations(
        'Paris',
        'casal',
        ['cultura', 'gastronomia'],
      );

      expect(result.suggestions.length).toBe(3);
      expect(result.suggestions[0].label).toBeDefined();
      expect(result.suggestions[0].emoji).toBeDefined();
    });

    it('should return valid date range for each suggestion', async () => {
      const result = await getSmartDateRecommendations(
        'Paris',
        'casal',
        ['cultura'],
      );

      result.suggestions.forEach((suggestion) => {
        expect(validateSuggestion(suggestion)).toBe(true);
      });
    });

    it('should include reasons for each suggestion', async () => {
      const result = await getSmartDateRecommendations(
        'Barcelona',
        'familia',
        ['praia', 'aventura'],
      );

      result.suggestions.forEach((suggestion) => {
        expect(suggestion.reasons.climate).toBeDefined();
        expect(suggestion.reasons.crowds).toBeDefined();
        expect(suggestion.reasons.budget).toBeDefined();
        expect(suggestion.reasons.events).toBeDefined();
      });
    });
  });

  describe('validateSuggestion', () => {
    it('should reject past dates', () => {
      const pastSuggestion = {
        id: 'test',
        label: 'Test',
        startDate: '2020-01-01',
        endDate: '2020-01-10',
        duration: 10,
        reasons: { climate: '', crowds: '', budget: '', events: '' },
        score: 80,
        emoji: '✈️',
      };

      expect(validateSuggestion(pastSuggestion)).toBe(false);
    });

    it('should accept valid future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 7);

      const validSuggestion = {
        id: 'test',
        label: 'Test',
        startDate: formatDateForDB(futureDate),
        endDate: formatDateForDB(endDate),
        duration: 7,
        reasons: { climate: '', crowds: '', budget: '', events: '' },
        score: 80,
        emoji: '✈️',
      };

      expect(validateSuggestion(validSuggestion)).toBe(true);
    });
  });

  describe('formatDateForDB', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2025-04-15');
      expect(formatDateForDB(date)).toBe('2025-04-15');
    });

    it('should pad month and day with zeros', () => {
      const date = new Date('2025-01-05');
      expect(formatDateForDB(date)).toBe('2025-01-05');
    });
  });

  describe('calculateDaysBetween', () => {
    it('should calculate correct number of days', () => {
      const days = calculateDaysBetween('2025-04-15', '2025-04-22');
      expect(days).toBe(7);
    });

    it('should handle same-day difference', () => {
      const days = calculateDaysBetween('2025-04-15', '2025-04-15');
      expect(days).toBe(0);
    });
  });
});
```

---

## Próximas Ações

1. ✅ Criar `dateRecommendationService.ts`
2. ✅ Atualizar `promptTranslator.ts`
3. ✅ Criar `SmartDateSuggestion.tsx`
4. ✅ Integrar no CreateTripScreen
5. ⏳ Testar com Gemini API
6. ⏳ Deploy MVP

**Status**: Pronto para implementação ✅
