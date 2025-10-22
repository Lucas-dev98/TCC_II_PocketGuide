/**
 * TripCard Component - Displays a trip in card format
 * Used in HomeScreen to show saved trips
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Trip } from "../types";
import { formatDate } from "../utils/formatDate";

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
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
      onPress={() => onPress(trip)}
      activeOpacity={0.7}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  destination: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  attractions: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 24,
    color: "#D1D5DB",
  },
});
