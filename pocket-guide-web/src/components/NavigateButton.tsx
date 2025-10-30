import React from 'react';
import { Navigation2, Loader } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { Attraction } from '../types';

interface NavigateButtonProps {
  attraction: Attraction;
  onNavigate: (attraction: Attraction) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Botão de navegação para uma atração
 * Dispara o cálculo de rota para o local
 */
export const NavigateButton: React.FC<NavigateButtonProps> = ({
  attraction,
  onNavigate,
  isLoading = false,
  disabled = false,
}) => {
  const { t } = useI18n();

  const handleClick = () => {
    if (!isLoading && !disabled && attraction.location.lat && attraction.location.lng) {
      onNavigate(attraction);
    }
  };

  const hasValidCoordinates = 
    typeof attraction.location.lat === 'number' && 
    typeof attraction.location.lng === 'number' &&
    !isNaN(attraction.location.lat) && 
    !isNaN(attraction.location.lng);

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || !hasValidCoordinates}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium
        text-sm transition-all duration-200
        ${
          disabled || isLoading || !hasValidCoordinates
            ? 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 active:scale-95'
        }
      `}
      aria-label={t('common.navigate')}
      title={
        !hasValidCoordinates 
          ? t('errors.invalidCoordinates', 'Coordenadas inválidas')
          : t('common.navigate')
      }
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Navigation2 className="w-4 h-4" />
      )}
      <span>{t('common.navigate')}</span>
    </button>
  );
};
