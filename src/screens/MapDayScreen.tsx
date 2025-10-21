import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTripStore } from "../store/tripStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Attraction } from "../types";

interface MapDayScreenProps {
  navigation: any;
  route: any;
}

export const MapDayScreen: React.FC<MapDayScreenProps> = ({
  navigation,
  route,
}) => {
  const { day } = route.params;
  const { currentTrip, loading } = useTripStore();
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    if (currentTrip) {
      const dayAttractions = currentTrip.attractions
        .filter((a) => a.day === day)
        .sort((a, b) => a.time.localeCompare(b.time));
      setAttractions(dayAttractions);
    }
  }, [currentTrip, day]);

  if (loading || !currentTrip) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Day {day}</Text>
      </View>

      <ScrollView style={styles.list}>
        {attractions.map((attraction, index) => (
          <View key={attraction.id} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.name}>{attraction.name}</Text>
              <Text style={styles.time}>⏰ {attraction.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { padding: 16, backgroundColor: "#3b5998", flexDirection: "row", alignItems: "center" },
  backButton: { fontSize: 24, color: "white", marginRight: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  list: { flex: 1, padding: 12 },
  card: { flexDirection: "row", backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 10, elevation: 2 },
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#3b5998", justifyContent: "center", alignItems: "center", marginRight: 12 },
  badgeText: { color: "white", fontSize: 14, fontWeight: "bold" },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: "bold", color: "#333", marginBottom: 6 },
  time: { fontSize: 12, color: "#3b5998", fontWeight: "600" },
});
