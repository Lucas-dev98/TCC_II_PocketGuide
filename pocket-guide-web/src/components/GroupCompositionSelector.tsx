import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupType, BudgetPerDay } from '../types';

interface GroupCompositionSelectorProps {
  selectedGroup: GroupType | '';
  numPeople?: number;
  numChildren?: number;
  budgetPerDay?: BudgetPerDay | '';
  onGroupChange: (group: GroupType) => void;
  onNumPeopleChange?: (num: number) => void;
  onNumChildrenChange?: (num: number) => void;
  onBudgetChange?: (budget: BudgetPerDay) => void;
  disabled?: boolean;
}

interface GroupOption {
  id: GroupType;
  emoji: string;
  labelKey: string;
  descriptionKey: string;
  showPeopleCount?: boolean;
  showChildrenCount?: boolean;
}

interface BudgetOption {
  id: BudgetPerDay;
  labelKey: string;
  descriptionKey: string;
  symbol: string;
}

const BUDGET_OPTIONS: BudgetOption[] = [
  {
    id: 'ultra-economico',
    labelKey: 'ultraEconomico',
    descriptionKey: 'ultraEconomico_desc',
    symbol: '$',
  },
  {
    id: 'economico',
    labelKey: 'economico',
    descriptionKey: 'economico_desc',
    symbol: '$$',
  },
  {
    id: 'medio',
    labelKey: 'medio',
    descriptionKey: 'medio_desc',
    symbol: '$$$',
  },
  {
    id: 'premium',
    labelKey: 'premium',
    descriptionKey: 'premium_desc',
    symbol: '$$$$',
  },
  {
    id: 'luxo',
    labelKey: 'luxo',
    descriptionKey: 'luxo_desc',
    symbol: '$$$$$',
  },
];

const GROUP_OPTIONS: GroupOption[] = [
  {
    id: 'solo',
    emoji: '👤',
    labelKey: 'solo',
    descriptionKey: 'solo_desc',
    showPeopleCount: false,
    showChildrenCount: false,
  },
  {
    id: 'casal',
    emoji: '👥',
    labelKey: 'casal',
    descriptionKey: 'casal_desc',
    showPeopleCount: false,
    showChildrenCount: false,
  },
  {
    id: 'familia',
    emoji: '👨‍👩‍👧‍👦',
    labelKey: 'familia',
    descriptionKey: 'familia_desc',
    showPeopleCount: true,
    showChildrenCount: true,
  },
  {
    id: 'amigos',
    emoji: '👫',
    labelKey: 'amigos',
    descriptionKey: 'amigos_desc',
    showPeopleCount: true,
    showChildrenCount: false,
  },
  {
    id: 'group',
    emoji: '🎓',
    labelKey: 'group',
    descriptionKey: 'group_desc',
    showPeopleCount: true,
    showChildrenCount: false,
  },
];

