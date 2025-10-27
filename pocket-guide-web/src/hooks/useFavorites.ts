/**
 * useFavorites Hook
 * 
 * Integra com favoritesStore para gerenciar favoritos
 * em componentes React
 */

import { useFavoritesStore } from '../stores/favoritesStore'

export function useFavorites() {
  // Zustand store
  const favorites = useFavoritesStore((state) => state.favorites)
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const getFavorites = useFavoritesStore((state) => state.getFavorites)
  const getFavoritesCount = useFavoritesStore((state) => state.getFavoritesCount)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)

  // Get count safely
  const getCount = () => {
    if (!favorites) return 0
    if (favorites instanceof Set) return favorites.size
    if (Array.isArray(favorites)) return (favorites as string[]).length
    return 0
  }

  // Get favorites array safely
  const getFavoritesArray = () => {
    if (!favorites) return []
    if (favorites instanceof Set) return Array.from(favorites)
    if (Array.isArray(favorites)) return favorites as string[]
    return []
  }

  return {
    // State
    favorites: getFavoritesArray(),
    count: getCount(),

    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorites,
    getFavoritesCount,
    clearFavorites,
  }
}
