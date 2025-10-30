import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Attraction, Location } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { debug } from '../utils/debug';
import { useI18n } from '../hooks/useI18n';
import { DirectionRoute } from '../services/directionsService';

interface MapboxMapProps {
  attractions?: (Attraction | any)[];
  zoom?: number;
  center?: [number, number];
  height?: string;
  onAttractionSelect?: (attraction: any, index: number) => void;
  route?: DirectionRoute | null;
  routeOrigin?: Location | null;
  routeDestination?: Location | null;
}

/**
 * MapboxMap Component - Renderiza mapa interativo com Mapbox
 */
export const MapboxMap: React.FC<MapboxMapProps> = ({
  attractions = [],
  zoom = 12,
  center = [0, 0],
  height = '400px',
  onAttractionSelect,
  route,
  routeOrigin,
  routeDestination,
}) => {
  const { t } = useI18n()
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const attractionsRef = useRef(attractions);
  const routeLayerRef = useRef<string | null>(null);
  const routeSourceRef = useRef<string | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;

  // Helper: Extract and validate coordinates
  const getCoordinates = (attraction: any): [number, number] | null => {
    const lat = attraction?.location?.lat ?? attraction?.lat;
    const lng = attraction?.location?.lng ?? attraction?.lng;
    
    if (typeof lat === 'number' && typeof lng === 'number' && 
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [lng, lat];
    }
    return null;
  };

  // Initialize map once
  useEffect(() => {
    if (!mapboxToken || map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    debug.log('🗺️ MapboxMap: Map initialized');

    return () => {
      // Don't remove map on unmount to avoid re-renders
    };
  }, [mapboxToken, center, zoom]);

  // Add/update markers when attractions change
  useEffect(() => {
    if (!map.current || attractions.length === 0) return;

    attractionsRef.current = attractions;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    debug.log('🗺️ MapboxMap: Adding/updating markers for', attractions.length, 'attractions');
    
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidMarkers = false;
    
    attractions.forEach((attraction, index) => {
      const coords = getCoordinates(attraction);
      
      if (coords) {
        const [lng, lat] = coords;
        debug.log(`🗺️ MapboxMap: Marker ${index}:`, { name: attraction.name, lat, lng });
        
        const markerColor = index === selectedIndex ? '#10B981' : '#3B82F6';
        const marker = new mapboxgl.Marker({ color: markerColor })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-3 max-w-xs rounded-lg" style="background-color: #FFFFFF; color: #111827; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <strong style="color: #1F2937; font-size: 15px;">${index + 1}. ${attraction.name}</strong>
                <p style="font-size: 14px; margin-top: 8px; color: #374151; margin: 0;">${attraction.reason || ''}</p>
                ${attraction.time ? `<p style="font-size: 12px; color: #6B7280; margin-top: 6px;">⏰ ${attraction.time}</p>` : ''}
              </div>`
            )
          )
          .addTo(map.current as mapboxgl.Map);
        
        // Add click listener
        marker.getElement().addEventListener('click', () => {
          setSelectedIndex(index);
          onAttractionSelect?.(attraction, index);
        });
        
        markersRef.current.push(marker);
        bounds.extend([lng, lat]);
        hasValidMarkers = true;
      }
    });

    // Fit bounds to all markers
    if (hasValidMarkers && markersRef.current.length > 0) {
      try {
        debug.log('🗺️ MapboxMap: Fitting bounds to', markersRef.current.length, 'markers');
        if (markersRef.current.length === 1) {
          // Single marker: just center on it
          map.current.flyTo({
            center: markersRef.current[0].getLngLat(),
            zoom: 15,
            duration: 1000,
          });
        } else {
          // Multiple markers: fit bounds
          (map.current as mapboxgl.Map).fitBounds(bounds, { padding: 80, duration: 1000 });
        }
      } catch (error) {
        debug.error('❌ MapboxMap: Error fitting bounds:', error);
      }
    } else {
      debug.warn('⚠️ MapboxMap: No valid markers to display');
    }

    return () => {
      // Cleanup markers on unmount
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [attractions, onAttractionSelect]);

  // Update marker colors when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, index) => {
      const newColor = index === selectedIndex ? '#10B981' : '#3B82F6';
      marker.setDraggable(false); // Ensure markers stay in place
      
      // Update marker element styling
      const element = marker.getElement();
      const svg = element.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', newColor);
      }
    });

    // Optionally fly to selected marker
    if (markersRef.current[selectedIndex] && map.current) {
      const lngLat = markersRef.current[selectedIndex].getLngLat();
      debug.log('🗺️ MapboxMap: Flying to marker', selectedIndex);
      map.current.flyTo({
        center: lngLat,
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedIndex]);

  // Render route on map
  useEffect(() => {
    if (!map.current || !route) return;

    debug.log('🗺️ MapboxMap: Rendering route on map');

    // Função para renderizar rota (aguarda mapa estar pronto)
    const renderRoute = () => {
      if (!map.current) return;

      // Verificar se o mapa e estilo estão prontos
      if (!map.current.isStyleLoaded()) {
        debug.log('🗺️ MapboxMap: Style not loaded yet, waiting...');
        map.current.once('styledata', renderRoute);
        return;
      }

      // Remove existing route layer and source
      if (routeLayerRef.current && routeSourceRef.current) {
        try {
          if (map.current.getLayer(routeLayerRef.current)) {
            map.current.removeLayer(routeLayerRef.current);
          }
          if (map.current.getSource(routeSourceRef.current)) {
            map.current.removeSource(routeSourceRef.current);
          }
        } catch (error) {
          debug.error('❌ MapboxMap: Error removing existing route:', error);
        }
      }

      // Create unique IDs for this route
      const sourceId = `route-source-${Date.now()}`;
      const layerId = `route-layer-${Date.now()}`;

      routeSourceRef.current = sourceId;
      routeLayerRef.current = layerId;

      // Add GeoJSON source for route geometry
      try {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: route.geometry as unknown as GeoJSON.Geometry,
            properties: {},
          } as GeoJSON.Feature,
        });

        // Add route layer
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#6366F1', // Indigo
            'line-width': 3,
            'line-opacity': 0.8,
          },
        }, 'waterway-label'); // Insert before waterway labels

        debug.log('✅ MapboxMap: Route rendered successfully');

        // Fit map to route bounds if we have origin and destination
        if (routeOrigin && routeDestination) {
          try {
            // Validate coordinates
            const isValidOrigin = 
              typeof routeOrigin.lng === 'number' && 
              typeof routeOrigin.lat === 'number' &&
              routeOrigin.lng >= -180 && routeOrigin.lng <= 180 &&
              routeOrigin.lat >= -90 && routeOrigin.lat <= 90;
            
            const isValidDestination = 
              typeof routeDestination.lng === 'number' && 
              typeof routeDestination.lat === 'number' &&
              routeDestination.lng >= -180 && routeDestination.lng <= 180 &&
              routeDestination.lat >= -90 && routeDestination.lat <= 90;

            if (!isValidOrigin || !isValidDestination) {
              debug.warn('⚠️ MapboxMap: Invalid route coordinates', { routeOrigin, routeDestination });
              return;
            }

            // Calculate distance between origin and destination
            const lngDiff = Math.abs(routeOrigin.lng - routeDestination.lng);
            const latDiff = Math.abs(routeOrigin.lat - routeDestination.lat);
            const distance = Math.sqrt(lngDiff * lngDiff + latDiff * latDiff);

            debug.log('🗺️ MapboxMap: Route distance (degrees):', distance);

            // If points are very close (less than 0.01 degrees), use a fixed zoom
            if (distance < 0.01) {
              debug.warn('⚠️ MapboxMap: Origin and destination are too close, using fixed zoom');
              const centerLng = (routeOrigin.lng + routeDestination.lng) / 2;
              const centerLat = (routeOrigin.lat + routeDestination.lat) / 2;
              
              map.current?.flyTo({
                center: [centerLng, centerLat],
                zoom: 14,
                duration: 1000,
              });
            } else {
              // Normal fit bounds for distant points
              const bounds = new mapboxgl.LngLatBounds();
              bounds.extend([routeOrigin.lng, routeOrigin.lat]);
              bounds.extend([routeDestination.lng, routeDestination.lat]);

              try {
                map.current?.fitBounds(bounds, { padding: 80, duration: 1000, maxZoom: 18 });
              } catch (fitError) {
                debug.warn('⚠️ MapboxMap: fitBounds failed, using flyTo instead');
                const centerLng = (routeOrigin.lng + routeDestination.lng) / 2;
                const centerLat = (routeOrigin.lat + routeDestination.lat) / 2;
                map.current?.flyTo({
                  center: [centerLng, centerLat],
                  zoom: 14,
                  duration: 1000,
                });
              }
            }

            // Add markers for origin and destination
            new mapboxgl.Marker({ color: '#22C55E' }) // Green
              .setLngLat([routeOrigin.lng, routeOrigin.lat])
              .setPopup(new mapboxgl.Popup().setHTML('<strong>Saída</strong>'))
              .addTo(map.current!);

            new mapboxgl.Marker({ color: '#EF4444' }) // Red
              .setLngLat([routeDestination.lng, routeDestination.lat])
              .setPopup(new mapboxgl.Popup().setHTML('<strong>Destino</strong>'))
              .addTo(map.current!);
          } catch (error) {
            debug.error('❌ MapboxMap: Error fitting bounds to route:', error);
          }
        }
      } catch (error) {
        debug.error('❌ MapboxMap: Error rendering route:', error);
      }
    };

    renderRoute();
  }, [route, routeOrigin, routeDestination]);

  // Handle navigation between attractions
  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? attractions.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractionsRef.current[newIndex], newIndex);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % attractions.length;
    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractionsRef.current[newIndex], newIndex);
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: height,
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        className="border-2 border-gray-200 dark:border-gray-700"
      />
      
      {/* Navigation Controls */}
      {attractions.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title={t('components.mapboxMap.previous')}
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          
          <div className="flex-1 text-center px-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {attractions[selectedIndex]?.name}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedIndex + 1} de {attractions.length}
            </p>
          </div>
          
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title={t('components.mapboxMap.next')}
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      )}
    </div>
  );
};
