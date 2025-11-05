import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TripType, TripDuration, BudgetPerDay } from '../types';
import {
  matchDestinations,
  getDestinationInfo,
  getAllDestinations,
  DestinationScore,
} from '../utils/destinationMatcher';

interface DestinationSelectorProps {
  tripTypes: TripType[];
  duration: TripDuration;
  budget: BudgetPerDay;
  selectedMonth?: number;
  selectedDestination?: string;
  onDestinationChange: (destination: string) => void;
  disabled?: boolean;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  tripTypes,
  duration,
  budget,
  selectedMonth,
  selectedDestination,
  onDestinationChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const recommendations = useMemo(
    () =>
      matchDestinations(
        tripTypes,
        duration,
        budget,
        selectedMonth || '',
        selectedDestination
      ),
    [tripTypes, duration, budget, selectedMonth, selectedDestination]
  );

  const allDestinations = useMemo(() => getAllDestinations(), []);

  const filteredDestinations = useMemo(
    () =>
      searchQuery.length > 0
        ? allDestinations.filter((d) =>
            d.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [],
    [searchQuery, allDestinations]
  );

  const handleSelectRecommendation = (destination: string) => {
    onDestinationChange(destination);
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleSelectFromSearch = (destination: string) => {
    onDestinationChange(destination);
    setShowSearch(false);
    setSearchQuery('');
  };

  const selectedInfo = useMemo(
    () =>
      selectedDestination ? getDestinationInfo(selectedDestination) : undefined,
    [selectedDestination]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-gray-900 dark:text-white">
          {t('newFlow.step5.title')}
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('newFlow.step5.subtitle')}
        </p>
      </div>

      {/* Selected Destination Display */}
      {selectedDestination && selectedInfo && (
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl">
                <span className="text-3xl">{selectedInfo.emoji}</span>
                <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedDestination}
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedInfo.country}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedInfo.description}
              </p>
            </div>
            <button
              onClick={() => {
                onDestinationChange('');
                setShowSearch(false);
              }}
              className="px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded transition"
              disabled={disabled}
            >
              {t('common.change')}
            </button>
          </div>
        </div>
      )}

      {/* Recommendations or Search */}
      {!selectedDestination ? (
        <div className="space-y-4">
          {/* AI Recommendations */}
          {!showSearch ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🤖</span>
                  {t('newFlow.step5.aiRecommendations')}
                </h3>
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-sm px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                  disabled={disabled}
                >
                  {t('newFlow.step5.manualSearch')}
                </button>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {recommendations.map((rec, idx) => (
                    <RecommendationCard
                      key={`${rec.name}-${idx}`}
                      recommendation={rec}
                      rank={idx + 1}
                      onSelect={() => handleSelectRecommendation(rec.name)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200">
                  {t('newFlow.step5.noRecommendations')}
                </div>
              )}
            </div>
          ) : null}

          {/* Manual Search */}
          {showSearch ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  disabled={disabled}
                >
                  ← {t('common.back')}
                </button>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('newFlow.step5.searchDestinations')}
                </h3>
              </div>

              <input
                type="text"
                placeholder={t('newFlow.step5.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={disabled}
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />

              {filteredDestinations.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {filteredDestinations.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => handleSelectFromSearch(dest)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition text-gray-900 dark:text-white font-medium"
                      disabled={disabled}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              ) : searchQuery.length > 0 ? (
                <div className="p-3 text-sm text-gray-600 dark:text-gray-400 text-center">
                  {t('newFlow.step5.noResults')}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: DestinationScore;
  rank: number;
  onSelect: () => void;
  disabled?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  onSelect,
  disabled,
}) => {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left p-4 border-2 rounded-lg transition ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full text-white font-bold text-sm">
              {rank}
            </div>
            <span className="text-2xl">{recommendation.emoji}</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {recommendation.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {recommendation.country}
              </p>
            </div>
          </div>

          {/* Match Percentage */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  recommendation.matchPercentage >= 80
                    ? 'bg-green-500'
                    : recommendation.matchPercentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-orange-500'
                }`}
                style={{ width: `${recommendation.matchPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-12">
              {recommendation.matchPercentage}%
            </span>
          </div>

          {/* Reasons */}
          {recommendation.reasons.length > 0 && (
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {recommendation.reasons.slice(0, 3).map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="ml-3 text-indigo-600 dark:text-indigo-400 text-2xl">
          →
        </div>
      </div>
    </button>
  );
};
