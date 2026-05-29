import React from 'react';
import { MapPin, Clock, Navigation, X, Car, Footprints, Bike } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { Card } from './Card';
import { DirectionRoute } from '../services/directionsService';

type RouteProfile = 'driving' | 'walking' | 'cycling';

interface RouteSummaryProps {
  route: DirectionRoute | null;
  origin?: string;
  destination?: string;
  isLoading?: boolean;
  selectedProfile?: RouteProfile;
  onProfileChange?: (profile: RouteProfile) => void;
  onClose: () => void;
}

/**
 * Componente para exibir resumo da rota calculada
 * Mostra distância, duração e instruções de navegação
 */
export const RouteSummary: React.FC<RouteSummaryProps> = ({
  route,
  origin,
  destination,
  isLoading = false,
  selectedProfile = 'driving',
  onProfileChange,
  onClose,
}) => {
  const { t } = useI18n();

  if (!route && !isLoading) return null;

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km.toFixed(2);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <Card className="relative mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
        aria-label={t('common.close')}
      >
        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('navigation.route') || 'Rota'}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            {t('common.loading')}
          </span>
        </div>
      ) : route ? (
        <div className="space-y-4">
          <div className="pt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Modo de deslocamento</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onProfileChange?.('walking')}
                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium border transition ${selectedProfile === 'walking'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
              >
                <Footprints className="w-3 h-3" />
                A pe
              </button>
              <button
                type="button"
                onClick={() => onProfileChange?.('driving')}
                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium border transition ${selectedProfile === 'driving'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
              >
                <Car className="w-3 h-3" />
                Carro
              </button>
              <button
                type="button"
                onClick={() => onProfileChange?.('cycling')}
                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium border transition ${selectedProfile === 'cycling'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
              >
                <Bike className="w-3 h-3" />
                Bike
              </button>
            </div>
          </div>

          {/* Origem e Destino */}
          {(origin || destination) && (
            <div className="space-y-2 text-sm">
              {origin && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Saída</p>
                    <p className="font-medium text-slate-900 dark:text-white">{origin}</p>
                  </div>
                </div>
              )}
              {destination && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Destino</p>
                    <p className="font-medium text-slate-900 dark:text-white">{destination}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Métricas: Distância e Duração */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {t('navigation.distance') || 'Distância'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatDistance(route.distance)} km
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {t('navigation.duration') || 'Duração'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatDuration(route.duration)}
              </p>
            </div>
          </div>

          {/* Instruções de Navegação (opcional) */}
          {route.legs && route.legs.length > 0 && (
            <details className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                {t('navigation.steps') || 'Instruções de Navegação'} ({route.legs.length} etapas)
              </summary>
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {route.legs.map((leg, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-white dark:bg-slate-700 rounded border border-blue-100 dark:border-blue-800"
                  >
                    <p className="text-slate-900 dark:text-white">
                      <strong>Etapa {idx + 1}:</strong> {leg.summary || `${formatDistance(leg.distance)} km`}
                    </p>
                    {leg.steps && leg.steps.length > 0 && (
                      <ul className="mt-1 ml-2 text-slate-600 dark:text-slate-400 space-y-1">
                        {leg.steps.slice(0, 3).map((step, stepIdx) => (
                          <li key={stepIdx} className="list-disc">
                            {step.name}
                            {step.maneuver?.instruction && ` - ${step.maneuver.instruction}`}
                          </li>
                        ))}
                        {leg.steps.length > 3 && (
                          <li className="text-slate-500 dark:text-slate-500 italic">
                            +{leg.steps.length - 3} mais instruções...
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : null}
    </Card>
  );
};
