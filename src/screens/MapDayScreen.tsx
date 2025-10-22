/**
 * MapDayScreen.tsx - Map view for a specific day of the trip
 * Displays attractions for the day with Mapbox integration
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useTripStore } from '../store/tripStore';
import { Attraction } from '../types';

// Set Mapbox access token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_API_KEY || '');

interface MapDayScreenProps {
  route: { params: { day: number } };
  navigation?: any;
}

interface RouteData {
  distance: number;
  duration: number;
  coordinates: Array<[number, number]>;
}

export const MapDayScreen: React.FC<MapDayScreenProps> = ({
  route,
}) => {
  const { day } = route.params;
  const { currentTrip, loading } = useTripStore();
  const [mapRoute, setMapRoute] = useState<RouteData | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Filter attractions for this day
  const dayAttractions = useMemo(() => {
    return currentTrip?.attractions?.filter((attr: Attraction) => attr.day === day) || [];
  }, [currentTrip, day]);

  // Load route when attractions change
  useEffect(() => {
    if (dayAttractions.length > 1) {
      loadRoute();
    }
  }, [dayAttractions]);

  const loadRoute = async () => {
    try {
      setRouteLoading(true);

      // Build route coordinates as tuples
      const coordinates: Array<[number, number]> = dayAttractions.map((attr: Attraction) => [
        attr.location.lng,
        attr.location.lat,
      ]);

      if (coordinates.length < 2) {
        setMapRoute(null);
        return;
      }

      // For now, create a simple line between points
      // In a real app, you'd use GraphHopper API
      const distance = calculateDistance(dayAttractions);
      const duration = dayAttractions.reduce((sum: number, attr: Attraction) => sum + attr.duration, 0);

      setMapRoute({
        distance,
        duration,
        coordinates,
      });
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    } finally {
      setRouteLoading(false);
    }
  };

  const calculateDistance = (attractions: Attraction[]): number => {
    // Simple distance calculation (in real app, use GraphHopper)
    let totalDistance = 0;
    for (let i = 0; i < attractions.length - 1; i++) {
      const lat1 = attractions[i].location.lat;
      const lng1 = attractions[i].location.lng;
      const lat2 = attractions[i + 1].location.lat;
      const lng2 = attractions[i + 1].location.lng;

      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += 6371 * c; // Earth radius in km
    }
    return totalDistance;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  if (!dayAttractions.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma atração para o dia {day}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate map center
  const centerLat =
    dayAttractions.reduce((sum: number, attr: Attraction) => sum + attr.location.lat, 0) /
    dayAttractions.length;
  const centerLng =
    dayAttractions.reduce((sum: number, attr: Attraction) => sum + attr.location.lng, 0) /
    dayAttractions.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dia {day}</Text>
        {routeLoading && <ActivityIndicator size="small" color="#FF6B6B" />}
      </View>

      {/* Mapbox Map */}
      <View style={styles.mapContainer}>
        <Mapbox.MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v12"
        >
          <Mapbox.Camera
            centerCoordinate={[centerLng, centerLat]}
            zoomLevel={13}
            animationDuration={500}
          />

          {/* Markers */}
          {dayAttractions.map((attraction: Attraction, index: number) => (
            <Mapbox.PointAnnotation
              key={`${attraction.id}-${index}`}
              id={`marker-${attraction.id}`}
              coordinate={[attraction.location.lng, attraction.location.lat]}
              title={attraction.name}
            >
              <View
                style={[
                  styles.marker,
                  { backgroundColor: index === 0 ? '#4CAF50' : '#FF6B6B' },
                ]}
              >
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
            </Mapbox.PointAnnotation>
          ))}

          {/* Route Line */}
          {mapRoute && mapRoute.coordinates.length > 1 && (
            <Mapbox.ShapeSource
              id="route-source"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: mapRoute.coordinates,
                },
                properties: {},
              }}
            >
              <Mapbox.LineLayer
                id="route-layer"
                style={{
                  lineColor: '#FF6B6B',
                  lineWidth: 3,
                  lineOpacity: 0.8,
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </Mapbox.MapView>
      </View>

      {/* Attractions List */}
      <ScrollView style={styles.listContainer}>
        {dayAttractions.map((attraction: Attraction, index: number) => (
          <View key={attraction.id} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.name}>{attraction.name}</Text>
              <Text style={styles.time}>⏰ {attraction.time}</Text>
              <Text style={styles.duration}>⏱️ {attraction.duration} min</Text>
              <Text style={styles.reason}>{attraction.reason}</Text>
              {attraction.tip && (
                <Text style={styles.tip}>💡 {attraction.tip}</Text>
              )}
            </View>
          </View>
        ))}

        {/* Route Summary */}
        {mapRoute && (
          <View style={styles.routeInfo}>
            <Text style={styles.routeTitle}>📍 Resumo da Rota</Text>
            <Text style={styles.routeText}>
              Distância Total: {mapRoute.distance.toFixed(2)} km
            </Text>
            <Text style={styles.routeText}>
              Tempo Total: {Math.round(mapRoute.duration)} minutos
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  mapContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    padding: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  tip: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  routeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});
