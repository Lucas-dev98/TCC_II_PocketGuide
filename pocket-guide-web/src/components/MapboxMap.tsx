import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Attraction } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { debug } from '../utils/debug';
import { useI18n } from '../hooks/useI18n';

interface MapboxMapProps {
  attractions?: (Attraction | any)[];
  zoom?: number;
  center?: [number, number];
  height?: string;
  onAttractionSelect?: (attraction: any, index: number) => void;
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
}) => {
  const { t } = useI18n()
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const attractionsRef = useRef(attractions);

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
              `<div class="p-2 max-w-xs">
                <strong>${index + 1}. ${attraction.name}</strong>
                <p class="text-sm mt-1">${attraction.reason || ''}</p>
                ${attraction.time ? `<p class="text-xs text-gray-600">⏰ ${attraction.time}</p>` : ''}
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
