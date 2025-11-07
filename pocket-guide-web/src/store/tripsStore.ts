/**
 * Zustand Store - Trips Management (Web version)
 * Simplificado para React Web com Firestore
 * 
 * IMPORTANTE: Trips NÃO são persistidas em localStorage
 * Elas SEMPRE devem vir do Firestore para manter sincronização
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
 * Trips NÃO são persistidas em localStorage - sempre vêm do Firestore
 * 
 * Exemplo de uso:
 * const { trips, loadTrips, addTrip } = useTripsStore();
 */
export const useTripsStore = create<TripsStoreState>((set) => ({
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

      console.log('📚 tripsStore.loadTrips: Found', snapshot.size, 'trips');

      snapshot.forEach((doc) => {
        const tripData = {
          id: doc.id,
          ...doc.data(),
        } as Trip;
        console.log('📚 tripsStore.loadTrips: Trip:', tripData);
        trips.push(tripData);
      });

      console.log('📚 tripsStore.loadTrips: Setting trips:', trips);
      set({ trips });
    } catch (error) {
      console.error('❌ Erro ao carregar viagens:', error);
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
  addTrip: async (tripData: Partial<Trip>) => {
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

      // Delete from Firestore first
      await deleteDoc(doc(db, 'trips', tripId));

      // Update the local state immediately
      set((state) => {
        const updatedTrips = state.trips.filter((t: Trip) => t.id !== tripId);
        console.log('✅ Trip deleted from Firestore:', tripId);
        console.log('📊 Remaining trips:', updatedTrips.length);
        return { trips: updatedTrips };
      });

      // Small delay to ensure Firestore has fully processed the deletion
      await new Promise(resolve => setTimeout(resolve, 500));
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
