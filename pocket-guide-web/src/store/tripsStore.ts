/**
 * Zustand Store - Trips Management (Web version)
 * Simplificado para React Web com Firestore
 * Com persistência em localStorage para manter dados mesmo após recarregar
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
 * Os dados de trips são persistidos no localStorage automaticamente
 * para que quando o usuário recarregar a página, os dados estejam disponíveis
 * enquanto o Firestore recarrega os dados atualizados
 * 
 * Exemplo de uso:
 * const { trips, loadTrips, addTrip } = useTripsStore();
 */
export const useTripsStore = create<TripsStoreState>()(
  persist(
    (set) => ({
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

          // Delete from Firestore first
          await deleteDoc(doc(db, 'trips', tripId));

          // Then update the local state immediately
          set((state) => {
            const updatedTrips = state.trips.filter((t) => t.id !== tripId);
            
            // Force sync to localStorage immediately
            const storageKey = 'trips-store';
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                state: { trips: updatedTrips },
                version: 0,
              })
            );
            
            console.log('✅ Trip deleted:', tripId, 'Remaining trips:', updatedTrips.length);
            
            return { trips: updatedTrips };
          });
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
    }),
    {
      name: 'trips-store', // Chave no localStorage
      partialize: (state) => ({
        // Persistir apenas os trips
        // Não persistir: isLoading, error (estado temporário)
        trips: state.trips,
      }),
    }
  )
);
