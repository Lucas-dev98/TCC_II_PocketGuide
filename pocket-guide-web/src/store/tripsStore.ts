/**
 * Zustand Store - Trips Management (Web version)
 * Persistência centralizada via backend API (PostgreSQL)
 *
 * IMPORTANTE: Trips NÃO são persistidas em localStorage
 * Elas SEMPRE devem vir da API para manter sincronização com o Postgres
 */

import { create } from 'zustand';
import { Trip } from '../types';
import {
  createTripInBackend,
  deleteTripInBackend,
  isBackendApiEnabled,
  listTripsFromBackend,
  mapBackendErrorToUserMessage,
} from '../services/backendApi';
import { debug } from '../utils/debug';

const USE_BACKEND_API = isBackendApiEnabled();

interface TripsStoreState {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  lastLoadTime: number | null;

  // Operations
  loadTrips: (userId: string) => Promise<void>;
  addTrip: (tripData: Partial<Trip>) => Promise<string>;
  deleteTrip: (tripId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAllTrips: () => void;
}

/**
 * useTripsStore Hook - State management para viagens
 * 
 * Trips NÃO são persistidas em localStorage - sempre vêm da API backend
 * 
 * Exemplo de uso:
 * const { trips, loadTrips, addTrip } = useTripsStore();
 */
export const useTripsStore = create<TripsStoreState>((set) => ({
  trips: [],
  isLoading: false,
  error: null,
  lastLoadTime: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  clearAllTrips: () => {
    debug.log('🗑️ Clearing all trips from store');
    set({ trips: [], error: null });
  },

  /**
   * Carregar viagens do backend
   */
  loadTrips: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!USE_BACKEND_API) {
        throw new Error('Backend API is required in production. Configure VITE_BACKEND_URL.');
      }
      debug.log('📚 tripsStore.loadTrips: loading from backend for user:', userId);
      const trips = await listTripsFromBackend();

      set({ 
        trips,
        lastLoadTime: Date.now(),
        error: null,
      });

      debug.log('📚 tripsStore.loadTrips: loaded', trips.length, 'trip(s)');
    } catch (error) {
      console.error('❌ Erro ao carregar viagens:', error);
      const errorMsg = mapBackendErrorToUserMessage(error);
      console.error('❌ Error details:', {
        message: errorMsg,
        code: (error as any)?.code,
        originalError: error,
      });
      set({
        error: errorMsg,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Adicionar nova viagem
   */
  addTrip: async (tripData: Partial<Trip>) => {
    try {
      set({ isLoading: true, error: null });

      if (!USE_BACKEND_API) {
        throw new Error('Backend API is required in production. Configure VITE_BACKEND_URL.');
      }
      const created = await createTripInBackend(tripData);
      set((state) => ({
        trips: [...state.trips, created],
        lastLoadTime: Date.now(),
      }));
      return created.id;
    } catch (error) {
      console.error('❌ Erro ao criar viagem:', error);
      const errorMessage = mapBackendErrorToUserMessage(error);
      console.error('❌ Error message:', errorMessage);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Deletar viagem
   */
  deleteTrip: async (tripId: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!USE_BACKEND_API) {
        throw new Error('Backend API is required in production. Configure VITE_BACKEND_URL.');
      }

      await deleteTripInBackend(tripId);

      const updatedTrips = useTripsStore.getState().trips.filter((t: Trip) => t.id !== tripId);

      set({ 
        trips: updatedTrips,
        lastLoadTime: Date.now(),
      });

    } catch (error) {
      console.error('❌ FATAL ERROR deleting trip:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao deletar viagem',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
