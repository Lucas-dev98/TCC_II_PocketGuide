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
        // Log inicial com dados brutos
        console.log('🧭 useNavigation.calculateRoute START:', {
          origin: {
            name: origin.name,
            location: origin.location,
            raw: JSON.stringify(origin.location),
          },
          destination: {
            name: destination.name,
            location: destination.location,
            raw: JSON.stringify(destination.location),
          },
          profile,
        });

        // Validar coordenadas com logs detalhados
        console.log('🧭 Validating origin coordinates:', {
          lat: origin.location?.lat,
          lat_type: typeof origin.location?.lat,
          lng: origin.location?.lng,
          lng_type: typeof origin.location?.lng,
        });

        console.log('🧭 Validating destination coordinates:', {
          lat: destination.location?.lat,
          lat_type: typeof destination.location?.lat,
          lng: destination.location?.lng,
          lng_type: typeof destination.location?.lng,
        });

        const originValid = 
          typeof origin.location?.lat === 'number' && 
          typeof origin.location?.lng === 'number' &&
          origin.location.lat !== 0 &&
          origin.location.lng !== 0 &&
          origin.location.lat >= -90 && 
          origin.location.lat <= 90 &&
          origin.location.lng >= -180 && 
          origin.location.lng <= 180;

        const destinationValid = 
          typeof destination.location?.lat === 'number' && 
          typeof destination.location?.lng === 'number' &&
          destination.location.lat !== 0 &&
          destination.location.lng !== 0 &&
          destination.location.lat >= -90 && 
          destination.location.lat <= 90 &&
          destination.location.lng >= -180 && 
          destination.location.lng <= 180;

        console.log('🧭 Validation results:', {
          originValid,
          destinationValid,
        });

        if (!originValid || !destinationValid) {
          const missingOrigin = !originValid ? 'origem' : '';
          const missingDestination = !destinationValid ? 'destino' : '';
          throw new Error(`Coordenadas inválidas para ${missingOrigin}${missingOrigin && missingDestination ? ' e ' : ''}${missingDestination}`);
        }

        setOriginAndDestination(origin, destination);
        setLoadingRoute(true);
        setRouteError(null);

        // Chamar serviço de direções
        const quickProfile = profile === 'driving-traffic' ? 'driving' : profile;
        
        console.log('🧭 Calling directionsService.getQuickRoute:', {
          origin: { lat: origin.location.lat, lng: origin.location.lng },
          destination: { lat: destination.location.lat, lng: destination.location.lng },
          profile: quickProfile,
        });

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

        if (!route.routes || route.routes.length === 0) {
          throw new Error('Nenhuma rota encontrada');
        }

        const firstRoute = route.routes[0];
        setCurrentRoute(firstRoute);
        setRouteSummaryOpen(true);

        console.log('✅ useNavigation: Rota calculada com sucesso', {
          distance: firstRoute.distance,
          duration: firstRoute.duration,
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
