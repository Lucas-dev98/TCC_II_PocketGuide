/**
 * CreateTripScreen - Screen to create a new trip
 * User selects destination and dates, then AI generates itinerary
 */

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface CreateTripScreenProps {
  navigation: any;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({
  navigation,
}) => {
  const [destination, setDestination] = useState("");
  const [startDate, _setStartDate] = useState<Date | null>(null);
  const [endDate, _setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateItinerary = async () => {
    if (!destination || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: Implement itinerary generation
      // 1. Call Gemini API to generate itinerary
      // 2. Save trip to Zustand store
      // 3. Navigate to TripDetailScreen
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  const handleDatePick = (_dateType: "start" | "end") => {
    // TODO: Implement date picker
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>‹ Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Plan New Trip</Text>
          </View>

          {/* Destination Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you going?"
              value={destination}
              onChangeText={setDestination}
              editable={!loading}
            />
            <Text style={styles.hint}>Search for city or country</Text>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.label}>Travel Dates</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => handleDatePick("start")}
                disabled={loading}
              >
                <Text style={styles.dateInputText}>
                  {startDate
                    ? startDate.toLocaleDateString()
                    : "Start date"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.dateSeparator}>→</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => handleDatePick("end")}
                disabled={loading}
              >
                <Text style={styles.dateInputText}>
                  {endDate ? endDate.toLocaleDateString() : "End date"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.buttonDisabled]}
            onPress={handleGenerateItinerary}
            disabled={loading}
          >
            {loading ? (
              <View>
                <LoadingSpinner size="small" />
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generate Itinerary</Text>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⚡ How it works</Text>
            <Text style={styles.infoText}>
              1. Select your destination and dates{"\n"}
              2. Our AI generates a personalized itinerary{"\n"}
              3. Edit and customize as you like{"\n"}
              4. View on map and go offline anytime
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: "#3B82F6",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  hint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
  },
  dateInputText: {
    fontSize: 14,
    color: "#4B5563",
  },
  dateSeparator: {
    fontSize: 16,
    color: "#D1D5DB",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  generateButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
});
