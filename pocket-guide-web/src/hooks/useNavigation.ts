/**
 * Hook para gerenciar navegação e cálculo de rotas
 * Integra directionsService com routeStore
 */

import { useCallback } from 'react';
import { Attraction } from '../types';
import { directionsService, DirectionRoute } from '../services/directionsService';
import { useRouteStore } from '../store/routeStore';

export interface UseNavigationReturn {
  calculateRoute: (
    origin: Attraction,
    destination: Attraction,
    profile?: 'driving' | 'walking' | 'cycling' | 'driving-traffic'
  ) => Promise<void>;
  clearRoute: () => void;
  currentRoute: DirectionRoute | null;
  isLoadingRoute: boolean;
  routeError: string | null;
  currentOrigin: Attraction | null;
  currentDestination: Attraction | null;
  routingProfile: string;
}

/**
 * Hook useNavigation - Gerencia cálculo e exibição de rotas
 */
export const useNavigation = (): UseNavigationReturn => {
  const {
    currentRoute,
    currentOrigin,
    currentDestination,
    isLoadingRoute,
    routeError,
    routingProfile,
    setCurrentRoute,
    setOriginAndDestination,
    setLoadingRoute,
    setRouteError,
    setRouteSummaryOpen,
    clearRoute: clearRouteStore,
  } = useRouteStore();

  /**
   * Calcula rota entre duas atrações
   */
  const calculateRoute = useCallback(
    async (
      origin: Attraction,
      destination: Attraction,
      profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic' = 'driving'
    ) => {
      try {
        // Validar coordenadas
        if (
          !origin.location?.lat ||
          !origin.location?.lng ||
          !destination.location?.lat ||
          !destination.location?.lng
        ) {
          throw new Error('Coordenadas inválidas para origem ou destino');
        }

        setOriginAndDestination(origin, destination);
        setLoadingRoute(true);
        setRouteError(null);

        console.log('🧭 useNavigation: Calculando rota', {
          origin: origin.name,
          destination: destination.name,
          profile,
        });

        // Chamar serviço de direções
        const quickProfile = profile === 'driving-traffic' ? 'driving' : profile;
        const route = await directionsService.getQuickRoute(
          {
            latitude: origin.location.lat,
            longitude: origin.location.lng,
          },
          {
            latitude: destination.location.lat,
            longitude: destination.location.lng,
          },
          quickProfile
        );

        setCurrentRoute(route);
        setRouteSummaryOpen(true);

        console.log('✅ useNavigation: Rota calculada com sucesso', {
          distance: route.distance,
          duration: route.duration,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao calcular rota';
        console.error('❌ useNavigation: Erro ao calcular rota:', errorMessage);
        setRouteError(errorMessage);
      } finally {
        setLoadingRoute(false);
      }
    },
    [
      setOriginAndDestination,
      setLoadingRoute,
      setRouteError,
      setCurrentRoute,
      setRouteSummaryOpen,
    ]
  );

  /**
   * Limpar rota atual
   */
  const clearRoute = useCallback(() => {
    clearRouteStore();
  }, [clearRouteStore]);

  return {
    calculateRoute,
    clearRoute,
    currentRoute,
    isLoadingRoute,
    routeError,
    currentOrigin,
    currentDestination,
    routingProfile,
  };
};

export default useNavigation;
