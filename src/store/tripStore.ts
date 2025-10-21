/**
 * Zustand Store - Trip Management State
 * Handles trips, attractions, offline sync, and local state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trip, Attraction } from "../types";

interface TripStoreState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;

  // Trip operations
  setTrips: (trips: Trip[]) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Attraction operations
  addAttraction: (tripId: string, attraction: Attraction) => void;
  updateAttraction: (
    tripId: string,
    attractionId: string,
    updates: Partial<Attraction>
  ) => void;
  deleteAttraction: (tripId: string, attractionId: string) => void;
  reorderAttractions: (tripId: string, attractions: Attraction[]) => void;

  // Offline sync
  markForSync: (tripId: string) => void;
  markSynced: (tripId: string) => void;
  getSyncPendingTrips: () => Trip[];

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTripStore = create<TripStoreState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      loading: false,
      error: null,

      setTrips: (trips) => set({ trips }),
      setCurrentTrip: (trip) => set({ currentTrip: trip }),

      addTrip: (trip) =>
        set((state) => ({
          trips: [...state.trips, trip],
        })),

      updateTrip: (id, updates) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === id ? { ...trip, ...updates, updatedAt: new Date() } : trip
          ),
          currentTrip:
            state.currentTrip?.id === id
              ? { ...state.currentTrip, ...updates, updatedAt: new Date() }
              : state.currentTrip,
        })),

      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== id),
          currentTrip:
            state.currentTrip?.id === id ? null : state.currentTrip,
        })),

      addAttraction: (tripId, attraction) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  attractions: [...trip.attractions, attraction],
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : trip
          ),
          currentTrip:
            state.currentTrip?.id === tripId
              ? {
                  ...state.currentTrip,
                  attractions: [
                    ...state.currentTrip.attractions,
                    attraction,
                  ],
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : state.currentTrip,
        })),

      updateAttraction: (tripId, attractionId, updates) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  attractions: trip.attractions.map((attr) =>
                    attr.id === attractionId ? { ...attr, ...updates } : attr
                  ),
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : trip
          ),
          currentTrip:
            state.currentTrip?.id === tripId
              ? {
                  ...state.currentTrip,
                  attractions: state.currentTrip.attractions.map((attr) =>
                    attr.id === attractionId
                      ? { ...attr, ...updates }
                      : attr
                  ),
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : state.currentTrip,
        })),

      deleteAttraction: (tripId, attractionId) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  attractions: trip.attractions.filter(
                    (attr) => attr.id !== attractionId
                  ),
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : trip
          ),
          currentTrip:
            state.currentTrip?.id === tripId
              ? {
                  ...state.currentTrip,
                  attractions: state.currentTrip.attractions.filter(
                    (attr) => attr.id !== attractionId
                  ),
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : state.currentTrip,
        })),

      reorderAttractions: (tripId, attractions) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  attractions,
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : trip
          ),
          currentTrip:
            state.currentTrip?.id === tripId
              ? {
                  ...state.currentTrip,
                  attractions,
                  updatedAt: new Date(),
                  isSyncedToFirestore: false,
                }
              : state.currentTrip,
        })),

      markForSync: (tripId) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? { ...trip, isSyncedToFirestore: false }
              : trip
          ),
        })),

      markSynced: (tripId) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? { ...trip, isSyncedToFirestore: true }
              : trip
          ),
        })),

      getSyncPendingTrips: () => {
        const { trips } = get();
        return trips.filter((trip) => !trip.isSyncedToFirestore);
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "pocket-guide-trips",
      storage: {
        getItem: async (name) => {
          const data = await AsyncStorage.getItem(name);
          return data ? JSON.parse(data) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
