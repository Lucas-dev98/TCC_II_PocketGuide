import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getMonthStatus, getMonthReason, MONTHS } from '../utils/seasonalData';

interface SeasonalSelectorProps {
  destination: string;
  selectedMonth: number | '';
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  disabled?: boolean;
}

export const SeasonalSelector: React.FC<SeasonalSelectorProps> = ({
  destination,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const monthStatus = useMemo(() => {
    if (!selectedMonth || !destination) return null;
    return getMonthStatus(destination, selectedMonth as number);
  }, [selectedMonth, destination]);

  const monthReasons = useMemo(() => {
    if (!selectedMonth || !destination) return [];
    return getMonthReason(destination, selectedMonth as number);
  }, [selectedMonth, destination]);

  const getMonthColor = (month: number) => {
    const status = getMonthStatus(destination, month);

    switch (status) {
      case 'best':
        return 'border-green-300 bg-green-50 text-green-900 dark:bg-green-950 dark:border-green-700 dark:text-green-100';
      case 'avoid':
        return 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-700 dark:text-red-100';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-100';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:border-gray-700 dark:text-gray-100';
    }
  };

  const getMonthEmoji = (month: number) => {
    const status = getMonthStatus(destination, month);
    switch (status) {
      case 'best':
        return '✅';
      case 'avoid':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Destination Info */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>{t('newFlow.step4.selectingFor', 'Selecionando datas para')}:</strong>{' '}
          <span className="font-semibold">{destination || t('noDestination', 'Sem destino')}</span>
        </p>
      </div>

      {/* Month Selection Calendar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step4.selectMonth', '📅 Qual é o melhor mês?')}
        </h3>

        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {MONTHS.map((month) => {
            const isSelected = selectedMonth === month.number;
            const color = getMonthColor(month.number);
            const emoji = getMonthEmoji(month.number);

            return (
              <button
                key={month.number}
                onClick={() => !disabled && onMonthChange(month.number)}
                disabled={disabled}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-center font-medium ${color} ${
                  isSelected ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                title={`${month.name} - ${getMonthReason(destination, month.number).join(', ')}`}
              >
                <div className="text-xl mb-1">{emoji}</div>
                <div className="text-xs">{month.abbr}</div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-gray-600 dark:text-gray-400">{t('best', 'Melhor época')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-gray-600 dark:text-gray-400">{t('warning', 'Cuidado')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <span className="text-gray-600 dark:text-gray-400">{t('avoid', 'Evitar')}</span>
          </div>
        </div>
      </div>

      {/* Year Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
          {t('newFlow.step4.selectYear', '📆 Selecione o ano')}
        </label>

        <div className="flex gap-2 flex-wrap">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => !disabled && onYearChange(year)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedYear === year
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                  : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Details */}
      {selectedMonth && (
        <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
          <div className="space-y-2">
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              <strong>{t('newFlow.step4.selectedDate', 'Data selecionada')}:</strong>{' '}
              {MONTHS[Number(selectedMonth) - 1]?.name} de {selectedYear}
            </p>

            {monthStatus && (
              <p className="text-sm text-indigo-900 dark:text-indigo-100">
                <strong>{t('newFlow.step4.status', 'Status')}:</strong>{' '}
                {monthStatus === 'best' && '✅ Melhor época'}
                {monthStatus === 'warning' && '⚠️ Período aceitável'}
                {monthStatus === 'avoid' && '❌ Não recomendado'}
              </p>
            )}

            {monthReasons.length > 0 && (
              <div className="text-sm text-indigo-900 dark:text-indigo-100">
                <strong>{t('newFlow.step4.reasons', 'Razões')}:</strong>
                <ul className="list-disc list-inside mt-1">
                  {monthReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalSelector;
