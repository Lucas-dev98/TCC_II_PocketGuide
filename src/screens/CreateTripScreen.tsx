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
  Modal,
} from "react-native";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { generateItineraryWithGemini } from "../services/geminiItinerary";
import { useTripStore } from "../store/tripStore";
import { useAuth } from "../hooks/useAuth";
import { Trip, Attraction } from "../types";

interface CreateTripScreenProps {
  navigation: any;
}

export const CreateTripScreen: React.FC<CreateTripScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const { addTrip, setCurrentTrip } = useTripStore();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState("");

  const handleGenerateItinerary = async () => {
    if (!destination || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    if (startDate > endDate) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate number of days
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      // Generate itinerary using Gemini AI
      console.log("🤖 Generating itinerary with Gemini...");
      const itinerary = await generateItineraryWithGemini(
        destination,
        days,
        ["culture", "gastronomy", "sightseeing"], // Default tags
        "mid", // Default budget
        "couple" // Default group type
      );

      if (!itinerary) {
        setError("Failed to generate itinerary. Please try again.");
        return;
      }

      console.log("✅ Itinerary generated successfully!");
      console.log("🧳 Trip details:", {
        destination,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        days,
        itemsCount: itinerary.itinerary.length,
      });

      // Convert Gemini itinerary to Attraction format
      const attractions: Attraction[] = itinerary.itinerary.map(
        (item: any, index: number) => ({
          id: `attraction-${Date.now()}-${index}`,
          day: item.day || 1,
          time: item.time || "09:00",
          name: item.name,
          duration: item.duration || 60,
          reason: item.reason || item.description || "",
          tip: item.tip || "",
          location: {
            lat: item.location?.lat || 0,
            lng: item.location?.lng || 0,
            address: item.location?.address || "",
          },
          order: index,
        })
      );

      // Create Trip object
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        userId: user?.uid || "",
        destination,
        startDate,
        endDate,
        attractions,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSyncedToFirestore: false,
      };

      // Save to Zustand store
      addTrip(newTrip);
      setCurrentTrip(newTrip);

      console.log("💾 Trip saved to store!");

      // Navigate to TripDetailScreen
      navigation.navigate("TripDetail", { tripId: newTrip.id });
    } catch (err) {
      console.error("❌ Error generating itinerary:", err);
      setError(err instanceof Error ? err.message : "Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  const handleDatePick = (dateType: "start" | "end") => {
    setSelectedDateType(dateType);
    setTempDate("");
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    if (!tempDate) return;

    try {
      // Parse date in format YYYY-MM-DD or MM/DD/YYYY
      let parsedDate: Date;
      if (tempDate.includes("-")) {
        parsedDate = new Date(tempDate);
      } else if (tempDate.includes("/")) {
        const [month, day, year] = tempDate.split("/");
        parsedDate = new Date(`${year}-${month}-${day}`);
      } else {
        setError("Please use format MM/DD/YYYY or YYYY-MM-DD");
        return;
      }

      if (isNaN(parsedDate.getTime())) {
        setError("Invalid date format");
        return;
      }

      if (selectedDateType === "start") {
        setStartDate(parsedDate);
      } else {
        setEndDate(parsedDate);
      }

      setShowDatePicker(false);
      setTempDate("");
      setError(null);
    } catch (err) {
      setError("Invalid date");
    }
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

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Enter {selectedDateType === "start" ? "start" : "end"} date
              </Text>
              <Text style={styles.modalSubtitle}>Format: MM/DD/YYYY</Text>

              <TextInput
                style={styles.dateModalInput}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#9CA3AF"
                value={tempDate}
                onChangeText={setTempDate}
                keyboardType="decimal-pad"
                maxLength={10}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    !tempDate && styles.buttonDisabled,
                  ]}
                  onPress={handleDateConfirm}
                  disabled={!tempDate}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: "85%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  dateModalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
    color: "#1F2937",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