export const GroupCompositionSelector: React.FC<GroupCompositionSelectorProps> = ({
  selectedGroup,
  numPeople = 1,
  numChildren = 0,
  budgetPerDay = '',
  onGroupChange,
  onNumPeopleChange,
  onNumChildrenChange,
  onBudgetChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [localNumPeople, setLocalNumPeople] = useState(numPeople);
  const [localNumChildren, setLocalNumChildren] = useState(numChildren);

  const selectedOption = GROUP_OPTIONS.find((opt) => opt.id === selectedGroup);

  const handleGroupSelect = (group: GroupType) => {
    if (disabled) return;
    onGroupChange(group);
    // Reset people/children counts when group changes
    setLocalNumPeople(1);
    setLocalNumChildren(0);
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || 1;
    setLocalNumPeople(num);
    onNumPeopleChange?.(num);
  };

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || 0;
    setLocalNumChildren(num);
    onNumChildrenChange?.(num);
  };

  return (
    <div className="space-y-6">
      {/* Group Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step3.selectGroup', '👥 Com quem você viaja?')}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {GROUP_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleGroupSelect(option.id)}
              disabled={disabled}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedGroup === option.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 dark:border-purple-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-pressed={selectedGroup === option.id}
              title={t(option.descriptionKey)}
            >
              {/* Checkmark */}
              {selectedGroup === option.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
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
                <span className="text-3xl">{option.emoji}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {t(option.labelKey)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Fields */}
      {selectedOption && (selectedOption.showPeopleCount || selectedOption.showChildrenCount) && (
        <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 space-y-4">
          {selectedOption.showPeopleCount && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {selectedOption.id === 'familia'
                  ? t('newFlow.step3.numPeopleFamily', 'Quantas pessoas (incluindo crianças)?')
                  : t('newFlow.step3.numPeople', 'Quantas pessoas?')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localNumPeople}
                  onChange={handlePeopleChange}
                  disabled={disabled}
                  className="w-20 px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {localNumPeople === 1
                    ? t('person', 'pessoa')
                    : t('people', 'pessoas')}
                </span>
              </div>
            </div>
          )}

          {selectedOption.showChildrenCount && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                {t('newFlow.step3.numChildren', 'Quantas crianças (0-12 anos)?')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={localNumChildren}
                  onChange={handleChildrenChange}
                  disabled={disabled}
                  className="w-20 px-3 py-2 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-indigo-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {localNumChildren === 1
                    ? t('child', 'criança')
                    : t('children', 'crianças')}
                </span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="pt-3 border-t border-indigo-200 dark:border-indigo-700">
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              <strong>{t('newFlow.step3.composition', 'Composição')}:</strong>{' '}
              {selectedOption.id === 'solo' && t('solo_full', 'Viajando sozinho')}
              {selectedOption.id === 'casal' && t('casal_full', 'Viajando em casal')}
              {selectedOption.id === 'familia' &&
                `${localNumPeople} ${
                  localNumPeople === 1 ? t('person', 'pessoa') : t('people', 'pessoas')
                }${localNumChildren > 0 ? ` (${localNumChildren} ${localNumChildren === 1 ? t('child', 'criança') : t('children', 'crianças')})` : ''}`}
              {selectedOption.id === 'amigos' &&
                `${localNumPeople} ${
                  localNumPeople === 1 ? t('person', 'pessoa') : t('people', 'pessoas')
                } de amigos`}
              {selectedOption.id === 'group' &&
                `Grupo de ${localNumPeople} ${
                  localNumPeople === 1 ? t('person', 'pessoa') : t('people', 'pessoas')
                }`}
            </p>
          </div>
        </div>
      )}

      {/* Budget Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('newFlow.step2.selectBudget', '💰 Orçamento por dia')}
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => !disabled && onBudgetChange?.(opt.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center relative ${
                budgetPerDay === opt.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-400'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={t(opt.descriptionKey)}
            >
              {budgetPerDay === opt.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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

              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {opt.symbol}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t(opt.labelKey)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Budget Reference */}
        <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-300 mb-2">
            <strong>{t('newFlow.step2.budgetGuide', 'Guia de orçamento por dia')}:</strong>
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <li>💵 <strong>{t('ultraEconomico', 'Ultra Econômico')}:</strong> R$ 0-50/dia (hostels, comida rua)</li>
            <li>💵 <strong>{t('economico', 'Econômico')}:</strong> R$ 50-150/dia (hotels simples, comida local)</li>
            <li>💵 <strong>{t('medio', 'Médio')}:</strong> R$ 150-350/dia (3-4 stars, restaurantes bons)</li>
            <li>💵 <strong>{t('premium', 'Premium')}:</strong> R$ 350-800/dia (resorts, restaurantes top)</li>
            <li>💵 <strong>{t('luxo', 'Luxo')}:</strong> R$ 800+/dia (5-stars, tudo incluído)</li>
          </ul>
        </div>
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t(
          'newFlow.step3.groupInfo',
          'A composição do grupo nos ajudará a personalizar atividades e hospedagem adequadas para sua viagem.'
        )}
      </p>
    </div>
  );
};

export default GroupCompositionSelector;
