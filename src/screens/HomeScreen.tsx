/**
 * HomeScreen - Main screen after login
 * Lists all user's saved trips and provides button to create new trip
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useTripStore } from "../store/tripStore";
import { TripCard } from "../components/TripCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Trip } from "../types";

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { trips, loading, setCurrentTrip } = useTripStore();
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);

  useEffect(() => {
    // Filter and sort trips
    const sorted = [...trips].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    setFilteredTrips(sorted);
  }, [trips]);

  const handleTripPress = useCallback(
    (trip: Trip) => {
      setCurrentTrip(trip);
      navigation.navigate("TripDetail", { tripId: trip.id });
    },
    [navigation, setCurrentTrip]
  );

  const handleCreateTrip = useCallback(() => {
    setCurrentTrip(null);
    navigation.navigate("CreateTrip");
  }, [navigation, setCurrentTrip]);

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptyText}>
          Create your first trip and let AI help you plan
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateTrip}
          accessibilityLabel="Create first trip"
          accessibilityRole="button"
          accessibilityHint="Opens the trip creation form to plan your first journey"
        >
          <Text style={styles.createButtonText}>Create First Trip</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleCreateTrip]
  );

  if (loading) {
    return <LoadingSpinner message="Loading trips..." fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>My Trips</Text>
        <Text style={styles.subtitle}>{filteredTrips.length} saved</Text>
      </View>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard trip={item} onPress={handleTripPress} />
          )}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {/* FAB - Create New Trip */}
      {filteredTrips.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateTrip}
          accessibilityLabel="Create new trip"
          accessibilityRole="button"
          accessibilityHint="Floating action button to create a new travel plan"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "300",
  },
});
