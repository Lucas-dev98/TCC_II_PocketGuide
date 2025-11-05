import React from 'react';
import { useTranslation } from 'react-i18next';

interface TripSuccessProps {
  tripId: string;
  tripName: string;
  destination: string;
  onViewTrip: () => void;
  onCreateNew: () => void;
}

export const TripSuccess: React.FC<TripSuccessProps> = ({
  tripId,
  tripName,
  destination,
  onViewTrip,
  onCreateNew,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
      {/* Success Animation */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-4xl">🎉</span>
        </div>
      </div>

      {/* Main Message */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">
        {t('newFlow.step7.success.title')}
      </h1>

      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8 max-w-md">
        {t('newFlow.step7.success.subtitle')}
      </p>

      {/* Trip Details Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-2 border-green-200 dark:border-green-700">
        {/* Destination with Emoji */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('newFlow.step7.success.yourTrip')}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {destination}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tripName}</p>
        </div>

        {/* Trip ID */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">
            {t('newFlow.step7.success.tripId')}
          </p>
          <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{tripId}</p>
          <button
            onClick={() => navigator.clipboard.writeText(tripId)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            {t('newFlow.step7.success.copyId')}
          </button>
        </div>

        {/* Checkpoints */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('newFlow.step7.success.itineraryGenerated')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('newFlow.step7.success.budgetCalculated')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('newFlow.step7.success.saved')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={onViewTrip}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition shadow-md"
        >
          {t('newFlow.step7.success.viewTrip')}
        </button>

        <button
          onClick={onCreateNew}
          className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition"
        >
          {t('newFlow.step7.success.createNew')}
        </button>
      </div>

      {/* Footer Message */}
      <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
        {t('newFlow.step7.success.shareMessage')}
      </p>
    </div>
  );
};
