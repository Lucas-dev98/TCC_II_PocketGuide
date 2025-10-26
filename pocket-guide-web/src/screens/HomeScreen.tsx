import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTripsStore } from '../store/tripsStore'
import { useToast } from '../components/Toast'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { SkeletonCard } from '../components/Skeleton'
import { Plus, MapPin, Calendar, Trash2, LogOut } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
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
  const { user, signOut } = useAuth()
  const { trips, loadTrips, deleteTrip, isLoading } = useTripsStore()
  const { showError, showSuccess } = useToast()
  const [deleting, setDeleting] = useState<string | null>(null)

  // Carregar viagens ao montar
  useEffect(() => {
    if (user?.uid) {
      debug.log('🏠 HomeScreen: Loading trips for user:', user.uid)
      loadTrips(user.uid)
    }
  }, [user?.uid, loadTrips])

  debug.log('🏠 HomeScreen: Current trips:', trips)
  debug.log('🏠 HomeScreen: isLoading:', isLoading)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      debug.error('Erro ao fazer logout:', error)
      showError('Erro ao fazer logout')
    }
  }

  const handleCreateTrip = () => {
    navigate('/create-trip')
  }

  const handleViewTrip = (tripId: string) => {
    navigate(`/trip/${tripId}`)
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta viagem?')) {
      return
    }

    try {
      setDeleting(tripId)
      await deleteTrip(tripId)
      showSuccess('Viagem deletada com sucesso!')
    } catch (error) {
      debug.error('Erro ao deletar viagem:', error)
      showError('Erro ao deletar viagem. Tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-bold text-slate-900 dark:text-white">
              Minhas Viagens
            </h1>
            <p className="text-small text-slate-600 dark:text-slate-400">
              Bem-vindo, {user?.displayName || 'Viajante'}! ✈️
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle tema */}
            <ThemeToggle />

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Botão criar nova viagem */}
        <div className="mb-8">
          <Button
            onClick={handleCreateTrip}
            className="gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Nova Viagem
          </Button>
        </div>

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
          <div role="status" aria-label="Nenhuma viagem encontrada">
            <EmptyState
              icon={
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/30 mb-4" aria-hidden="true">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              }
              title="Nenhuma viagem criada"
              description="Crie sua primeira viagem e deixe a IA fazer a mágica! ✨"
              action={{
                label: 'Criar Primeira Viagem',
                onClick: handleCreateTrip,
              }}
            />
          </div>
        )}

        {/* Trips grid */}
        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                elevation="md"
                isInteractive
                onClick={() => handleViewTrip(trip.id)}
                className="overflow-hidden group"
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
                      <p className="text-small text-slate-500 dark:text-slate-400">
                        {trip.country}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-small text-slate-600 dark:text-slate-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>

                  {/* Duration */}
                  <p className="text-small text-slate-600 dark:text-slate-400 mb-4">
                    {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias de aventura
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
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTrip(trip.id)
                    }}
                    disabled={deleting === trip.id}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-danger border-danger hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting === trip.id ? 'Deletando...' : 'Deletar'}
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
