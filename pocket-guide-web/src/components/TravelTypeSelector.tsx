import React from 'react';
import { useTranslation } from 'react-i18next';
import { TripType } from '../types';

interface TravelTypeSelectorProps {
  selected: TripType[];
  onChange: (types: TripType[]) => void;
  disabled?: boolean;
}

interface TravelTypeOption {
  id: TripType;
  emoji: string;
  labelKey: string;
  descriptionKey: string;
}

const TRAVEL_TYPES: TravelTypeOption[] = [
  {
    id: 'relaxamento',
    emoji: '🏖️',
    labelKey: 'relaxamento',
    descriptionKey: 'relaxamento_desc',
  },
  {
    id: 'aventura',
    emoji: '🏔️',
    labelKey: 'aventura',
    descriptionKey: 'aventura_desc',
  },
  {
    id: 'cultura',
    emoji: '🎨',
    labelKey: 'cultura',
    descriptionKey: 'cultura_desc',
  },
  {
    id: 'diversao',
    emoji: '🎉',
    labelKey: 'diversao',
    descriptionKey: 'diversao_desc',
  },
  {
    id: 'exploracao',
    emoji: '🌍',
    labelKey: 'exploracao',
    descriptionKey: 'exploracao_desc',
  },
  {
    id: 'romantica',
    emoji: '❤️',
    labelKey: 'romantica',
    descriptionKey: 'romantica_desc',
  },
];

export const TravelTypeSelector: React.FC<TravelTypeSelectorProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleToggle = (type: TripType) => {
    if (disabled) return;
    
    const newSelected = selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type];
    
    onChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('newFlow.step1.selectTravelType')}
        </h3>
        {selected.length > 0 && (
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {selected.length} {selected.length === 1 ? 'escolhido' : 'escolhidos'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {TRAVEL_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => handleToggle(type.id)}
            disabled={disabled}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
              selected.includes(type.id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={selected.includes(type.id)}
            title={t(type.descriptionKey)}
          >
            {/* Checkmark */}
            {selected.includes(type.id) && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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

            {/* Content */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">{type.emoji}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                {t(type.labelKey)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('newFlow.step1.travelTypeInfo')}
      </p>
    </div>
  );
};

export default TravelTypeSelector;
