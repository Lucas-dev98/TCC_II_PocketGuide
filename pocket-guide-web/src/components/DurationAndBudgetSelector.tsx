import React from 'react';
import { useTranslation } from 'react-i18next';

interface DurationAndBudgetProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  disabled?: boolean;
}


export const DurationAndBudgetSelector: React.FC<DurationAndBudgetProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
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

    </div>
  );
};

export default DurationAndBudgetSelector;
