/**
 * TripCard Component - Displays a trip in card format
 * Used in HomeScreen to show saved trips
 * Memoized to prevent unnecessary re-renders
 */

import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Trip } from "../types";
import { formatDate } from "../utils/formatDate";

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

const TripCardComponent: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(trip);
  }, [trip, onPress]);
  // Ensure dates are Date objects
  const startDate = trip.startDate instanceof Date ? trip.startDate : new Date(trip.startDate);
  const endDate = trip.endDate instanceof Date ? trip.endDate : new Date(trip.endDate);

  const tripDuration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const attractionCount = trip.attractions?.length || 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`View trip to ${trip.destination}`}
      accessibilityRole="button"
      accessibilityHint="Opens trip details"
    >
      <View style={styles.content}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.dateRange}>
          {formatDate(startDate)} - {formatDate(endDate)} •{" "}
          {tripDuration} {tripDuration === 1 ? "day" : "days"}
        </Text>
        <Text style={styles.attractions}>
          {attractionCount} {attractionCount === 1 ? "attraction" : "attractions"}
        </Text>
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

// Memoization comparison function for performance optimization
const arePropsEqual = (prevProps: TripCardProps, nextProps: TripCardProps) => {
  return (
    prevProps.trip.id === nextProps.trip.id &&
    prevProps.trip.destination === nextProps.trip.destination &&
    prevProps.trip.startDate === nextProps.trip.startDate &&
    prevProps.trip.endDate === nextProps.trip.endDate &&
    prevProps.trip.attractions?.length === nextProps.trip.attractions?.length &&
    prevProps.onPress === nextProps.onPress
  );
};

export const TripCard = React.memo(TripCardComponent, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  dateRange: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  attractions: {
    fontSize: 12,
    color: "#999",
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "300",
  },
});
