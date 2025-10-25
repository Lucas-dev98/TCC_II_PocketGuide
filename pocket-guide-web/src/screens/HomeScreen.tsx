import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTripsStore } from '../store/tripsStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Plus, MapPin, Calendar, Trash2, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/formatDate';

/**
 * HomeScreen - Listagem de viagens do usuário
 * 
 * Fluxo:
 * 1. Carregar viagens do Zustand store
 * 2. Exibir lista de cards com viagens
 * 3. Botão para criar nova viagem
 * 4. Clique no card → TripDetailScreen
 * 5. Botão delete → remover viagem
 * 6. Logout → volta para LoginScreen
 */
export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { trips, loadTrips, deleteTrip, isLoading } = useTripsStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Carregar viagens ao montar
  useEffect(() => {
    if (user?.uid) {
      console.log('🏠 HomeScreen: Loading trips for user:', user.uid);
      loadTrips(user.uid);
    }
  }, [user?.uid, loadTrips]);

  console.log('🏠 HomeScreen: Current trips:', trips);
  console.log('🏠 HomeScreen: isLoading:', isLoading);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleCreateTrip = () => {
    navigate('/create-trip');
  };

  const handleViewTrip = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta viagem?')) {
      return;
    }

    try {
      setDeleting(tripId);
      await deleteTrip(tripId);
    } catch (error) {
      console.error('Erro ao deletar viagem:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Minhas Viagens
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Bem-vindo, {user?.displayName || 'Viajante'}! ✈️
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

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

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && trips.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Nenhuma viagem criada
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Crie sua primeira viagem e deixe a IA fazer a mágica! ✨
            </p>
            <Button onClick={handleCreateTrip} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Viagem
            </Button>
          </div>
        )}

        {/* Trips grid */}
        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="hover:shadow-lg transition cursor-pointer overflow-hidden group"
                onClick={() => handleViewTrip(trip.id)}
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
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {trip.destination}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {trip.country}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </span>
                  </div>

                  {/* Duration */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias de aventura
                  </p>

                  {/* Tags */}
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.interests.slice(0, 2).map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                      {trip.interests.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                          +{trip.interests.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrip(trip.id);
                    }}
                    disabled={deleting === trip.id}
                    className="w-full py-2 px-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      {deleting === trip.id ? 'Deletando...' : 'Deletar'}
                    </div>
                  </button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
