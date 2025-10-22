import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Mapbox from "@rnmapbox/maps";
import { useTripStore } from "../store/tripStore";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Attraction } from "../types";
import {
  getOptimizedRoute,
  formatDistance,
  formatDuration,
} from "../services/mapbox";

interface MapDayScreenProps {
  navigation: any;
  route: any;
}

// Configurar token do Mapbox
const MAPBOX_API_KEY = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;
const GRAPHHOPPER_API_KEY = process.env.EXPO_PUBLIC_GRAPHHOPPER_API_KEY;

Mapbox.setAccessToken(MAPBOX_API_KEY || "");

export const MapDayScreen: React.FC<MapDayScreenProps> = ({
  navigation,
  route,
}) => {
  const { day } = route.params;
  const { currentTrip, loading } = useTripStore();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [route, setRoute] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [selectedAttractionIndex, setSelectedAttractionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (currentTrip) {
      const dayAttractions = currentTrip.attractions
        .filter((a) => a.day === day)
        .sort((a, b) => a.time.localeCompare(b.time));
      setAttractions(dayAttractions);
    }
  }, [currentTrip, day]);

  // Calcular rota quando as atrações mudam
  useEffect(() => {
    if (attractions.length >= 2 && GRAPHHOPPER_API_KEY) {
      loadRoute();
    }
  }, [attractions]);

  const loadRoute = async () => {
    try {
      setLoadingRoute(true);
      const coordinates: [number, number][] = attractions.map((a) => [
        a.location.longitude,
        a.location.latitude,
      ]);

      const routeData = await getOptimizedRoute(
        coordinates,
        GRAPHHOPPER_API_KEY || ""
      );
      setRoute(routeData);
    } catch (error) {
      console.error("Erro ao carregar rota:", error);
      Alert.alert("Erro", "Não foi possível carregar a rota.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleGetDirections = (attraction: Attraction) => {
    Alert.alert(
      `Direções para ${attraction.name}`,
      `Latitude: ${attraction.location.latitude}\nLongitude: ${attraction.location.longitude}\n\nAbrindo mapas...`,
      [{ text: "OK" }]
    );
  };

  if (loading || !currentTrip) {
    return <LoadingSpinner />;
  }

  const centerLng =
    attractions.length > 0
      ? attractions.reduce((sum, a) => sum + a.location.longitude, 0) /
        attractions.length
      : -9.1410;
  const centerLat =
    attractions.length > 0
      ? attractions.reduce((sum, a) => sum + a.location.latitude, 0) /
        attractions.length
      : 38.7100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Day {day}</Text>
      </View>

      {attractions.length > 0 ? (
        <>
          <View style={styles.mapContainer}>
            <Mapbox.MapView
              style={styles.map}
              centerCoordinate={[centerLng, centerLat]}
              zoomLevel={12}
              showUserLocation={true}
            >
              {/* Markers para cada atração */}
              {attractions.map((attraction, index) => (
                <Mapbox.PointAnnotation
                  key={attraction.id}
                  coordinate={[
                    attraction.location.longitude,
                    attraction.location.latitude,
                  ]}
                  title={attraction.name}
                  id={attraction.id}
                  onSelected={() => setSelectedAttractionIndex(index)}
                >
                  <View style={styles.marker}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                </Mapbox.PointAnnotation>
              ))}

              {/* Rota entre atrações */}
              {route && (
                <Mapbox.ShapeSource
                  id="routeSource"
                  shape={{
                    type: "LineString",
                    coordinates: route.coordinates,
                  }}
                >
                  <Mapbox.LineLayer
                    id="routeLine"
                    style={{
                      lineColor: "#007AFF",
                      lineWidth: 3,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                </Mapbox.ShapeSource>
              )}
            </Mapbox.MapView>

            {loadingRoute && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Calculando rota...</Text>
              </View>
            )}
          </View>

          {/* Informações da rota */}
          {route && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeText}>
                Distância total: {formatDistance(route.distance)}
              </Text>
              <Text style={styles.routeText}>
                Tempo estimado: {formatDuration(route.duration)}
              </Text>
            </View>
          )}

          {/* Lista de atrações */}
          <ScrollView style={styles.list}>
            {attractions.map((attraction, index) => (
              <TouchableOpacity
                key={attraction.id}
                style={[
                  styles.attractionItem,
                  selectedAttractionIndex === index &&
                    styles.attractionItemSelected,
                ]}
                onPress={() => handleGetDirections(attraction)}
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>{index + 1}</Text>
                </View>
                <View style={styles.attractionInfo}>
                  <Text style={styles.attractionName}>{attraction.name}</Text>
                  <Text style={styles.attractionTime}>{attraction.time}</Text>
                  {attraction.duration && (
                    <Text style={styles.attractionDuration}>
                      Duração: {attraction.duration}min
                    </Text>
                  )}
                  {attraction.reason && (
                    <Text style={styles.attractionReason}>
                      {attraction.reason}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma atração para este dia
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#3b5998",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    fontSize: 24,
    color: "white",
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  mapContainer: {
    height: 250,
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "white",
    fontSize: 14,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  routeInfo: {
    backgroundColor: "white",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  routeText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    padding: 12,
  },
  attractionItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: "flex-start",
  },
  attractionItemSelected: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  attractionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attractionName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  attractionTime: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 2,
  },
  attractionDuration: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  attractionReason: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

