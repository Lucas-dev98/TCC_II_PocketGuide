import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trip, TripType, BudgetPerDay, GroupType } from '../types';
import { getDestinationInfo } from '../utils/destinationMatcher';
import { getInterestsByIds } from '../utils/interestsMatcher';

interface TripPreviewProps {
  trip: Trip;
  onEdit: (step: number) => void;
  disabled?: boolean;
}

export const TripPreview: React.FC<TripPreviewProps> = ({
  trip,
  onEdit,
  disabled = false,
}) => {
  const { t } = useTranslation();

  // DEBUG: Log budget received
  console.log('🎯 TripPreview received - trip.budgetPerDay:', trip.budgetPerDay);

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
      relaxamento: t('newFlow.step1.relaxamento'),
      aventura: t('newFlow.step1.aventura'),
      cultura: t('newFlow.step1.cultura'),
      diversao: t('newFlow.step1.diversao'),
      exploracao: t('newFlow.step1.exploracao'),
      romantica: t('newFlow.step1.romantica'),
    };
    return type ? labels[type] : t('newFlow.step7.notSelected');
  };

  const getBudgetLabel = (budget?: BudgetPerDay) => {
    const labels: Record<BudgetPerDay, string> = {
      'ultra-economico': t('newFlow.step2.ultraEconomico'),
      economico: t('newFlow.step2.economico'),
      medio: t('newFlow.step2.medio'),
      premium: t('newFlow.step2.premium'),
      luxo: t('newFlow.step2.luxo'),
    };
    const result = budget ? labels[budget] : t('newFlow.step7.notSelected');
    console.log('🎯 getBudgetLabel - Input budget:', budget, '| Output label:', result);
    return result;
  };

  const getGroupLabel = (group?: GroupType) => {
    const labels: Record<GroupType, string> = {
      solo: t('newFlow.step3.solo'),
      casal: t('newFlow.step3.casal'),
      familia: t('newFlow.step3.familia'),
      amigos: t('newFlow.step3.amigos'),
      group: t('newFlow.step3.group'),
    };
    return group ? labels[group] : t('newFlow.step7.notSelected');
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
        {/* Step 1: Trip Type & Interests */}
        <PreviewCard
          step={1}
          title={t('newFlow.step1.title')}
          emoji="🎯"
          value={getTripTypeLabel(trip.tripType)}
          onEdit={() => onEdit(1)}
          disabled={disabled}
        />

        {/* Step 2: Group & Budget */}
        {(() => {
          const groupLabel = getGroupLabel(trip.groupType);
          const budgetLabel = getBudgetLabel(trip.budgetPerDay);
          const displayValue = `${groupLabel} • ${budgetLabel}`;
          console.log('🎯 TripPreview Step 2 Display:', {
            tripGroupType: trip.groupType,
            tripBudgetPerDay: trip.budgetPerDay,
            groupLabel,
            budgetLabel,
            displayValue,
          });
          return (
            <PreviewCard
              step={2}
              title={t('newFlow.step2.title')}
              emoji="👥"
              value={displayValue}
              onEdit={() => onEdit(2)}
              disabled={disabled}
            />
          );
        })()}

        {/* Step 3: Dates */}
        <PreviewCard
          step={3}
          title={t('newFlow.step3.title')}
          emoji="📅"
          value={`${trip.startDate || '-'} → ${trip.endDate || '-'}`}
          onEdit={() => onEdit(3)}
          disabled={disabled}
        />

        {/* Step 4: Destination */}
        <PreviewCard
          step={4}
          title={t('newFlow.step4.title')}
          emoji={destinationInfo?.emoji || '🌍'}
          value={trip.destination || t('newFlow.step7.notSelected')}
          onEdit={() => onEdit(4)}
          disabled={disabled}
        />

        {/* Interests Display */}
        <div
          className="border-2 border-indigo-200 dark:border-indigo-700 rounded-lg p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer"
          onClick={() => !disabled && onEdit(1)}
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
