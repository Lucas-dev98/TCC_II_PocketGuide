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

  return {
    // State
    favorites: Array.from(favorites),
    count: favorites.size,

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
