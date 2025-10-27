/**
 * Favorites Store
 * 
 * Gerencia viagens favoritadas do usuário
 * - Persist em localStorage
 * - Add/remove/toggle favoritos
 * - Query favoritados
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { debug } from '../utils/debug'

export interface FavoritesState {
  // State
  favorites: Set<string> // Trip IDs
  lastUpdated: Date | null

  // Actions
  addFavorite: (tripId: string) => void
  removeFavorite: (tripId: string) => void
  toggleFavorite: (tripId: string) => boolean
  isFavorite: (tripId: string) => boolean
  getFavorites: () => string[]
  clearFavorites: () => void
  getFavoritesCount: () => number

  // Utils
  getFavoritesSet: () => Set<string>
}

/**
 * Custom storage para Set
 */
const favoritesStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name)
    if (!item) return null
    try {
      const parsed = JSON.parse(item)
      const favorites = parsed.favorites
      // Garantir que é sempre um Set
      if (Array.isArray(favorites)) {
        return {
          ...parsed,
          favorites: new Set(favorites),
        }
      }
      return {
        ...parsed,
        favorites: favorites instanceof Set ? favorites : new Set(favorites || []),
      }
    } catch (error) {
      debug.error('Error parsing favorites:', error)
      return null
    }
  },
  setItem: (name: string, value: any) => {
    try {
      const toStore = {
        ...value,
        favorites: Array.from(value.favorites || []),
      }
      localStorage.setItem(name, JSON.stringify(toStore))
    } catch (error) {
      debug.error('Error storing favorites:', error)
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name)
  },
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: new Set<string>(),
      lastUpdated: null,

      // Actions
      addFavorite: (tripId: string) => {
        console.log(`[Store] addFavorite called for: ${tripId}`)
        set((state) => {
          // Garantir que favorites é sempre um array antes de criar Set
          let favoritesArray: string[] = []
          
          if (state.favorites instanceof Set) {
            favoritesArray = Array.from(state.favorites)
          } else if (Array.isArray(state.favorites)) {
            favoritesArray = state.favorites as string[]
          }
          
          const newFavorites = new Set(favoritesArray)
          newFavorites.add(tripId)
          console.log(`[Store] new favorites after add:`, Array.from(newFavorites))
          debug.log(`⭐ Added favorite: ${tripId}`)
          return {
            favorites: newFavorites,
            lastUpdated: new Date(),
          }
        })
      },

      removeFavorite: (tripId: string) => {
        console.log(`[Store] removeFavorite called for: ${tripId}`)
        set((state) => {
          // Garantir que favorites é sempre um array antes de criar Set
          let favoritesArray: string[] = []
          
          if (state.favorites instanceof Set) {
            favoritesArray = Array.from(state.favorites)
          } else if (Array.isArray(state.favorites)) {
            favoritesArray = state.favorites as string[]
          }
          
          const newFavorites = new Set(favoritesArray)
          newFavorites.delete(tripId)
          console.log(`[Store] new favorites after remove:`, Array.from(newFavorites))
          debug.log(`💔 Removed favorite: ${tripId}`)
          return {
            favorites: newFavorites,
            lastUpdated: new Date(),
          }
        })
      },

      toggleFavorite: (tripId: string) => {
        const state = get()
        const favorites = state.favorites
        let isFav = false
        
        if (favorites instanceof Set) {
          isFav = favorites.has(tripId)
        } else if (Array.isArray(favorites)) {
          isFav = (favorites as string[]).includes(tripId)
        }

        // Directly update state instead of calling async methods
        set((currentState) => {
          // Garantir que favorites é sempre um array antes de criar Set
          let favoritesArray: string[] = []
          
          if (currentState.favorites instanceof Set) {
            favoritesArray = Array.from(currentState.favorites)
          } else if (Array.isArray(currentState.favorites)) {
            favoritesArray = currentState.favorites as string[]
          }
          
          const newFavorites = new Set(favoritesArray)
          if (isFav) {
            newFavorites.delete(tripId)
            debug.log(`💔 Removed favorite: ${tripId}`)
          } else {
            newFavorites.add(tripId)
            debug.log(`⭐ Added favorite: ${tripId}`)
          }
          return {
            favorites: newFavorites,
            lastUpdated: new Date(),
          }
        })
        
        return !isFav
      },

      isFavorite: (tripId: string) => {
        const favorites = get().favorites
        if (!favorites) return false
        if (favorites instanceof Set) return favorites.has(tripId)
        if (Array.isArray(favorites)) return (favorites as string[]).includes(tripId)
        return false
      },

      getFavorites: () => {
        const favorites = get().favorites
        if (!favorites) return []
        if (favorites instanceof Set) return Array.from(favorites)
        if (Array.isArray(favorites)) return favorites
        return []
      },

      getFavoritesSet: () => {
        const favorites = get().favorites
        if (favorites instanceof Set) return new Set(favorites)
        if (Array.isArray(favorites)) return new Set(favorites)
        return new Set<string>()
      },

      clearFavorites: () => {
        set(() => {
          debug.log('🗑️ Cleared all favorites')
          return {
            favorites: new Set<string>(),
            lastUpdated: new Date(),
          }
        })
      },

      getFavoritesCount: () => {
        const favorites = get().favorites
        if (!favorites) return 0
        if (favorites instanceof Set) return favorites.size
        if (Array.isArray(favorites)) return (favorites as string[]).length
        return 0
      },
    }),
    {
      name: 'favorites-storage',
      storage: favoritesStorage,
      version: 1,
    }
  )
)
