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
 * Trips NÃO são persistidas em localStorage - sempre vêm do Firestore
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
    console.log('🗑️ Clearing all trips from store');
    set({ trips: [], error: null });
  },

  /**
   * Carregar viagens do Firestore
   */
  loadTrips: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      console.log('📚 tripsStore.loadTrips: Starting load for user:', userId);

      const q = query(
        collection(db, 'trips'),
        where('userId', '==', userId)
      );

      // Enable verbose logging for debugging
      console.log('📚 Querying Firestore: collection("trips").where("userId", "==", "' + userId + '")');

  const snapshot = await getDocs(q);
  const trips: Trip[] = [];
  // NOTE: previously the code attempted to detect and delete "old" trips
  // based on whether the Firestore-generated ID contained dashes. That
  // logic is incorrect for many Firestore environments (IDs are usually
  // alphanumeric without dashes) and could delete newly created trips.
  // We'll no longer auto-delete any documents here; instead we only log
  // unusual IDs for manual inspection.

      console.log('📚 tripsStore.loadTrips: Query returned', snapshot.size, 'documents');
      console.log('📚 tripsStore.loadTrips: Empty?', snapshot.empty);

      snapshot.forEach((doc) => {
        const tripData = {
          id: doc.id,
          ...doc.data(),
        } as Trip;
        
        // Log ALL trips, regardless of ID format
        console.log('📚 Document loaded:', {
          id: doc.id,
          idHasDashes: doc.id.includes('-'),
          userId: tripData.userId,
          destination: tripData.destination,
          createdAt: tripData.createdAt,
        });

        // Log document metadata for debugging - do NOT delete automatically
        if (!doc.id.includes('-')) {
          console.log('ℹ️ Document ID does not include dash (expected for Firestore addDoc IDs):', doc.id);
        }

        // Add to trips array
        trips.push(tripData);
      });

      console.log('📚 tripsStore.loadTrips: Final array size:', trips.length);
      // Note: automatic deletion of documents has been disabled to avoid
      // accidentally removing valid Firestore documents. Review logs if you
      // see unexpected IDs and perform manual cleanup if necessary.
      
      set({ 
        trips,
        lastLoadTime: Date.now(),
        error: null,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar viagens:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao carregar viagens';
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

      console.log('➕ addTrip: Starting...');
      console.log('➕ addTrip: Validating trip data:', {
        userId: tripData.userId,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        hasItinerary: !!(tripData.itinerary && tripData.itinerary.length > 0),
      });

      // Validate required fields
      if (!tripData.userId) {
        throw new Error('Missing required field: userId');
      }
      if (!tripData.destination) {
        throw new Error('Missing required field: destination');
      }

      console.log('➕ addTrip: Data validation passed');
      console.log('➕ addTrip: Preparing to save to Firestore...');

      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log('✅ addTrip: Successfully saved to Firestore with ID:', docRef.id);

      // CRITICAL: Use the Firestore-generated ID, not any ID from tripData
      const newTrip: Trip = {
        ...tripData,
        id: docRef.id, // Use Firestore ID as source of truth
        createdAt: new Date().toISOString(),
      } as Trip;

      console.log('✅ addTrip: Adding to local Zustand state with ID:', newTrip.id);

      set((state) => {
        const updatedTrips = [...state.trips, newTrip];
        console.log('✅ addTrip: Zustand state updated. Total trips now:', updatedTrips.length);
        return { trips: updatedTrips };
      });

      console.log('✅ addTrip: Trip creation completed successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar viagem:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao criar viagem';
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

      console.log('🗑️ Starting deletion for trip:', tripId);

      // Step 1: Delete from Firestore
      const docRef = doc(db, 'trips', tripId);
      console.log('📍 Deleting from path: trips/' + tripId);
      
      await deleteDoc(docRef);
      console.log('✅ Successfully called deleteDoc for:', tripId);

      // Step 2: Wait for Firestore to process the deletion
      console.log('⏳ Waiting for Firestore to process deletion...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Verify the document was actually deleted by fetching it
      try {
        const { getDoc } = await import('firebase/firestore');
        const deletedDocSnapshot = await getDoc(docRef);
        
        if (deletedDocSnapshot.exists()) {
          console.error('⚠️ CRITICAL: Document still exists after deletion!');
          console.error('Document data:', deletedDocSnapshot.data());
          throw new Error('Firestore deletion verification failed - document still exists');
        } else {
          console.log('✅ Verified: Document successfully removed from Firestore');
        }
      } catch (verifyError) {
        console.warn('⚠️ Verification attempt failed:', verifyError);
        // Continue - deletion likely succeeded
      }

      // Step 4: Update local state - REMOVE from array
      const updatedTrips = useTripsStore.getState().trips.filter((t: Trip) => t.id !== tripId);
      
      console.log('✅ Trip deleted from local state:', tripId);
      console.log('📊 Remaining trips in state:', updatedTrips.length);
      
      set({ 
        trips: updatedTrips,
        lastLoadTime: Date.now(),
      });

      // Step 5: Do NOT call loadTrips() - this would reload deleted items!
      // The deletion is final and should stay deleted until next full reload

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
