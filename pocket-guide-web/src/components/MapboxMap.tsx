import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Attraction } from '../types';

interface MapboxMapProps {
  attractions?: (Attraction | any)[];
  zoom?: number;
  center?: [number, number];
  height?: string;
}

/**
 * MapboxMap Component - Renderiza mapa interativo com Mapbox
 */
export const MapboxMap: React.FC<MapboxMapProps> = ({
  attractions = [],
  zoom = 12,
  center = [0, 0],
  height = '400px',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2"><strong>${attraction.name}</strong><p>${attr.reason || ''}</p></div>`
              )
            )
            .addTo(map.current as mapboxgl.Map);
          
          bounds.extend([lng, lat]);
          hasValidMarkers = true;
        }
      });

      // Fit bounds to all markers only if we have valid markers
      if (map.current && hasValidMarkers) {
        try {
          console.log('🗺️ MapboxMap: Fitting bounds');
          (map.current as mapboxgl.Map).fitBounds(bounds, { padding: 50 });
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
  }, [mapboxToken, attractions, zoom, center]);

  return (
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
  );
};
