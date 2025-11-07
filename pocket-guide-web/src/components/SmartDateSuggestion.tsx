/**
 * SmartDateSuggestion.tsx - AI-powered date recommendation component
 * 
 * Displays 3 intelligent date suggestions based on:
 * - Destination
 * - Trip type (solo, casal, família, amigos)
 * - User interests
 * - Budget
 * 
 * User can accept a suggestion (auto-fills dates) or reject (manual selection)
 */

import { useEffect, useState } from 'react';
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
          {t('createTrip.aiSuggestionDescription') ||
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
      onClick={onToggleExpand}
      role="button"
      tabIndex={0}
    >
      <Card.Body
        className="space-y-3"
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
