/**
 * FavoritesScreen
 * 
 * Tela que exibe todas as viagens marcadas como favorito
 * com opções de filtro, ordenação e remoção
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trip } from '../types'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { FavoriteButton } from '../components/FavoriteButton'
import { useFavorites } from '../hooks/useFavorites'
import { debug } from '../utils/debug'

interface FavoritesScreenProps {
  trips: Trip[]
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
type ViewMode = 'grid' | 'list'

export default function FavoritesScreen({ trips }: FavoritesScreenProps) {
  const navigate = useNavigate()
  const { favorites, clearFavorites } = useFavorites()
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  /**
   * Filtra trips favoritados
   */
  const favoritedTrips = trips.filter((trip) => favorites.includes(trip.id))

  /**
   * Ordena trips
   */
  const sortedTrips = [...favoritedTrips].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      case 'date-asc':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      case 'name-asc':
        return a.destination.localeCompare(b.destination)
      case 'name-desc':
        return b.destination.localeCompare(a.destination)
      default:
        return 0
    }
  })

  /**
   * Navega para detalhe da viagem
   */
  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`)
  }

  /**
   * Limpa todos os favoritos
   */
  const handleClearAll = () => {
    clearFavorites()
    setShowClearConfirm(false)
    debug.log('✨ All favorites cleared')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Voltar</span>
          </button>

          {/* Title & Description */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Favoritos</h1>
              {favoritedTrips.length > 0 && (
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-full">
                  {favoritedTrips.length}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {favoritedTrips.length === 0
                ? 'Você ainda não tem viagens favoritas'
                : `Você tem ${favoritedTrips.length} viagem${favoritedTrips.length !== 1 ? 's' : ''} favoritada${favoritedTrips.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Controls */}
          {favoritedTrips.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="date-desc">Mais recentes</option>
                <option value="date-asc">Mais antigas</option>
                <option value="name-asc">Destino (A-Z)</option>
                <option value="name-desc">Destino (Z-A)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Visualização em grade"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title="Visualização em lista"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 11 0 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 11 0 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 11 0 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 11 0 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Clear All Button */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="ml-auto px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid View */}
        {viewMode === 'grid' && sortedTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip) => (
              <Card key={trip.id}>
                {/* Header */}
                <div className="relative mb-4">
                  {trip.imageUrl && (
                    <img
                      src={trip.imageUrl}
                      alt={trip.destination}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}

                  {/* Favorite Button */}
                  <div className="absolute top-2 right-2">
                    <FavoriteButton tripId={trip.id} size="md" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {trip.destination}
                  </h3>
                  {trip.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
                      <span className="text-gray-500 dark:text-gray-400">Orçamento:</span>
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
                <button
                  onClick={() => handleTripClick(trip.id)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Ver Detalhes
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && sortedTrips.length > 0 && (
          <div className="space-y-3">
            {sortedTrips.map((trip) => (
              <Card key={trip.id}>
                <div className="flex items-center gap-4">
                  {/* Image */}
                  {trip.imageUrl && (
                    <img
                      src={trip.imageUrl}
                      alt={trip.destination}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {trip.destination}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                        {trip.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {new Date(trip.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                      </span>
                      {trip.budget && <span className="capitalize">{trip.budget}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <FavoriteButton tripId={trip.id} size="md" />
                    <button
                      onClick={() => handleTripClick(trip.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedTrips.length === 0 && (
          <EmptyState
            icon="💔"
            title="Nenhum favorito ainda"
            description="Adicione viagens aos seus favoritos para encontrá-las facilmente depois!"
          />
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Limpar todos os favoritos?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja remover todas as viagens dos favoritos? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
