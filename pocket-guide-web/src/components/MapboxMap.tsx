import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Attraction } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;

  useEffect(() => {
    if (!mapboxToken) {
      console.warn('🗺️ Mapbox token not configured');
      return;
    }

    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    console.log('🗺️ MapboxMap: Initializing with', attractions.length, 'attractions');
    if (attractions.length > 0) {
      console.log('🗺️ MapboxMap: First attraction received:', attractions[0]);
      console.log('🗺️ MapboxMap: Keys in first attraction:', Object.keys(attractions[0]));
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    // Add attractions as markers
    if (attractions.length > 0 && map.current) {
      console.log('🗺️ MapboxMap: Adding markers');
      markersRef.current = [];
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidMarkers = false;
      
      attractions.forEach((attraction, index) => {
        const attr = attraction as any;
        const lat = attr.location?.lat || attr.lat;
        const lng = attr.location?.lng || attr.lng;
        
        if (index === 0) {
          console.log('🗺️ MapboxMap: FIRST MARKER DEBUG');
          console.log('  attr:', attr);
          console.log('  attr.lat:', attr.lat);
          console.log('  attr.lng:', attr.lng);
          console.log('  attr.location:', attr.location);
          console.log('  Resolved lat:', lat);
          console.log('  Resolved lng:', lng);
        }
        
        console.log(`🗺️ MapboxMap: Marker ${index}:`, { name: attraction.name, lat, lng });
        
        if (lat !== undefined && lng !== undefined && lat !== null && lng !== null && map.current) {
          // Create marker with color based on selection
          const markerColor = index === selectedIndex ? '#10B981' : '#3B82F6';
          const marker = new mapboxgl.Marker({ color: markerColor })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2">
                  <strong>${index + 1}. ${attraction.name}</strong>
                  <p>${attr.reason || ''}</p>
                  ${attr.time ? `<p class="text-sm text-gray-600">⏰ ${attr.time}</p>` : ''}
                </div>`
              )
            )
            .addTo(map.current as mapboxgl.Map);
          
          // Add click listener to marker
          marker.getElement().addEventListener('click', () => {
            setSelectedIndex(index);
            onAttractionSelect?.(attraction, index);
          });
          
          markersRef.current.push(marker);
          bounds.extend([lng, lat]);
          hasValidMarkers = true;
        }
      });

      // Fit bounds to all markers only if we have valid markers
      if (map.current && hasValidMarkers) {
        try {
          console.log('🗺️ MapboxMap: Fitting bounds');
          (map.current as mapboxgl.Map).fitBounds(bounds, { padding: 80 });
        } catch (error) {
          console.error('❌ MapboxMap: Error fitting bounds:', error);
        }
      } else if (map.current && !hasValidMarkers) {
        console.warn('⚠️ MapboxMap: No valid markers to display');
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, attractions, zoom, center, selectedIndex, onAttractionSelect]);

  // Handle navigation between attractions
  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? attractions.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractions[newIndex], newIndex);
    
    const attr = attractions[newIndex] as any;
    const lat = attr.location?.lat || attr.lat;
    const lng = attr.location?.lng || attr.lng;
    if (map.current && lat !== undefined && lng !== undefined) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % attractions.length;
    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractions[newIndex], newIndex);
    
    const attr = attractions[newIndex] as any;
    const lat = attr.location?.lat || attr.lat;
    const lng = attr.location?.lng || attr.lng;
    if (map.current && lat !== undefined && lng !== undefined) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
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
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          
          <div className="flex-1 text-center px-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {attractions[selectedIndex]?.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedIndex + 1} de {attractions.length}
            </p>
          </div>
          
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      )}
    </div>
  );
};
