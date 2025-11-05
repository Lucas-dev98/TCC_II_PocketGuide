import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupType } from '../types';

interface GroupCompositionSelectorProps {
  selectedGroup: GroupType | '';
  numPeople?: number;
  numChildren?: number;
  onGroupChange: (group: GroupType) => void;
  onNumPeopleChange?: (num: number) => void;
  onNumChildrenChange?: (num: number) => void;
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
  onGroupChange,
  onNumPeopleChange,
  onNumChildrenChange,
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
