/**
 * Zustand Store - Trips Management (Web version)
 * Simplificado para React Web com Firestore
 */

import { create } from 'zustand';
import { Trip } from '../types';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../services/firebase';

interface TripsStoreState {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;

  // Operations
  loadTrips: (userId: string) => Promise<void>;
  addTrip: (tripData: Partial<Trip>) => Promise<string>;
  deleteTrip: (tripId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * useTripsStore Hook - State management para viagens
 * 
 * Exemplo de uso:
 * const { trips, loadTrips, addTrip } = useTripsStore();
 */
export const useTripsStore = create<TripsStoreState>((set, get) => ({
  trips: [],
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  /**
   * Carregar viagens do Firestore
   */
  loadTrips: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const trips: Trip[] = [];

      snapshot.forEach((doc) => {
        trips.push({
          id: doc.id,
          ...doc.data(),
        } as Trip);
      });

      set({ trips });
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao carregar viagens',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Adicionar nova viagem
   */
  addTrip: async (tripData) => {
    try {
      set({ isLoading: true, error: null });

      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      const newTrip: Trip = {
        id: docRef.id,
        ...tripData,
        createdAt: new Date().toISOString(),
      } as Trip;

      set((state) => ({
        trips: [...state.trips, newTrip],
      }));

      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao criar viagem';
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

      await deleteDoc(doc(db, 'trips', tripId));

      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
      }));
    } catch (error) {
      console.error('Erro ao deletar viagem:', error);
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
