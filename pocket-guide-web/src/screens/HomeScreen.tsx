import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { FavoriteButton } from '../components/FavoriteButton'
import { CreateTripCTA } from '../components/CreateTripCTA'
import { MainLayout } from '../components/Layout'
import { SkeletonCard } from '../components/Skeleton'
import useI18n from '../hooks/useI18n'
import { MapPin, Calendar, Trash2, X, CheckCircle2 } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import { debug } from '../utils/debug'

/**
 * HomeScreen - Listagem de viagens do usuário
 * 
 * Fluxo:
 * 1. Carregar viagens do Zustand store
 * 2. Exibir lista de cards com viagens (SkeletonCard durante loading)
 * 3. EmptyState quando não há viagens
 * 4. Botão para criar nova viagem
 * 5. Clique no card → TripDetailScreen
 * 6. Toast feedback para deleção
 * 7. Logout → volta para LoginScreen
 */
export default function HomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { trips, loadTrips, deleteTrip, isLoading } = useTripsStore()
  const { showError, showSuccess } = useToast()
  const { t } = useI18n()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  // Carregar viagens ao montar
  useEffect(() => {
    if (user?.uid) {
      debug.log('🏠 HomeScreen: Loading trips for user:', user.uid)
      loadTrips(user.uid)
    }
  }, [user?.uid, loadTrips])

  const handleViewTrip = (tripId: string) => {
    navigate(`/trip/${tripId}`)
  }

  const handleSelectTrip = (tripId: string) => {
    const newSelected = new Set(selectedTrips)
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId)
    } else {
      newSelected.add(tripId)
    }
    setSelectedTrips(newSelected)
    if (newSelected.size === 0) {
      setIsSelectMode(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedTrips.size === trips.length) {
      setSelectedTrips(new Set())
      setIsSelectMode(false)
    } else {
      setSelectedTrips(new Set(trips.map(t => t.id)))
      setIsSelectMode(true)
    }
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm(t('trips.deleteSelectedConfirm') || `Delete ${selectedTrips.size} trips?`)) {
      return
    }

    try {
      setIsDeleting(true)
      for (const tripId of selectedTrips) {
        await deleteTrip(tripId)
      }
      showSuccess(t('common.successDeleted'))
      setSelectedTrips(new Set())
      setIsSelectMode(false)
    } catch (error) {
      debug.error('Erro ao deletar viagens:', error)
      showError(t('errors.generic'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm(t('trips.deleteTripConfirm'))) {
      return
    }

    try {
      setDeleting(tripId)
      await deleteTrip(tripId)
      showSuccess(t('common.successDeleted'))
    } catch (error) {
      debug.error('Erro ao deletar viagem:', error)
      showError(t('errors.generic'))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
        {/* Mobile Header - Hidden on Desktop */}
        <div className="lg:hidden bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h1 className="text-h2 font-bold text-slate-900 dark:text-white">
              {t('trips.title')}
            </h1>
            <p className="text-small text-slate-600 dark:text-slate-300">
              {t('common.welcome')}, {user?.displayName || t('common.traveler')}! ✈️
            </p>
          </div>
        </div>

        {/* Desktop Header - Visible on Desktop */}
        <div className="hidden lg:block px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('trips.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t('common.welcome')}, {user?.displayName || t('common.traveler')}! ✈️
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-6">
          {/* Selection mode header */}
          {isSelectMode && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedTrips.size} {t('trips.tripsSelected') || 'trips selected'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedTrips(new Set())
                    setIsSelectMode(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  variant="danger"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? t('trips.deleting') : t('trips.delete')}
                </Button>
              </div>
            </div>
          )}

          {/* Botão criar nova viagem - CTA destacado */}
          <CreateTripCTA />

          {/* Botão Selecionar - Visible when not in select mode and trips exist */}
          {!isSelectMode && trips.length > 0 && !isLoading && (
            <div className="mb-6 flex justify-end">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('trips.select') || 'Select'}
              </Button>
            </div>
          )}

        {/* Loading state - Skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && trips.length === 0 && (
          <div role="status" aria-label={t('trips.emptyStateAriaLabel')}>
            <EmptyState
              icon={
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/30 mb-4" aria-hidden="true">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              }
              title={t('trips.noTrips')}
              description={t('trips.startPlanning')}
            />
          </div>
        )}

        {/* Trips grid */}
        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="relative">
                {/* Selection checkbox */}
                {isSelectMode && (
                  <div className="absolute top-3 left-3 z-20">
                    <input
                      type="checkbox"
                      checked={selectedTrips.has(trip.id)}
                      onChange={() => handleSelectTrip(trip.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-2 border-blue-500 text-blue-600 cursor-pointer accent-blue-600"
                      aria-label={`Select ${trip.destination}`}
                    />
                  </div>
                )}

                <Card
                  elevation="md"
                  isInteractive
                  onClick={() => {
                    if (isSelectMode) {
                      handleSelectTrip(trip.id)
                    } else {
                      handleViewTrip(trip.id)
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (!isSelectMode) {
                      setIsSelectMode(true)
                      handleSelectTrip(trip.id)
                    }
                  }}
                  className={`overflow-hidden group transition ${
                    isSelectMode && selectedTrips.has(trip.id)
                      ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                      : ''
                  }`}
                >
                {/* Imagem de preview */}
                {trip.imageUrl && (
                  <div className="h-40 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={trip.imageUrl}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}

                <Card.Body>
                  {/* Destination */}
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {trip.destination}
                      </h3>
                      <p className="text-small text-slate-600 dark:text-slate-300">
                        {trip.country}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-small text-slate-600 dark:text-slate-300 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>

                  {/* Duration */}
                  <p className="text-small text-slate-600 dark:text-slate-300 mb-4">
                    {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} {t('trips.daysOfAdventure')}
                  </p>

                  {/* Tags */}
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.interests.slice(0, 2).map((interest) => (
                        <span
                          key={interest}
                          className="badge-base bg-primary/20 dark:bg-primary/30 text-primary dark:text-blue-300 text-xs font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 2 && (
                        <span className="badge-base bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          +{trip.interests.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delete button */}
                  <div className="flex gap-2">
                    <FavoriteButton tripId={trip.id} size="md" />
                    {!isSelectMode && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTrip(trip.id)
                        }}
                        disabled={deleting === trip.id}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-danger border-danger hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting === trip.id ? t('trips.deleting') : t('trips.delete')}
                      </Button>
                    )}
                  </div>
                </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  )
}
