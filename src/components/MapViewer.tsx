/**
 * MapViewer.tsx - Map viewer component (web-safe)
 * 
 * Features:
 * - Shows attraction routes and itinerary information
 * - Calculates optimal routes between attractions
 * - Provides error handling and fallback UI
 * - Loading states for async operations
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Attraction } from '../types';
import { calculateDayRoutes, RouteSegment, formatDistance, formatDuration } from '../services/graphhopperRoutes';
import logger from '../services/logger';

const { height } = Dimensions.get('window');

interface MapViewerProps {
  attractions: Attraction[];
  day: number;
}

interface MapViewerState {
  routes: RouteSegment[];
  loading: boolean;
  error: string | null;
}

export const MapViewer: React.FC<MapViewerProps> = ({ attractions, day }) => {
  const [state, setState] = useState<MapViewerState>({
    routes: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadRoutes();
  }, [attractions, day]);

  /**
   * Load and calculate day routes with error handling
   */
  const loadRoutes = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!attractions || attractions.length === 0) {
        setState(prev => ({ ...prev, loading: false, error: null }));
        return;
      }

      const calculatedRoutes = await calculateDayRoutes(attractions);
      setState(prev => ({ ...prev, routes: calculatedRoutes, loading: false }));
      logger.info('Routes calculated successfully', { count: calculatedRoutes.length });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to calculate routes';
      logger.error('Error loading routes', error instanceof Error ? error : new Error(errorMsg));
      setState(prev => ({ ...prev, error: errorMsg, loading: false }));
    }
  }, [attractions]);

  /**
   * Retry loading routes
   */
  const handleRetry = useCallback(() => {
    loadRoutes();
  }, [loadRoutes]);

  if (!attractions || attractions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma atração para este dia</Text>
      </View>
    );
  }

  // Show error state with retry button
  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Erro ao carregar mapa</Text>
        <Text style={styles.errorMessage}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
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
        {state.loading ? (
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
                {index < state.routes.length && (
                  <View style={styles.routeToNext}>
                    <Text style={styles.routeArrow}>⬇️</Text>
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeDetail}>
                        📏 {formatDistance(state.routes[index].distance)}
                      </Text>
                      <Text style={styles.routeDetail}>
                        ⏱️ {formatDuration(state.routes[index].duration)}
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
            {state.routes.length > 0 && (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>📊 Resumo do Dia</Text>
                <Text style={styles.summaryText}>
                  Total de deslocamento: {formatDistance(
                    state.routes.reduce((sum: number, r: RouteSegment) => sum + r.distance, 0)
                  )}
                </Text>
                <Text style={styles.summaryText}>
                  Tempo total de deslocamento: {formatDuration(
                    state.routes.reduce((sum: number, r: RouteSegment) => sum + r.duration, 0)
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
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
