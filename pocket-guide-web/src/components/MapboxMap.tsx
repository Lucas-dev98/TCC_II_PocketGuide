import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Attraction } from '../types';

interface MapboxMapProps {
  attractions?: Attraction[];
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
      
      attractions.forEach((attraction, index) => {
        const lat = attraction.location?.lat || attraction.lat;
        const lng = attraction.location?.lng || attraction.lng;
        
        console.log(`🗺️ MapboxMap: Marker ${index}:`, { name: attraction.name, lat, lng });
        
        if (lat && lng && map.current) {
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2"><strong>${attraction.name}</strong><p>${attraction.reason || ''}</p></div>`
              )
            )
            .addTo(map.current as mapboxgl.Map);
          
          bounds.extend([lng, lat]);
        }
      });

      // Fit bounds to all markers
      if (map.current) {
        console.log('🗺️ MapboxMap: Fitting bounds');
        (map.current as mapboxgl.Map).fitBounds(bounds, { padding: 50 });
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
