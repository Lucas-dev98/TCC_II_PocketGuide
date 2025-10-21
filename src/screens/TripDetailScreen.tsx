/**
 * TripDetailScreen - Shows the detailed itinerary for a trip
 * User can edit, add, remove attractions and reorder them via drag & drop
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTripStore } from "../store/tripStore";
import { AttractionCard } from "../components/AttractionCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Attraction } from "../types";

interface TripDetailScreenProps {
  navigation: any;
  route: any;
}

export const TripDetailScreen: React.FC<TripDetailScreenProps> = ({
  navigation,
  route,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tripId: _tripId } = route.params;
  const { currentTrip, loading } = useTripStore();
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayAttractions, setDayAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    if (currentTrip) {
      const attractions = currentTrip.attractions
        .filter((a) => a.day === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time));
      setDayAttractions(attractions);
    }
  }, [currentTrip, selectedDay]);

  if (loading || !currentTrip) {
    return <LoadingSpinner message="Loading trip..." fullScreen />;
  }

  const totalDays = Math.ceil(
    (currentTrip.endDate.getTime() - currentTrip.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleAddAttraction = () => {
    // TODO: Open modal to add new attraction
  };

  const handleEditAttraction = (_attraction: Attraction) => {
    // TODO: Open edit modal
  };

  const handleDeleteAttraction = (_attraction: Attraction) => {
    // TODO: Delete from store
  };

  const handleViewMap = () => {
    navigation.navigate("MapDay", { day: selectedDay });
  };

  const renderDaySelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.daySelector}
      contentContainerStyle={styles.daySelectorContent}
    >
      {Array.from({ length: totalDays }).map((_, index) => {
        const day = index + 1;
        const isSelected = day === selectedDay;
        return (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              isSelected && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                isSelected && styles.dayButtonTextSelected,
              ]}
            >
              Day {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{currentTrip.destination}</Text>
        <Text style={styles.subtitle}>
          {currentTrip.attractions.length} attractions
        </Text>
      </View>

      {/* Day Selector */}
      {renderDaySelector()}

      {/* Attractions List */}
      <FlatList
        data={dayAttractions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AttractionCard
            attraction={item}
            onPress={() => handleEditAttraction(item)}
            onLongPress={() => handleDeleteAttraction(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No attractions for this day</Text>
          </View>
        }
      />

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={handleAddAttraction}
        >
          <Text style={styles.buttonSecondaryText}>+ Add Attraction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handleViewMap}
        >
          <Text style={styles.buttonPrimaryText}>📍 View on Map</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    fontSize: 16,
    color: "#3B82F6",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  daySelector: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
  },
  dayButtonSelected: {
    backgroundColor: "#3B82F6",
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  dayButtonTextSelected: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
