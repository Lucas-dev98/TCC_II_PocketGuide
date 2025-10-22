/**
 * MapDayScreen.tsx - Map view for a specific day of the trip
 * Displays attractions for the day with interactive map
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
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTripStore } from '../store/tripStore';
import { Attraction } from '../types';
import { getOptimizedRoute } from '../services/graphhopper';

interface MapDayScreenProps {
  route: { params: { day: number } };
  navigation?: any;
}

interface RouteData {
  distance: number;
  duration: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
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

      // Build route coordinates for GraphHopper
      const routeCoordinates = dayAttractions.map((attr: Attraction) => ({
        latitude: attr.location.lat,
        longitude: attr.location.lng,
        name: attr.name,
      }));

      if (routeCoordinates.length > 1) {
        const routeData = await getOptimizedRoute(routeCoordinates);
        
        if (routeData) {
          setMapRoute({
            distance: routeData.totalDistance,
            duration: routeData.totalTime,
            coordinates: routeData.coordinates,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    } finally {
      setRouteLoading(false);
    }
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
          <Text style={styles.emptyText}>Nenhuma atração para este dia</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate map region center
  const centerLat =
    dayAttractions.reduce((sum: number, attr: Attraction) => sum + attr.location.lat, 0) /
    dayAttractions.length;
  const centerLng =
    dayAttractions.reduce((sum: number, attr: Attraction) => sum + attr.location.lng, 0) /
    dayAttractions.length;

  const initialRegion = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dia {day}</Text>
        {routeLoading && <ActivityIndicator size="small" color="#FF6B6B" />}
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          provider="google"
        >
          {/* Route Polyline */}
          {mapRoute?.coordinates && mapRoute.coordinates.length > 1 && (
            <Polyline
              coordinates={mapRoute.coordinates}
              strokeColor="#FF6B6B"
              strokeWidth={3}
              lineDashPattern={[5]}
            />
          )}

          {/* Markers for attractions */}
          {dayAttractions.map((attraction: Attraction, index: number) => (
            <Marker
              key={attraction.id}
              coordinate={{
                latitude: attraction.location.lat,
                longitude: attraction.location.lng,
              }}
              title={attraction.name}
              description={`${index + 1}. ${attraction.reason}`}
              pinColor={index === 0 ? '#4CAF50' : '#FF6B6B'}
            />
          ))}
        </MapView>
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
              Distância Total: {(mapRoute.distance / 1000).toFixed(2)} km
            </Text>
            <Text style={styles.routeText}>
              Tempo Total: {Math.round(mapRoute.duration / 60)} minutos
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
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
