import React from 'react';
import { useTranslation } from 'react-i18next';

interface DurationAndBudgetProps {
  startDate?: string;
  endDate?: string;
  season?: 'primavera' | 'verão' | 'outono' | 'inverno';
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onSeasonChange?: (season: 'primavera' | 'verão' | 'outono' | 'inverno') => void;
  disabled?: boolean;
}

const SEASON_OPTIONS = [
  { id: 'primavera', label: '🌸 Primavera', emoji: '🌸' },
  { id: 'verão', label: '☀️ Verão', emoji: '☀️' },
  { id: 'outono', label: '🍂 Outono', emoji: '🍂' },
  { id: 'inverno', label: '❄️ Inverno', emoji: '❄️' },
] as const;


export const DurationAndBudgetSelector: React.FC<DurationAndBudgetProps> = ({
  startDate,
  endDate,
  season,
  onStartDateChange,
  onEndDateChange,
  onSeasonChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Dates Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectDates', '📅 Quando você vai viajar?')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newFlow.step2.startDate', 'Data de Ida')}
            </label>
            <input
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              disabled={disabled}
              min={getTodayDate()}
              className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                startDate
                  ? 'border-blue-500 bg-white dark:bg-gray-800 dark:border-blue-400'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              } text-gray-900 dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
            {startDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(startDate).toLocaleDateString('pt-BR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('newFlow.step2.endDate', 'Data de Volta')}
            </label>
            <input
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              disabled={disabled || !startDate}
              min={startDate || getTodayDate()}
              className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                endDate
                  ? 'border-green-500 bg-white dark:bg-gray-800 dark:border-green-400'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              } text-gray-900 dark:text-white ${disabled || !startDate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
            {endDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(endDate).toLocaleDateString('pt-BR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Date Duration Summary */}
        {startDate && endDate && calculateDays() !== null && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>{t('newFlow.step2.tripDuration', 'Duração da viagem')}:</strong> {calculateDays()} {calculateDays() === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        )}
      </div>

      {/* Season Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectSeason', '🌍 Qual estação do ano?')}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {SEASON_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !disabled && onSeasonChange?.(opt.id as 'primavera' | 'verão' | 'outono' | 'inverno')}
              disabled={disabled}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-center relative ${
                season === opt.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 dark:border-purple-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {season === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
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

              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {opt.label.split(' ')[1]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DurationAndBudgetSelector;
