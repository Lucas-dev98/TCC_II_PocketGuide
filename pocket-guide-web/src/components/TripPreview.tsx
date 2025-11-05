import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trip, TripType, TripDuration, BudgetPerDay, GroupType } from '../types';
import { getDestinationInfo } from '../utils/destinationMatcher';
import { getInterestsByIds } from '../utils/interestsMatcher';

interface TripPreviewProps {
  trip: Trip;
  onConfirm: () => void;
  onEdit: (step: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const TripPreview: React.FC<TripPreviewProps> = ({
  trip,
  onConfirm,
  onEdit,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const destinationInfo = useMemo(
    () => (trip.destination ? getDestinationInfo(trip.destination) : undefined),
    [trip.destination]
  );

  const interestObjects = useMemo(
    () => (trip.interests ? getInterestsByIds(trip.interests) : []),
    [trip.interests]
  );

  const budgetPerDay = useMemo(() => {
    if (!trip.budgetPerDay) return null;

    const budgetRanges: Record<BudgetPerDay, { min: number; max: number; label: string }> = {
      'ultra-economico': { min: 30, max: 60, label: '💰' },
      economico: { min: 60, max: 100, label: '💰💰' },
      medio: { min: 100, max: 200, label: '💰💰💰' },
      premium: { min: 200, max: 400, label: '💰💰💰💰' },
      luxo: { min: 400, max: 1000, label: '💰💰💰💰💰' },
    };

    return budgetRanges[trip.budgetPerDay];
  }, [trip.budgetPerDay]);

  const getTripTypeLabel = (type?: TripType) => {
    const labels: Record<TripType, string> = {
      relaxamento: t('newFlow.step1.types.relaxamento.label'),
      aventura: t('newFlow.step1.types.aventura.label'),
      cultura: t('newFlow.step1.types.cultura.label'),
      diversao: t('newFlow.step1.types.diversao.label'),
      exploracao: t('newFlow.step1.types.exploracao.label'),
      romantica: t('newFlow.step1.types.romantica.label'),
    };
    return type ? labels[type] : t('newFlow.step7.notSelected');
  };

  const getDurationLabel = (duration?: TripDuration) => {
    const labels: Record<TripDuration, string> = {
      'fim-de-semana': t('newFlow.step2.durations.weekend'),
      'uma-semana': t('newFlow.step2.durations.oneWeek'),
      'duas-semanas': t('newFlow.step2.durations.twoWeeks'),
      'mes-plus': t('newFlow.step2.durations.oneMonth'),
    };
    return duration ? labels[duration] : t('newFlow.step7.notSelected');
  };

  const getBudgetLabel = (budget?: BudgetPerDay) => {
    const labels: Record<BudgetPerDay, string> = {
      'ultra-economico': t('newFlow.step2.budgets.ultraBudget'),
      economico: t('newFlow.step2.budgets.budget'),
      medio: t('newFlow.step2.budgets.medium'),
      premium: t('newFlow.step2.budgets.premium'),
      luxo: t('newFlow.step2.budgets.luxury'),
    };
    return budget ? labels[budget] : t('newFlow.step7.notSelected');
  };

  const getGroupLabel = (group?: GroupType) => {
    const labels: Record<GroupType, string> = {
      solo: t('newFlow.step3.groups.solo'),
      casal: t('newFlow.step3.groups.couple'),
      familia: t('newFlow.step3.groups.family'),
      amigos: t('newFlow.step3.groups.friends'),
      group: t('newFlow.step3.groups.group'),
    };
    return group ? labels[group] : t('newFlow.step7.notSelected');
  };

  const getMonthName = (month?: number | string) => {
    if (!month) return t('newFlow.step7.notSelected');
    const monthNum = typeof month === 'string' ? parseInt(month, 10) : month;
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return months[monthNum - 1] || t('newFlow.step7.notSelected');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('newFlow.step7.title')}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('newFlow.step7.subtitle')}
        </p>
      </div>

      {/* Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Trip Type */}
        <PreviewCard
          step={1}
          title={t('newFlow.step1.title')}
          emoji="🎯"
          value={getTripTypeLabel(trip.tripType)}
          onEdit={() => onEdit(1)}
          disabled={disabled}
        />

        {/* Step 2: Duration & Budget */}
        <PreviewCard
          step={2}
          title={t('newFlow.step2.title')}
          emoji="⏱️"
          value={`${getDurationLabel(trip.duration)} • ${getBudgetLabel(trip.budgetPerDay)}`}
          onEdit={() => onEdit(2)}
          disabled={disabled}
        />

        {/* Step 3: Group */}
        <PreviewCard
          step={3}
          title={t('newFlow.step3.title')}
          emoji="👥"
          value={getGroupLabel(trip.groupType)}
          onEdit={() => onEdit(3)}
          disabled={disabled}
        />

        {/* Step 4: Month */}
        <PreviewCard
          step={4}
          title={t('newFlow.step4.selectMonth')}
          emoji="📅"
          value={getMonthName(trip.travelMonth)}
          onEdit={() => onEdit(4)}
          disabled={disabled}
        />

        {/* Step 5: Destination */}
        <PreviewCard
          step={5}
          title={t('newFlow.step5.title')}
          emoji={destinationInfo?.emoji || '🌍'}
          value={trip.destination || t('newFlow.step7.notSelected')}
          onEdit={() => onEdit(5)}
          disabled={disabled}
        />

        {/* Step 6: Interests */}
        <div
          className="border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer"
          onClick={() => !disabled && onEdit(6)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {t('newFlow.step6.title')}
              </span>
            </div>
            {!disabled && (
              <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                {t('common.edit')}
              </button>
            )}
          </div>
          {interestObjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interestObjects.slice(0, 5).map((interest) => (
                <span
                  key={interest.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs"
                >
                  <span>{interest.emoji}</span>
                  <span>{interest.label}</span>
                </span>
              ))}
              {interestObjects.length > 5 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                  +{interestObjects.length - 5}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('newFlow.step7.notSelected')}
            </p>
          )}
        </div>
      </div>

      {/* Destination Details Card */}
      {destinationInfo && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{destinationInfo.emoji}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {destinationInfo.name}, {destinationInfo.country}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {destinationInfo.description}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  💰 {t('newFlow.step7.budgetRange')}: {getBudgetLabel(destinationInfo.budgetRange.min)}{' '}
                  - {getBudgetLabel(destinationInfo.budgetRange.max)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Summary */}
      {budgetPerDay && trip.duration && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            {t('newFlow.step7.budgetSummary')}
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p>
              {budgetPerDay.label} {t('newFlow.step7.perDay')}:{' '}
              <span className="font-bold">
                ${budgetPerDay.min} - ${budgetPerDay.max} USD
              </span>
            </p>
            <p className="mt-2 text-xs opacity-75">
              {t('newFlow.step7.estimatedTotal')}: ${Math.round(budgetPerDay.min * 7)} -{' '}
              ${Math.round(budgetPerDay.max * 7)} USD ({t('newFlow.step7.for7days')})
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={disabled || isLoading || !trip.destination}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              {t('newFlow.step7.confirming')}
            </>
          ) : (
            <>
              <span>✅</span>
              {t('newFlow.step7.confirm')}
            </>
          )}
        </button>
      </div>

      {/* Required Fields Warning */}
      {(!trip.destination || !trip.tripType || !trip.duration || !trip.budget) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ {t('newFlow.step7.completeInfo')}
          </p>
        </div>
      )}
    </div>
  );
};

interface PreviewCardProps {
  step: number;
  title: string;
  emoji: string;
  value: string;
  onEdit: () => void;
  disabled?: boolean;
}

const PreviewCard: React.FC<PreviewCardProps> = ({
  step,
  title,
  emoji,
  value,
  onEdit,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer"
      onClick={() => !disabled && onEdit()}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {t('newFlow.step7.step')} {step}
          </span>
        </div>
        {!disabled && (
          <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
            {t('common.edit')}
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};
