import React from 'react';
import { useTranslation } from 'react-i18next';
import { TripDuration, BudgetPerDay } from '../types';

interface DurationAndBudgetProps {
  duration: TripDuration | '';
  budgetPerDay: BudgetPerDay | '';
  onDurationChange: (duration: TripDuration) => void;
  onBudgetChange: (budget: BudgetPerDay) => void;
  disabled?: boolean;
}

interface DurationOption {
  id: TripDuration;
  labelKey: string;
  descriptionKey: string;
  daysMin: number;
  daysMax: number;
}

interface BudgetOption {
  id: BudgetPerDay;
  labelKey: string;
  descriptionKey: string;
  symbol: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    id: 'fim-de-semana',
    labelKey: 'fimDeSemana',
    descriptionKey: 'fimDeSemana_desc',
    daysMin: 2,
    daysMax: 3,
  },
  {
    id: 'uma-semana',
    labelKey: 'umaSemana',
    descriptionKey: 'umaSemana_desc',
    daysMin: 4,
    daysMax: 7,
  },
  {
    id: 'duas-semanas',
    labelKey: 'duasSemanas',
    descriptionKey: 'duasSemanas_desc',
    daysMin: 8,
    daysMax: 14,
  },
  {
    id: 'mes-plus',
    labelKey: 'mesMais',
    descriptionKey: 'mesMais_desc',
    daysMin: 15,
    daysMax: 999,
  },
];

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: 'ultra-economico',
    labelKey: 'ultraEconomico',
    descriptionKey: 'ultraEconomico_desc',
    symbol: '$',
  },
  {
    id: 'economico',
    labelKey: 'economico',
    descriptionKey: 'economico_desc',
    symbol: '$$',
  },
  {
    id: 'medio',
    labelKey: 'medio',
    descriptionKey: 'medio_desc',
    symbol: '$$$',
  },
  {
    id: 'premium',
    labelKey: 'premium',
    descriptionKey: 'premium_desc',
    symbol: '$$$$',
  },
  {
    id: 'luxo',
    labelKey: 'luxo',
    descriptionKey: 'luxo_desc',
    symbol: '$$$$$',
  },
];

export const DurationAndBudgetSelector: React.FC<DurationAndBudgetProps> = ({
  duration,
  budgetPerDay,
  onDurationChange,
  onBudgetChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Duration Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectDuration', '⏱️ Quanto tempo você tem?')}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !disabled && onDurationChange(opt.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                duration === opt.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={t(opt.descriptionKey)}
            >
              {duration === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t(opt.labelKey)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {opt.daysMin}-{opt.daysMax} {t('days', 'dias')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectBudget', '💰 Orçamento por dia')}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !disabled && onBudgetChange(opt.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                budgetPerDay === opt.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={t(opt.descriptionKey)}
            >
              {budgetPerDay === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {opt.symbol}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t(opt.labelKey)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Budget Reference */}
        <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
            <strong>{t('newFlow.step2.budgetGuide', 'Guia de orçamento por dia')}:</strong>
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <li>💵 <strong>{t('ultraEconomico', 'Ultra Econômico')}:</strong> R$ 0-50/dia (hostels, comida rua)</li>
            <li>💵 <strong>{t('economico', 'Econômico')}:</strong> R$ 50-150/dia (hotels simples, comida local)</li>
            <li>💵 <strong>{t('medio', 'Médio')}:</strong> R$ 150-350/dia (3-4 stars, restaurantes bons)</li>
            <li>💵 <strong>{t('premium', 'Premium')}:</strong> R$ 350-800/dia (resorts, restaurantes top)</li>
            <li>💵 <strong>{t('luxo', 'Luxo')}:</strong> R$ 800+/dia (5-stars, tudo incluído)</li>
          </ul>
        </div>
      </div>

      {/* Summary */}
      {duration && budgetPerDay && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{t('newFlow.step2.summary', 'Resumo')}:</strong> Viagem de{' '}
            <strong>{DURATION_OPTIONS.find(d => d.id === duration)?.daysMin}-{DURATION_OPTIONS.find(d => d.id === duration)?.daysMax} dias</strong> com orçamento{' '}
            <strong>{t(BUDGET_OPTIONS.find(b => b.id === budgetPerDay)?.labelKey || '')}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default DurationAndBudgetSelector;
