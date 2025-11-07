import React from 'react';
import { useTranslation } from 'react-i18next';

interface DurationAndBudgetProps {
  startDate?: string;
  endDate?: string;
  selectedMonth?: number;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onMonthChange?: (month: number) => void;
  disabled?: boolean;
}


export const DurationAndBudgetSelector: React.FC<DurationAndBudgetProps> = ({
  startDate,
  endDate,
  selectedMonth,
  onStartDateChange,
  onEndDateChange,
  onMonthChange,
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

      {/* Season/Month Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectBestMonth', '❓ Qual é o melhor mês?')}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('newFlow.step2.bestMonthDesc', 'Saiba quais meses têm melhor clima e menos multidões')}
        </p>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { num: 1, label: 'Jan', color: 'border-red-500 dark:border-red-500', icon: '❌' },
            { num: 2, label: 'Fev', color: 'border-red-500 dark:border-red-500', icon: '❌' },
            { num: 3, label: 'Mar', color: 'border-yellow-500 dark:border-yellow-500', icon: '⚠️' },
            { num: 4, label: 'Abr', color: 'border-green-500 dark:border-green-500', icon: '✅' },
            { num: 5, label: 'Mai', color: 'border-green-500 dark:border-green-500', icon: '✅' },
            { num: 6, label: 'Jun', color: 'border-yellow-500 dark:border-yellow-500', icon: '⚠️' },
            { num: 7, label: 'Jul', color: 'border-yellow-500 dark:border-yellow-500', icon: '⚠️' },
            { num: 8, label: 'Ago', color: 'border-yellow-500 dark:border-yellow-500', icon: '⚠️' },
            { num: 9, label: 'Set', color: 'border-green-500 dark:border-green-500', icon: '✅' },
            { num: 10, label: 'Out', color: 'border-green-500 dark:border-green-500', icon: '✅' },
            { num: 11, label: 'Nov', color: 'border-yellow-500 dark:border-yellow-500', icon: '⚠️' },
            { num: 12, label: 'Dez', color: 'border-red-500 dark:border-red-500', icon: '❌' },
          ].map((month) => (
            <button
              key={month.num}
              onClick={() => !disabled && onMonthChange?.(month.num)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center relative ${
                selectedMonth === month.num
                  ? `${month.color} bg-opacity-20 dark:bg-opacity-20`
                  : `border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={month.label}
            >
              {selectedMonth === month.num && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
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
              <span className="text-lg mb-1">{month.icon}</span>
              <div className="text-xs font-medium text-gray-900 dark:text-white">{month.label}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 rounded border border-green-500 bg-green-50 dark:bg-green-900/20">✅</span>
            <span>{t('newFlow.step2.bestMonths', 'Melhor época')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 rounded border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">⚠️</span>
            <span>{t('newFlow.step2.acceptableMonths', 'Período aceitável')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span className="px-2 py-1 rounded border border-red-500 bg-red-50 dark:bg-red-900/20">❌</span>
            <span>{t('newFlow.step2.avoidMonths', 'Evitar')}</span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default DurationAndBudgetSelector;
