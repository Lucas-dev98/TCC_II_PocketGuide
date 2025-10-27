/**
 * useFavorites Hook
 * 
 * Integra com favoritesStore para gerenciar favoritos
 * em componentes React
 */

import { useFavoritesStore } from '../stores/favoritesStore'

export function useFavorites() {
  // Subscribe to store methods for actions
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
  
  // Get favorites array directly from state for reactivity
  const favorites = useFavoritesStore((state) => {
    const fav = state.favorites
    if (!fav) return []
    if (fav instanceof Set) return Array.from(fav)
    if (Array.isArray(fav)) return fav as string[]
    return []
  })

  const count = useFavoritesStore((state) => {
    const fav = state.favorites
    if (!fav) return 0
    if (fav instanceof Set) return fav.size
    if (Array.isArray(fav)) return (fav as string[]).length
    return 0
  })

  // Create a reactive isFavorite function that checks against current favorites
  const isFavorite = (tripId: string) => {
    return favorites.includes(tripId)
  }

  return {
    // State
    favorites,
    count,

    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
}
