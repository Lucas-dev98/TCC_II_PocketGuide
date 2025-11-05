import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TripType } from '../types';
import {
  getPrimaryRecommendedInterests,
  getPrimaryRecommendedInterestsByTypes,
  getAllInterestCategories,
  getInterestsByIds,
  InterestCategory,
} from '../utils/interestsMatcher';

interface InterestsSelectorProps {
  tripType?: TripType;
  tripTypes?: TripType[];
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  disabled?: boolean;
  showAllCategories?: boolean;
}

export const InterestsSelector: React.FC<InterestsSelectorProps> = ({
  tripType,
  tripTypes = [],
  selectedInterests,
  onInterestsChange,
  disabled = false,
  showAllCategories = false,
}) => {
  const { t } = useTranslation();

  const categories = useMemo(() => {
    if (showAllCategories) {
      return getAllInterestCategories();
    }
    
    // If multiple trip types provided, use those
    if (tripTypes && tripTypes.length > 0) {
      return getPrimaryRecommendedInterestsByTypes(tripTypes);
    }
    
    // Otherwise use single tripType if provided
    if (tripType) {
      return getPrimaryRecommendedInterests(tripType);
    }
    
    return getAllInterestCategories();
  }, [tripType, tripTypes, showAllCategories]);

  const selectedInterestObjects = useMemo(
    () => getInterestsByIds(selectedInterests),
    [selectedInterests]
  );

  const handleToggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      onInterestsChange(selectedInterests.filter((id) => id !== interestId));
    } else {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-gray-900 dark:text-white">
          {t('newFlow.step6.title')}
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('newFlow.step6.subtitle')}
        </p>
      </div>

      {/* Selected interests summary */}
      {selectedInterestObjects.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            {t('newFlow.step6.selected')} ({selectedInterestObjects.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedInterestObjects.map((interest) => (
              <button
                key={interest.id}
                onClick={() => handleToggleInterest(interest.id)}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{interest.emoji}</span>
                <span>{interest.label}</span>
                <span className="ml-1">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <CategorySection
            key={category.name}
            category={category}
            selectedInterestIds={selectedInterests}
            onToggleInterest={handleToggleInterest}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          💡 {t('newFlow.step6.helper')}
        </p>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: InterestCategory;
  selectedInterestIds: string[];
  onToggleInterest: (interestId: string) => void;
  disabled?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  selectedInterestIds,
  onToggleInterest,
  disabled,
}) => {
  const isAnySelected = category.interests.some((i) =>
    selectedInterestIds.includes(i.id)
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition">
      {/* Category header */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <span className="text-2xl">{category.emoji}</span>
        <span>{category.name}</span>
        {isAnySelected && (
          <span className="ml-auto text-xs font-normal bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
            {category.interests.filter((i) => selectedInterestIds.includes(i.id))
              .length}/{category.interests.length}
          </span>
        )}
      </h3>

      {/* Interest buttons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {category.interests.map((interest) => {
          const isSelected = selectedInterestIds.includes(interest.id);

          return (
            <button
              key={interest.id}
              onClick={() => onToggleInterest(interest.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              } ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } flex flex-col items-center gap-1 text-center`}
            >
              <span className="text-2xl">{interest.emoji}</span>
              <span
                className={`text-xs font-medium leading-tight ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {interest.label}
              </span>
              {isSelected && (
                <span className="mt-1 text-indigo-600 dark:text-indigo-400">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
