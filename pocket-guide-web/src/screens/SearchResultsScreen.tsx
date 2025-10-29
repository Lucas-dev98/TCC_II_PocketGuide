/**
 * SearchResultsScreen
 * 
 * Tela que exibe os resultados de busca
 * com paginação, ordenação e filtros
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTripsStore } from '../store/tripsStore'
import { AdvancedFilters } from '../components/AdvancedFilters'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { MainLayout } from '../components/Layout'
import { searchService, SearchFilters, SearchResult } from '../services/searchService'
import { debug } from '../utils/debug'
import useI18n from '../hooks/useI18n'

export default function SearchResultsScreen() {
  const navigate = useNavigate()
  const { trips } = useTripsStore()
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const queryParam = searchParams.get('q') || ''
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: queryParam,
    page: 1,
    pageSize: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [results, setResults] = useState<SearchResult>({
    trips: [],
    total: 0,
    page: 1,
    pageSize: 10,
    hasMore: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Sincroniza query do URL com filtros
   */
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: queryParam,
      page: 1,
    }))
  }, [queryParam])

  /**
   * Executa busca quando filtros mudam
   */
  useEffect(() => {
    performSearch()
  }, [filters])

  /**
   * Executa a busca
   */
  const performSearch = () => {
    setIsLoading(true)
    try {
      const searchResults = searchService.search(trips, filters)
      setResults(searchResults)
      debug.log(`Found ${searchResults.total} results`)
    } catch (error) {
      debug.error('Error performing search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Atualiza filtros
   */
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset para página 1 ao alterar filtros
    })
  }

  /**
   * Vai para página anterior
   */
  const handlePreviousPage = () => {
    if (results.page > 1) {
      setFilters({
        ...filters,
        page: results.page - 1,
      })
    }
  }

  /**
   * Vai para próxima página
   */
  const handleNextPage = () => {
    if (results.hasMore) {
      setFilters({
        ...filters,
        page: results.page + 1,
      })
    }
  }

  /**
   * Navega para detalhe da viagem
   */
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
        {/* Mobile Header - Hidden on Desktop */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <button
                onClick={() => navigate('/home')}
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>{t('search.backButton')}</span>
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('search.title')}</h1>

            {/* Filters */}
            <div className="flex gap-4 items-end">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApply={performSearch}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('search.title')}</h1>

            {/* Filters */}
            <div className="flex gap-4 items-end">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApply={performSearch}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Info */}
        {results.total > 0 && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-white">{results.total}</span>{' '}
              {t('search.tripsFound')}
              {filters.query && (
                <>
                  {' '}
                  {t('search.for')} <span className="font-semibold text-gray-900 dark:text-white">"{filters.query}"</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0119.8-4.3M22 5.5a10 10 0 01-19.8 4.2"
                  />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400">{t('search.searching')}</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.trips.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {results.trips.map((trip) => (
                <Card
                  key={trip.id}
                  onClick={() => handleTripClick(trip.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Trip Header */}
                  <div className="mb-4">
                    {trip.imageUrl && (
                      <img
                        src={trip.imageUrl}
                        alt={trip.destination}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {trip.destination}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Trip Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(trip.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {trip.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Orçamento:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            trip.budget === 'luxo'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                              : trip.budget === 'médio'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}
                        >
                          {trip.budget}
                        </span>
                      </div>
                    )}

                    {trip.tags && trip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trip.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {trip.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            +{trip.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Ver Detalhes
                  </button>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {results.total > results.pageSize && (
              <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {t('search.page')} {results.page} {t('search.of')} {Math.ceil(results.total / results.pageSize)} • {t('search.showing')}{' '}
                  {results.trips.length} {t('search.of')} {results.total} {t('search.results')}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={results.page === 1}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-300 dark:hover:enabled:bg-gray-600 transition-colors"
                  >
                    {t('search.previous')}
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!results.hasMore}
                    className="px-4 py-2 bg-blue-600 hover:enabled:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('search.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && results.trips.length === 0 && trips.length > 0 && (
          <EmptyState
            icon="🔍"
            title={t('search.noTripsFound')}
            description={
              filters.query
                ? `${t('search.noTripsFound')} "${filters.query}". ${t('search.tryDifferentSearch')}`
                : t('search.adjustFilters')
            }
          />
        )}

        {/* No Trips State */}
        {!isLoading && trips.length === 0 && (
          <EmptyState
            icon="✈️"
            title={t('search.noTripsCreated')}
            description={t('search.startCreating')}
          />
        )}
      </div>
    </div>
    </MainLayout>
  )
}
