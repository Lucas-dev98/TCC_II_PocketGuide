import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TripType, BudgetPerDay, GroupType, Location } from '../types';
import {
  matchDestinations,
  getDestinationInfo,
  DestinationScore,
} from '../utils/destinationMatcher';
import {
  getHybridDestinationRecommendations,
} from '../services/destinationRecommendationService';
import {
  trackRecommendationImpression,
  trackRecommendationClick,
} from '../services/recommendationTelemetryService';
import { CityAutocomplete } from './CityAutocomplete';
import logger from '../services/logger';

interface DestinationSelectorProps {
  tripTypes: TripType[];
  interests?: string[];
  groupType?: GroupType;
  numPeople?: number;
  numChildren?: number;
  budget: BudgetPerDay;
  startDate?: string;
  endDate?: string;
  season?: 'primavera' | 'verão' | 'outono' | 'inverno';
  tripScope?: 'nacional' | 'internacional' | '';
  selectedMonth?: number;
  selectedDestination?: string;
  userLocation?: Location | null;
  onDestinationChange: (destination: string) => void;
  onNext?: () => void; // Called when destination is selected to auto-advance
  disabled?: boolean;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  tripTypes,
  interests,
  groupType,
  numPeople,
  numChildren,
  budget,
  startDate,
  endDate,
  season,
  tripScope,
  selectedMonth,
  selectedDestination,
  userLocation,
  onDestinationChange,
  onNext,
  disabled = false,
}) => {
  const { t, i18n } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const [recommendations, setRecommendations] = useState<DestinationScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastTrackedImpressionRef = useRef<string>('');

  // Generate recommendations using Gemini (with fallback to rule-based)
  // Note: removed selectedDestination from dependencies to prevent re-generating
  // recommendations when a destination is selected
  useEffect(() => {
    setIsLoading(true);
    const generateRecommendations = async () => {
      try {
        // DEBUG: Log all parameters being passed to AI, INCLUDING userLocation
        console.log('🎯 DestinationSelector - Parameters for AI:', {
          tripTypes,
          interests,
          groupType,
          numPeople,
          numChildren,
          budget,
          startDate,
          endDate,
          season,
          selectedMonth,
          userLocation, // ✅ Log user location to verify it's being used
          language: i18n?.language || 'en-US',
        });
        
        if (userLocation) {
          console.log('📍 User Location Details:', {
            address: userLocation.address,
            lat: userLocation.lat,
            lng: userLocation.lng,
          });
        } else {
          console.warn('⚠️ No user location available for proximity filtering');
        }

        const recs = await getHybridDestinationRecommendations(
          tripTypes,
          interests,
          groupType,
          numPeople,
          numChildren,
          budget,
          startDate,
          endDate,
          season,
          selectedMonth,
          tripScope,
          userLocation,
          () => matchDestinations(
            tripTypes,
            interests,
            groupType,
            numPeople,
            numChildren,
            budget,
            startDate,
            endDate,
            selectedMonth || '',
            '', // Don't filter by selected destination during recommendations
            tripScope
          ),
          i18n?.language || 'en-US'
        );
        setRecommendations(recs);
      } catch (error) {
        logger.error('Error generating recommendations:', error instanceof Error ? error : new Error(String(error)));
        // Fallback to rule-based matching
        const fallbackRecs = matchDestinations(
          tripTypes,
          interests,
          groupType,
          numPeople,
          numChildren,
          budget,
          startDate,
          endDate,
          selectedMonth || '',
          '', // Don't filter by selected destination during recommendations
          tripScope
        );
        setRecommendations(fallbackRecs);
      } finally {
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, [
    tripTypes,
    interests,
    groupType,
    numPeople,
    numChildren,
    budget,
    startDate,
    endDate,
    season,
    selectedMonth,
    i18n?.language,
    userLocation, // ✅ CRITICAL: Added to regenerate recommendations when user location changes
  ]); // Regenerate when season or user location changes

  // Memoize selected destination info
  const selectedInfo = useMemo(
    () =>
      selectedDestination ? getDestinationInfo(selectedDestination) : undefined,
    [selectedDestination]
  );

  const telemetryContext = useMemo(
    () => ({
      tripTypes,
      interests: interests || [],
      budget,
      groupType,
      tripScope,
      season,
      language: i18n?.language || 'en-US',
    }),
    [tripTypes, interests, budget, groupType, tripScope, season, i18n?.language]
  );

  const recommendationSignature = useMemo(
    () => recommendations.map((rec) => `${rec.name}:${rec.matchPercentage}`).join('|'),
    [recommendations]
  );

  useEffect(() => {
    if (isLoading || recommendations.length === 0 || showSearch) {
      return;
    }

    if (lastTrackedImpressionRef.current === recommendationSignature) {
      return;
    }

    const summary = trackRecommendationImpression(
      'destination_selector',
      recommendations.map((rec, index) => ({
        destination: rec.name,
        score: rec.matchPercentage,
        rank: index + 1,
      })),
      telemetryContext
    );

    lastTrackedImpressionRef.current = recommendationSignature;

    logger.logEvent('recommendation_summary_after_impression', {
      impressions: summary.impressions,
      displayedRecommendations: summary.displayedRecommendations,
      averageDisplayedScore: summary.averageDisplayedScore,
      averageClickedScore: summary.averageClickedScore,
      clickThroughRate: summary.clickThroughRate,
    });
  }, [isLoading, recommendations, showSearch, recommendationSignature, telemetryContext]);

  const handleSelectRecommendation = (recommendation: DestinationScore, rank: number) => {
    const summary = trackRecommendationClick(
      'destination_selector',
      {
        destination: recommendation.name,
        score: recommendation.matchPercentage,
        rank,
      },
      telemetryContext
    );

    logger.logEvent('recommendation_summary_after_click', {
      destination: recommendation.name,
      selectedScore: recommendation.matchPercentage,
      averageDisplayedScore: summary.averageDisplayedScore,
      averageClickedScore: summary.averageClickedScore,
      clickThroughRate: summary.clickThroughRate,
    });

    const destination = recommendation.name;
    onDestinationChange(destination);
    setShowSearch(false);
    // Auto-advance to next step after selection
    setTimeout(() => {
      onNext?.();
    }, 300);
  };

  const handleSelectFromSearch = (destination: string) => {
    onDestinationChange(destination);
    setShowSearch(false);
    // Auto-advance to next step after selection
    setTimeout(() => {
      onNext?.();
    }, 300);
  };

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

      {/* Selected Destination Display - only after navigation away and back */}
      {selectedDestination && selectedInfo && !showSearch && recommendations.length === 0 && (
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
      {!selectedDestination || recommendations.length > 0 ? (
        <div className="space-y-4">
          {/* AI Recommendations */}
          {!showSearch ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🤖</span>
                  {t('newFlow.step5.aiRecommendations')}
                  {isLoading && <span className="animate-spin text-lg">⏳</span>}
                </h3>
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-sm px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                  disabled={disabled}
                >
                  {t('newFlow.step5.manualSearch')}
                </button>
              </div>

              {isLoading && recommendations.length === 0 ? (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="animate-spin text-2xl">🤖</div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {t('newFlow.step5.loadingRecommendations') || 'Analisando preferências...'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('newFlow.step5.loadingSubtitle') || 'Buscando os melhores destinos para você'}
                  </p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {recommendations.map((rec, idx) => (
                    <RecommendationCard
                      key={`${rec.name}-${idx}`}
                      recommendation={rec}
                      rank={idx + 1}
                      isSelected={selectedDestination === rec.name}
                      onSelect={() => handleSelectRecommendation(rec, idx + 1)}
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

              <CityAutocomplete
                value=""
                onCitySelect={(city) => {
                  handleSelectFromSearch(city);
                }}
                placeholder={t('newFlow.step5.searchPlaceholder')}
                language={i18n?.language || 'en'}
                tripTypes={tripTypes}
                interests={interests}
                groupType={groupType}
                budget={budget}
                tripScope={tripScope}
              />
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
  isSelected?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  isSelected = false,
  onSelect,
  disabled,
}) => {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left p-4 border-2 rounded-lg transition ${
        isSelected
          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg shadow-indigo-500/20'
          : disabled
            ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
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

        <div className={`ml-3 text-2xl transition-all ${
          isSelected
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-indigo-600 dark:text-indigo-400 opacity-60'
        }`}>
          {isSelected ? '✓' : '→'}
        </div>
      </div>
    </button>
  );
};
