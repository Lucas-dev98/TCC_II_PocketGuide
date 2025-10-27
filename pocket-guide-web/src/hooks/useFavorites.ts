/**
 * useFavorites Hook
 * 
 * Integra com favoritesStore para gerenciar favoritos
 * em componentes React
 */

import { useFavoritesStore } from '../stores/favoritesStore'

export function useFavorites() {
  // Subscribe directly to store methods and favorites state for reactivity
  const addFavorite = useFavoritesStore((state) => state.addFavorite)
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites)
  
  // Get favorites array and count directly from state for reactivity
  // These selectors will cause component to re-render when favorites state changes
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
