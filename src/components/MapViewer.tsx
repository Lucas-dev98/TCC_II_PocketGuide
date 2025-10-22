/**
 * MapViewer.tsx - Map viewer component (web-safe)
 * Shows attraction routes and itinerary information
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Attraction } from '../types';
import { calculateDayRoutes, RouteSegment, formatDistance, formatDuration } from '../services/graphhopperRoutes';

const { height } = Dimensions.get('window');

interface MapViewerProps {
  attractions: Attraction[];
  day: number;
}

export const MapViewer: React.FC<MapViewerProps> = ({ attractions, day }) => {
  const [routes, setRoutes] = useState<RouteSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, [attractions, day]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const calculatedRoutes = await calculateDayRoutes(attractions);
      setRoutes(calculatedRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!attractions || attractions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma atração para este dia</Text>
      </View>
    );
  }

  // Calculate bounding box for all attractions
  const lats = attractions.map(a => a.location.lat);
  const lngs = attractions.map(a => a.location.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>📍 Mapa Interativo</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Atualmente em: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
        </Text>
        <Text style={styles.mapHint}>
          🗺️ Mapa completo disponível em app nativo
        </Text>
      </View>

      {/* Route information */}
      <ScrollView style={styles.routeInfo}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Calculando rotas...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.routeTitle}>📍 Roteiro do Dia {day}</Text>
            
            {/* Attractions list with route info */}
            {attractions.map((attraction, index) => (
              <View key={attraction.id} style={styles.attractionItem}>
                <View style={styles.attractionHeader}>
                  <View style={[
                    styles.attractionNumber,
                    {
                      backgroundColor: index === 0 ? '#FF6B6B' : index === attractions.length - 1 ? '#4CAF50' : '#2196F3'
                    }
                  ]}>
                    <Text style={styles.attractionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.attractionInfo}>
                    <Text style={styles.attractionName}>{attraction.name}</Text>
                    <Text style={styles.attractionTime}>
                      🕐 {attraction.time} • ⏱️ {attraction.duration}min
                    </Text>
                    <Text style={styles.attractionCoords}>
                      📍 {attraction.location.lat.toFixed(4)}, {attraction.location.lng.toFixed(4)}
                    </Text>
                  </View>
                </View>

                {/* Route to next attraction */}
                {index < routes.length && (
                  <View style={styles.routeToNext}>
                    <Text style={styles.routeArrow}>⬇️</Text>
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeDetail}>
                        📏 {formatDistance(routes[index].distance)}
                      </Text>
                      <Text style={styles.routeDetail}>
                        ⏱️ {formatDuration(routes[index].duration)}
                      </Text>
                    </View>
                  </View>
                )}

                {attraction.tip && (
                  <Text style={styles.attractionTip}>💡 {attraction.tip}</Text>
                )}
              </View>
            ))}

            {/* Total trip summary */}
            {routes.length > 0 && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>📊 Resumo do Dia</Text>
                <Text style={styles.summaryText}>
                  Total de deslocamento: {formatDistance(
                    routes.reduce((sum, r) => sum + r.distance, 0)
                  )}
                </Text>
                <Text style={styles.summaryText}>
                  Tempo total de deslocamento: {formatDuration(
                    routes.reduce((sum, r) => sum + r.duration, 0)
                  )}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapPlaceholder: {
    height: height * 0.35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingHorizontal: 16,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 8,
  },
  mapHint: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  routeInfo: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  attractionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  attractionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  attractionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attractionNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  attractionInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  attractionTime: {
    fontSize: 13,
    color: '#666666',
  },
  attractionCoords: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  routeToNext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 4,
  },
  routeArrow: {
    fontSize: 18,
    marginRight: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  routeDetail: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  attractionTip: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 40,
  },
  summary: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
});
