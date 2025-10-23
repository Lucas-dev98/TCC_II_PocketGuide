/**
 * CreateTripScreen - Screen to create a new trip
 * User selects destination and dates, then AI generates itinerary
 * Input validation using Zod schemas
 */

import React, { useState, useCallback } from "react";
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
import { DatePickerCalendar } from "../components/DatePickerCalendar";
import { generateItineraryWithGemini } from "../services/geminiItinerary";
import { useTripStore } from "../store/tripStore";
import { useAuth } from "../hooks/useAuth";
import { Trip, Attraction } from "../types";
import { validateGenerateItineraryRequest } from "../schemas/validation";
import logger from "../services/logger";

// Popular destinations for quick select
const POPULAR_DESTINATIONS = [
  "🗼 Paris",
  "🗽 New York",
  "🏖️ Bali",
  "🏛️ Rome",
  "🏰 Tokyo",
  "🌃 Barcelona",
  "🕌 Dubai",
  "🗽 Canada",
];

/**
 * Sanitize destination input
 */
const sanitizeDestination = (input: string): string => {
  return input
    .replace(/^[^a-zA-Z]*/, '') // Remove leading emoji/special chars
    .trim()
    .slice(0, 100) // Max 100 characters
    .replace(/[<>\"']/g, ''); // Remove dangerous characters
};

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
  const [showSuggestions, setShowSuggestions] = useState(false);

  /**
   * Update destination with input sanitization
   */
  const handleDestinationChange = useCallback((text: string) => {
    setDestination(text);
    setShowSuggestions(text.length > 0);
  }, []);

  /**
   * Open date picker for start or end date
   */
  const handleDatePick = useCallback((dateType: "start" | "end") => {
    setSelectedDateType(dateType);
    setShowDatePicker(true);
  }, []);

  /**
   * Generate itinerary from AI with full validation
   */
  const handleGenerateItinerary = useCallback(async () => {
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

      // Sanitize and validate destination input
      const cleanDestination = sanitizeDestination(destination);
      
      if (!cleanDestination || cleanDestination.length < 2) {
        setError("Destination must be at least 2 characters");
        return;
      }

      try {
        validateGenerateItineraryRequest({
          destination: cleanDestination,
          days,
          tags: ["culture", "gastronomy", "sightseeing"],
          budget: "mid",
          groupType: "couple",
        });
        logger.info('Trip input validated successfully', { destination: cleanDestination, days });
      } catch (validationError) {
        const errorMsg = validationError instanceof Error ? validationError.message : 'Validation failed';
        logger.error('Trip input validation failed', validationError instanceof Error ? validationError : new Error(errorMsg));
        setError(`Invalid input: ${errorMsg}`);
        return;
      }

      // Generate itinerary using Gemini AI
      logger.info("🤖 Generating itinerary with Gemini...", { destination: cleanDestination, days });
      const itinerary = await generateItineraryWithGemini(
        cleanDestination,
        days,
        ["culture", "gastronomy", "sightseeing"], // Default tags
        "mid", // Default budget
        "couple" // Default group type
      );

      if (!itinerary) {
        setError("Failed to generate itinerary. Please try again.");
        logger.error("Itinerary generation returned empty result", new Error("Empty itinerary"));
        return;
      }

      logger.info("✅ Itinerary generated successfully!", {
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
  }, [destination, startDate, endDate, user, addTrip, setCurrentTrip, navigation]);

  /**
   * Quick select a popular destination
   */
  const handleQuickSelect = useCallback((dest: string) => {
    const cleanDest = dest.replace(/^[^a-zA-Z]*/, '').trim();
    setDestination(cleanDest);
    setShowSuggestions(false);
  }, []);

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
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Returns to the previous screen"
            >
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>✈️ Plan New Trip</Text>
            <Text style={styles.subtitle}>
              Let our AI create the perfect itinerary
            </Text>
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            {/* Destination Input */}
            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>📍 Destination</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Where are you going?"
                placeholderTextColor="#9CA3AF"
                value={destination}
                onChangeText={handleDestinationChange}
                editable={!loading}
                accessibilityLabel="Destination input"
                accessibilityHint="Enter your travel destination"
              />

              {/* Popular Destinations */}
              {showSuggestions && destination.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {POPULAR_DESTINATIONS.filter((d) =>
                    d.toLowerCase().includes(destination.toLowerCase())
                  ).map((dest, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionItem}
                      onPress={() => handleQuickSelect(dest)}
                      accessibilityLabel={`Select ${dest}`}
                      accessibilityRole="button"
                      accessibilityHint="Selects this as your travel destination"
                    >
                      <Text style={styles.suggestionText}>{dest}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Travel Dates */}
            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>📅 Travel Dates</Text>
              </View>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.dateInput, startDate && styles.dateInputFilled]}
                  onPress={() => handleDatePick("start")}
                  disabled={loading}
                  accessibilityLabel="Start date picker"
                  accessibilityRole="button"
                  accessibilityHint="Opens date picker to select trip start date"
                >
                  <Text style={styles.dateLabel}>From</Text>
                  <Text style={styles.dateValue}>
                    {startDate
                      ? startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Select date"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dateArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>

                <TouchableOpacity
                  style={[styles.dateInput, endDate && styles.dateInputFilled]}
                  onPress={() => handleDatePick("end")}
                  disabled={loading}
                  accessibilityLabel="End date picker"
                  accessibilityRole="button"
                  accessibilityHint="Opens date picker to select trip end date"
                >
                  <Text style={styles.dateLabel}>To</Text>
                  <Text style={styles.dateValue}>
                    {endDate
                      ? endDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Select date"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Trip Duration */}
              {startDate && endDate && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    🕐{" "}
                    {Math.ceil(
                      (endDate.getTime() - startDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{" "}
                    days
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              (loading ||
                !destination ||
                !startDate ||
                !endDate) &&
                styles.buttonDisabled,
            ]}
            onPress={handleGenerateItinerary}
            disabled={loading || !destination || !startDate || !endDate}
            accessibilityLabel="Generate itinerary"
            accessibilityRole="button"
            accessibilityHint="Uses AI to generate a personalized travel itinerary for your trip"
            accessibilityState={{
              disabled: loading || !destination || !startDate || !endDate,
              busy: loading,
            }}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="small" />
                <Text style={styles.loadingText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>✨ Generate Itinerary</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 How it works</Text>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Select destination & dates</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>AI generates your itinerary</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Edit & save to your trips</Text>
            </View>
            <View style={styles.infoStep}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>View maps & go offline</Text>
            </View>
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
            <ScrollView 
              style={styles.modalContentWrapper}
              contentContainerStyle={styles.modalContentScroll}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Select {selectedDateType === "start" ? "start" : "end"} date
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <DatePickerCalendar
                  onDateSelect={(date) => {
                    if (selectedDateType === "start") {
                      setStartDate(date);
                    } else {
                      setEndDate(date);
                    }
                    setShowDatePicker(false);
                  }}
                  selectedDate={selectedDateType === "start" ? startDate || undefined : endDate || undefined}
                  minDate={selectedDateType === "end" ? startDate || undefined : undefined}
                  maxDate={selectedDateType === "start" ? endDate || undefined : undefined}
                />

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: "#3B82F6",
    marginBottom: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formSection: {
    marginBottom: 24,
  },
  labelRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    fontWeight: "500",
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  suggestionText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
  },
  dateInputFilled: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  dateLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "700",
  },
  dateArrow: {
    paddingVertical: 8,
  },
  arrowText: {
    fontSize: 18,
    color: "#D1D5DB",
  },
  durationBadge: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
  },
  durationText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
  },
  errorEmoji: {
    fontSize: 18,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  generateButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 12,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "#3B82F6",
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: "center",
    paddingTop: 5,
  },
  stepText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: "85%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontWeight: "500",
  },
  dateModalInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalContentWrapper: {
    flex: 1,
  },
  modalContentScroll: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "700",
  },
  doneButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
