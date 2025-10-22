/**
 * AttractionCard Component - Displays an attraction in the itinerary
 * Used in TripDetailScreen to show each day's activities
 */

import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Attraction } from "../types";

interface AttractionCardProps {
  attraction: Attraction;
  onPress?: (attraction: Attraction) => void;
  onLongPress?: (attraction: Attraction) => void;
  isDragging?: boolean;
}

const AttractionCardComponent: React.FC<AttractionCardProps> = ({
  attraction,
  onPress,
  onLongPress,
  isDragging = false,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(attraction);
  }, [attraction, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(attraction);
  }, [attraction, onLongPress]);

  return (
    <TouchableOpacity
      style={[styles.container, isDragging && styles.dragging]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      accessibilityLabel={`Attraction: ${attraction.name}`}
      accessibilityRole="button"
      accessibilityHint={`${attraction.reason}. Duration: ${attraction.duration} minutes`}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{attraction.time}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{attraction.name}</Text>
        <Text style={styles.reason}>{attraction.reason}</Text>
        {attraction.tip && <Text style={styles.tip}>💡 {attraction.tip}</Text>}
        <Text style={styles.duration}>{attraction.duration} min</Text>
      </View>

      <View style={styles.dragHandle}>
        <Text style={styles.dragIcon}>⋮</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dragging: {
    opacity: 0.5,
    backgroundColor: "#F3F4F6",
  },
  timeContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    minWidth: 45,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 3,
  },
  reason: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  tip: {
    fontSize: 12,
    color: "#F59E0B",
    marginBottom: 4,
    fontStyle: "italic",
  },
  duration: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  dragHandle: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  dragIcon: {
    fontSize: 16,
    color: "#D1D5DB",
  },
});

const arePropsEqual = (
  prevProps: AttractionCardProps,
  nextProps: AttractionCardProps
) => {
  return (
    prevProps.attraction.id === nextProps.attraction.id &&
    prevProps.attraction.name === nextProps.attraction.name &&
    prevProps.attraction.time === nextProps.attraction.time &&
    prevProps.attraction.duration === nextProps.attraction.duration &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress
  );
};

export const AttractionCard = React.memo(
  AttractionCardComponent,
  arePropsEqual
);
