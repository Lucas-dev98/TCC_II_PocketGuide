/**
 * FavoriteButton Component
 * 
 * Heart button to mark/unmark favorites
 * with animation and visual feedback
 */

import { useFavorites } from '../hooks/useFavorites'
import { useI18n } from '../i18n/I18nContext'

interface FavoriteButtonProps {
  tripId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'filled'
  className?: string
  onToggle?: (isFavorite: boolean) => void
}

export function FavoriteButton({
  tripId,
  size = 'md',
  variant = 'icon',
  className,
  onToggle,
}: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite: checkIsFavorite } = useFavorites()
  const { t } = useI18n()
  // Call the method directly to get reactive updates
  const isFavorite = checkIsFavorite(tripId)
  
  console.log(`[FavoriteButton] Rendering for tripId: ${tripId}, isFavorite: ${isFavorite}`)

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    console.log(`[FavoriteButton] handleToggle for: ${tripId}`)
    toggleFavorite(tripId)
    onToggle?.(!isFavorite)
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  if (variant === 'filled') {
    return (
      <button
        onClick={(e) => handleToggle(e)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isFavorite
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        } ${className}`}
      >
        <svg
          className={`${iconSizeClasses.md} transition-all ${isFavorite ? 'fill-current' : ''}`}
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{isFavorite ? t('components.favoriteButton.added') : t('components.favoriteButton.add')}</span>
      </button>
    )
  }

  // Icon variant (default)
  return (
    <button
      onClick={(e) => handleToggle(e)}
      className={`p-1.5 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
        isFavorite
          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      } ${className}`}
      title={isFavorite ? t('components.favoriteButton.removeFromFavorites') : t('components.favoriteButton.addToFavorites')}
      aria-label={isFavorite ? t('components.favoriteButton.removeFromFavorites') : t('components.favoriteButton.addToFavorites')}
    >
      <svg
        className={`${sizeClasses[size]} transition-all ${isFavorite ? 'animate-pulse' : ''}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isFavorite ? 0 : 2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
