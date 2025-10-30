/**
 * Zustand Store - Route Navigation Management
 * Gerencia o estado das rotas e navegação entre atrações
 * Persiste dados no localStorage para manter estado após recarregar
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attraction } from '../types';
import { DirectionRoute } from '../services/directionsService';

interface RouteState {
  // Estado da rota atual
  currentRoute: DirectionRoute | null;
  currentOrigin: Attraction | null;
  currentDestination: Attraction | null;
  
  // Dados de navegação
  routingProfile: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  
  // Estado de UI
  isLoadingRoute: boolean;
  routeError: string | null;
  isRouteSummaryOpen: boolean;

  // Actions
  setCurrentRoute: (route: DirectionRoute | null) => void;
  setOriginAndDestination: (origin: Attraction | null, destination: Attraction | null) => void;
  setRoutingProfile: (profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic') => void;
  setLoadingRoute: (loading: boolean) => void;
  setRouteError: (error: string | null) => void;
  setRouteSummaryOpen: (open: boolean) => void;
  clearRoute: () => void;
}

/**
 * useRouteStore Hook - State management para navegação e rotas
 * 
 * Os dados são automaticamente persistidos no localStorage com a chave 'route-store'
 * Isso permite que rotas calculadas sejam recuperadas após recarregar a página
 * 
 * Exemplo de uso:
 * const { currentRoute, setCurrentRoute, setLoadingRoute } = useRouteStore();
 */
export const useRouteStore = create<RouteState>()(
  persist(
    (set) => ({
      currentRoute: null,
      currentOrigin: null,
      currentDestination: null,
      routingProfile: 'driving',
      isLoadingRoute: false,
      routeError: null,
      isRouteSummaryOpen: false,

      setCurrentRoute: (route) => {
        set({ currentRoute: route, routeError: null });
      },

      setOriginAndDestination: (origin, destination) => {
        set({
          currentOrigin: origin,
          currentDestination: destination,
          currentRoute: null, // Reset route when destinations change
          routeError: null,
        });
      },

      setRoutingProfile: (profile) => {
        set({ routingProfile: profile, currentRoute: null });
      },

      setLoadingRoute: (loading) => {
        set({ isLoadingRoute: loading });
      },

      setRouteError: (error) => {
        set({ routeError: error });
      },

      setRouteSummaryOpen: (open) => {
        set({ isRouteSummaryOpen: open });
      },

      clearRoute: () => {
        set({
          currentRoute: null,
          currentOrigin: null,
          currentDestination: null,
          routeError: null,
          isRouteSummaryOpen: false,
        });
      },
    }),
    {
      name: 'route-store', // Nome da chave no localStorage
      partialize: (state) => ({
        // Persistir apenas dados importantes (não estado de loading/UI temporário)
        currentRoute: state.currentRoute,
        currentOrigin: state.currentOrigin,
        currentDestination: state.currentDestination,
        routingProfile: state.routingProfile,
        isRouteSummaryOpen: state.isRouteSummaryOpen,
        // Não persistir: isLoadingRoute, routeError (estado temporário)
      }),
    }
  )
);
