/**
 * Search Service
 * 
 * Gerencia lógica de busca e filtros de viagens
 * - Busca textual em múltiplos campos
 * - Filtros avançados (datas, orçamento, tipo)
 * - Debouncing para otimizar performance
 * - Ordenação e paginação
 */

import { Trip } from '../types'
import { debug } from '../utils/debug'

export interface SearchFilters {
  query?: string
  startDateFrom?: Date
  startDateTo?: Date
  endDateFrom?: Date
  endDateTo?: Date
  budgetMin?: string
  budgetMax?: string
  destination?: string
  sortBy?: 'date' | 'destination'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface SearchResult {
  trips: Trip[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SearchSuggestion {
  type: 'destination' | 'country' | 'recent'
  text: string
  icon?: string
}

class SearchService {
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private recentSearches: Set<string> = new Set()

  constructor() {
    this.loadRecentSearches()
  }

  /**
   * Busca viagens com base em critérios
   */
  public search(trips: Trip[], filters: SearchFilters): SearchResult {
    debug.log('🔍 Searching trips with filters:', filters)

    let results = [...trips]

    // Filtro textual (query)
    if (filters.query) {
      const query = filters.query.toLowerCase().trim()
      results = results.filter((trip) => this.matchesQuery(trip, query))
    }

    // Filtro de datas de início
    if (filters.startDateFrom || filters.startDateTo) {
      results = results.filter((trip) => {
        const startDate = new Date(trip.startDate)
        if (filters.startDateFrom && startDate < filters.startDateFrom) return false
        if (filters.startDateTo && startDate > filters.startDateTo) return false
        return true
      })
    }

    // Filtro de datas de fim
    if (filters.endDateFrom || filters.endDateTo) {
      results = results.filter((trip) => {
        const endDate = new Date(trip.endDate)
        if (filters.endDateFrom && endDate < filters.endDateFrom) return false
        if (filters.endDateTo && endDate > filters.endDateTo) return false
        return true
      })
    }

    // Filtro de destino
    if (filters.destination) {
      const destination = filters.destination.toLowerCase()
      results = results.filter((trip) => trip.destination.toLowerCase().includes(destination))
    }

    // Filtro de orçamento
    if (filters.budgetMin || filters.budgetMax) {
      const budgetOrder = { 'econômico': 1, 'médio': 2, 'luxo': 3 }
      results = results.filter((trip) => {
        if (!trip.budget) return false
        const tripBudgetLevel = budgetOrder[trip.budget as keyof typeof budgetOrder] || 0
        const minLevel = filters.budgetMin
          ? budgetOrder[filters.budgetMin as keyof typeof budgetOrder] || 0
          : 0
        const maxLevel = filters.budgetMax
          ? budgetOrder[filters.budgetMax as keyof typeof budgetOrder] || 3
          : 3

        return tripBudgetLevel >= minLevel && tripBudgetLevel <= maxLevel
      })
    }

    // Total antes de ordenar e paginar
    const total = results.length

    // Ordenação
    results = this.sortResults(results, filters.sortBy || 'date', filters.sortOrder || 'desc')

    // Paginação
    const page = filters.page || 1
    const pageSize = filters.pageSize || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedResults = results.slice(startIndex, endIndex)
    const hasMore = endIndex < total

    debug.log(`✅ Found ${total} trips, returning page ${page}/${Math.ceil(total / pageSize)}`)

    return {
      trips: paginatedResults,
      total,
      page,
      pageSize,
      hasMore,
    }
  }

  /**
   * Busca com debounce para input em tempo real
   */
  public searchDebounced(
    trips: Trip[],
    filters: SearchFilters,
    callback: (results: SearchResult) => void,
    delay: number = 300
  ): void {
    const key = JSON.stringify(filters)

    // Limpar timer anterior
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!)
    }

    // Executar com delay
    const timer = setTimeout(() => {
      const results = this.search(trips, filters)
      callback(results)
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  /**
   * Obtém sugestões de busca
   */
  public getSuggestions(query: string, trips: Trip[]): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const normalizedQuery = query.toLowerCase().trim()

    if (!normalizedQuery) {
      // Retornar buscas recentes
      return Array.from(this.recentSearches)
        .slice(0, 5)
        .map((search) => ({
          type: 'recent' as const,
          text: search,
          icon: '🕐',
        }))
    }

    // Sugestões de destinos
    const destinations = new Set<string>()
    trips.forEach((trip) => {
      if (trip.destination.toLowerCase().includes(normalizedQuery)) {
        destinations.add(trip.destination)
      }
    })

    suggestions.push(
      ...Array.from(destinations)
        .slice(0, 5)
        .map((dest) => ({
          type: 'destination' as const,
          text: dest,
          icon: '📍',
        }))
    )

    return suggestions
  }

  /**
   * Adiciona busca ao histórico
   */
  public addToRecentSearches(query: string): void {
    if (query.trim()) {
      this.recentSearches.add(query)
      if (this.recentSearches.size > 10) {
        const first = this.recentSearches.values().next().value
        if (first) {
          this.recentSearches.delete(first)
        }
      }
      this.saveRecentSearches()
    }
  }

  /**
   * Limpa histórico de buscas
   */
  public clearRecentSearches(): void {
    this.recentSearches.clear()
    localStorage.removeItem('recentSearches')
  }

  /**
   * Getter para buscas recentes
   */
  public getRecentSearches(): string[] {
    return Array.from(this.recentSearches)
  }

  // Private methods

  private matchesQuery(trip: Trip, query: string): boolean {
    // Buscar em destino
    if (trip.destination.toLowerCase().includes(query)) return true

    // Buscar em descrição
    if (trip.description?.toLowerCase().includes(query)) return true

    // Buscar em tags
    if (trip.tags?.some((tag) => tag.toLowerCase().includes(query))) return true

    return false
  }

  private sortResults(trips: Trip[], sortBy: string, sortOrder: string): Trip[] {
    const sorted = [...trips]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'destination':
          comparison = a.destination.localeCompare(b.destination)
          break
        case 'date':
        default:
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }

  private saveRecentSearches(): void {
    localStorage.setItem('recentSearches', JSON.stringify(Array.from(this.recentSearches)))
  }

  private loadRecentSearches(): void {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        this.recentSearches = new Set(JSON.parse(stored))
      } catch (error) {
        debug.error('Error loading recent searches:', error)
      }
    }
  }
}

// Exportar singleton
export const searchService = new SearchService()
