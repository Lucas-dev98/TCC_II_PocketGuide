/**
 * SharedTripView.tsx - Visualização de viagem compartilhada
 * 
 * Exibe viagem compartilhada por outro usuário com:
 * - Informações do compartilhador
 * - Dados completos da viagem
 * - Opção de favoritar
 * - Info sobre permissões
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Lock,
  Eye as EyeIcon,
  Heart,
} from 'lucide-react'
import { Trip, Attraction } from '../types'
import { sharingService, SharedTripData } from '../services/sharingService'
import { useFavorites } from '../hooks/useFavorites'
import { LoadingSpinner } from './LoadingSpinner'

export const SharedTripView = () => {
  const navigate = useNavigate()
  const { shareId } = useParams<{ shareId: string }>()
  
  const [sharedData, setSharedData] = useState<SharedTripData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  useEffect(() => {
    if (!shareId) {
      setError('Link de compartilhamento inválido')
      setLoading(false)
      return
    }

    // Validar compartilhamento
    if (!sharingService.isShareValid(shareId)) {
      setError('Este link de compartilhamento expirou ou é inválido')
      setLoading(false)
      return
    }

    // Recuperar dados da viagem compartilhada
    const data = sharingService.getSharedTrip(shareId)
    
    if (!data) {
      setError('Não foi possível encontrar a viagem compartilhada')
      setLoading(false)
      return
    }

    setSharedData(data)
    setLoading(false)
  }, [shareId])

  const handleFavoriteToggle = (trip: Trip) => {
    if (isFavorite(trip.id)) {
      removeFavorite(trip.id)
    } else {
      addFavorite(trip.id)
    }
  }

  // Group attractions by day
  const attractionsByDay = (attractions?: Attraction[]) => {
    if (!attractions) return {}
    
    const grouped: { [key: number]: Attraction[] } = {}
    attractions.forEach(attraction => {
      if (!grouped[attraction.day]) {
        grouped[attraction.day] = []
      }
      grouped[attraction.day].push(attraction)
    })
    
    return grouped
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <button
          onClick={() => navigate('/home')}
          className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
          <p className="text-amber-900 dark:text-amber-100">
            <strong>Viagem indisponível</strong>
          </p>
          <p className="text-amber-800 dark:text-amber-200 mt-2">
            {error || 'Não foi possível carregar a viagem compartilhada'}
          </p>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  const { trip, sharedBy, permission, sharedAt } = sharedData
  const isFav = isFavorite(trip.id)
  const grouped = attractionsByDay(trip.attractions)
  const days = Object.keys(grouped).sort((a, b) => parseInt(a) - parseInt(b))

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          {/* Share info */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Compartilhado por
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {sharedBy.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {sharedBy.email}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Compartilhado em
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {new Date(sharedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Permission badge */}
            <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full w-fit">
              {permission === 'view' ? (
                <>
                  <EyeIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Visualização
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Permissão total
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Trip Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {trip.destination}
              </h1>
              {trip.description && (
                <p className="text-slate-600 dark:text-slate-400">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={() => handleFavoriteToggle(trip)}
              className={`
                p-3 rounded-lg transition-colors flex-shrink-0
                ${isFav
                  ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
              title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                className="w-6 h-6"
                fill={isFav ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Trip info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {trip.startDate && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Data</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {trip.attractions && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Duração</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {days.length} dia{days.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {trip.budget && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Orçamento</span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {trip.budget}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Days */}
        {days.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Itinerário
            </h2>

            {days.map((dayStr) => {
              const dayNumber = parseInt(dayStr)
              const dayAttractions = grouped[dayNumber] || []

              return (
                <div
                  key={dayNumber}
                  className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Dia {dayNumber}
                  </h3>

                  {dayAttractions.length > 0 ? (
                    <ul className="space-y-2">
                      {dayAttractions.map((attraction: Attraction, attIndex: number) => (
                        <li
                          key={attIndex}
                          className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex flex-col gap-0.5 flex-shrink-0">
                            <MapPin className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{attraction.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {attraction.time} • {attraction.duration} min
                            </p>
                            {attraction.tip && (
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                💡 {attraction.tip}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 italic">
                      Sem atrações neste dia
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              Esta viagem ainda não possui itinerário
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
