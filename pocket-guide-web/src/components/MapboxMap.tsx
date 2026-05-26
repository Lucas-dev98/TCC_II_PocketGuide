import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  onAttractionSelect,
  route,
  routeOrigin,
  routeDestination,
}) => {
  const { t } = useI18n()
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerAttractionIndicesRef = useRef<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectableIndices, setSelectableIndices] = useState<number[]>([]);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const attractionsRef = useRef(attractions);
  const routeLayerRef = useRef<string | null>(null);
  const routeSourceRef = useRef<string | null>(null);
  const dayTrailLayerRef = useRef<string | null>(null);
  const dayTrailSourceRef = useRef<string | null>(null);
  const mapFallbackAppliedRef = useRef(false);
  const mapErrorLogCountRef = useRef(0);

  const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
  const mapboxStyleEnabledFlag = String(import.meta.env.VITE_MAPBOX_STYLE_ENABLED || '').toLowerCase();
  const hasMapboxToken = Boolean(mapboxToken && mapboxToken.trim().length > 0);
  const mapboxStyleExplicitlyDisabled =
    mapboxStyleEnabledFlag === '0' ||
    mapboxStyleEnabledFlag === 'false' ||
    mapboxStyleEnabledFlag === 'no' ||
    mapboxStyleEnabledFlag === 'off';
  const useMapboxStyle = hasMapboxToken && !mapboxStyleExplicitlyDisabled;
  const osmRasterStyle: mapboxgl.Style = useMemo(() => ({
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-raster',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  }), []);
  const primaryMapStyle: string | mapboxgl.Style = useMemo(
    () => (useMapboxStyle ? 'mapbox://styles/mapbox/streets-v12' : osmRasterStyle),
    [useMapboxStyle, osmRasterStyle]
  );

  const switchToOsmFallback = () => {
    if (!map.current || mapFallbackAppliedRef.current) return;

    mapFallbackAppliedRef.current = true;
    debug.warn('⚠️ MapboxMap: switching to OSM fallback style');

    try {
      map.current.setStyle(osmRasterStyle);
    } catch (styleError) {
      debug.error('❌ MapboxMap: failed to apply OSM fallback style', styleError);
    }
  };

  const createMarkerElement = (index: number, isSelected: boolean): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'pg-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '9999px';
    el.style.border = '2px solid #ffffff';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '12px';
    el.style.fontWeight = '700';
    el.style.color = '#ffffff';
    el.style.cursor = 'pointer';
    el.style.backgroundColor = isSelected ? '#10B981' : '#2563EB';
    el.textContent = String(index + 1);
    return el;
  };

  const isValidLatLng = (lat: number, lng: number): boolean => {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      !(lat === 0 && lng === 0) &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  };

  // Helper: Extract and validate coordinates
  const getCoordinates = (attraction: any): [number, number] | null => {
    const rawLat = attraction?.location?.lat ?? attraction?.lat;
    const rawLng = attraction?.location?.lng ?? attraction?.lng;

    const lat =
      typeof rawLat === 'number'
        ? rawLat
        : typeof rawLat === 'string'
          ? Number.parseFloat(rawLat)
          : NaN;

    const lng =
      typeof rawLng === 'number'
        ? rawLng
        : typeof rawLng === 'string'
          ? Number.parseFloat(rawLng)
          : NaN;
    
    const normalValid = isValidLatLng(lat, lng);
    const swappedValid = isValidLatLng(lng, lat);
    const hasCenterHint =
      Array.isArray(center) &&
      center.length === 2 &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1]) &&
      !(center[0] === 0 && center[1] === 0);

    let resolvedLng = lng;
    let resolvedLat = lat;
    let usedSwapped = false;

    // If values may be inverted, use destination center hint to pick the most plausible position.
    if (normalValid && swappedValid && hasCenterHint) {
      const distanceNormal = Math.hypot(lng - center[0], lat - center[1]);
      const distanceSwapped = Math.hypot(lat - center[0], lng - center[1]);
      if (distanceSwapped + 0.2 < distanceNormal) {
        resolvedLng = lat;
        resolvedLat = lng;
        usedSwapped = true;
      }
    } else if (!normalValid && swappedValid) {
      resolvedLng = lat;
      resolvedLat = lng;
      usedSwapped = true;
    }

    debug.log('🗺️ MapboxMap.getCoordinates:', {
      name: attraction?.name,
      rawLat,
      rawLng,
      parsedLat: lat,
      parsedLng: lng,
      resolvedLat,
      resolvedLng,
      usedSwapped,
      isValid: isValidLatLng(resolvedLat, resolvedLng),
    });
    
    if (isValidLatLng(resolvedLat, resolvedLng)) {
      return [resolvedLng, resolvedLat];
    }
    return null;
  };

  const clearDayTrail = () => {
    if (!map.current) return;

    if (dayTrailLayerRef.current && map.current.getLayer(dayTrailLayerRef.current)) {
      map.current.removeLayer(dayTrailLayerRef.current);
    }

    if (dayTrailSourceRef.current && map.current.getSource(dayTrailSourceRef.current)) {
      map.current.removeSource(dayTrailSourceRef.current);
    }

    dayTrailLayerRef.current = null;
    dayTrailSourceRef.current = null;
  };

  const getSelectableAttractionIndices = (): number[] => {
    return selectableIndices;
  };

  const getIframeMapUrl = (lng: number, lat: number) => {
    const delta = 0.06;
    const left = lng - delta;
    const right = lng + delta;
    const top = lat + delta;
    const bottom = lat - delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapboxgl.supported()) {
      debug.warn('⚠️ MapboxMap: WebGL not supported, using iframe fallback map');
      setUseIframeFallback(true);
      return;
    }

    if (map.current) {
      map.current.resize();
      return;
    }

    if (useMapboxStyle) {
      mapboxgl.accessToken = mapboxToken;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: primaryMapStyle,
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      map.current?.resize();

      // Safety net: if tiles never load in token mode, force OSM fallback.
      if (useMapboxStyle) {
        setTimeout(() => {
          if (!map.current || mapFallbackAppliedRef.current) return;
          if (!map.current.areTilesLoaded()) {
            debug.warn('⚠️ MapboxMap: tiles not loaded, forcing OSM fallback');
            switchToOsmFallback();

            // If even fallback style cannot load tiles, switch to iframe map.
            setTimeout(() => {
              if (!map.current) return;
              if (!map.current.areTilesLoaded()) {
                debug.warn('⚠️ MapboxMap: fallback tiles still not loaded, using iframe fallback map');
                map.current.remove();
                map.current = null;
                setUseIframeFallback(true);
              }
            }, 2500);
          }
        }, 4000);
      }
    });

    debug.log('🗺️ MapboxMap: Map initialized', {
      hasMapboxToken,
      useMapboxStyle,
      style: useMapboxStyle ? 'mapbox-streets-v12' : 'osm-raster',
    });

    map.current.on('error', (event) => {
      const errorMessage = String(event?.error?.message || event || 'unknown map error');
      const normalizedMessage = errorMessage.toLowerCase();
      const isNoisyAbort =
        errorMessage.includes('ERR_ABORTED') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('manifest.json');

      const shouldFallbackToOSM =
        useMapboxStyle &&
        !mapFallbackAppliedRef.current &&
        (normalizedMessage.includes('style') ||
          normalizedMessage.includes('unauthorized') ||
          normalizedMessage.includes('access token') ||
          normalizedMessage.includes('failed to fetch') ||
          normalizedMessage.includes('network') ||
          normalizedMessage.includes('401') ||
          normalizedMessage.includes('403') ||
          normalizedMessage.includes('tiles'));

      if (shouldFallbackToOSM) {
        switchToOsmFallback();

        // Escalate to iframe fallback when style switching also fails.
        setTimeout(() => {
          if (!map.current) return;
          if (!map.current.areTilesLoaded()) {
            debug.warn('⚠️ MapboxMap: switching to iframe fallback after repeated map errors');
            map.current.remove();
            map.current = null;
            setUseIframeFallback(true);
          }
        }, 1500);
        return;
      }

      if (isNoisyAbort) {
        if (mapErrorLogCountRef.current < 2) {
          debug.warn('⚠️ MapboxMap: transient network error suppressed', errorMessage);
          mapErrorLogCountRef.current += 1;
        }
        return;
      }

      debug.error('❌ MapboxMap: map error event', event?.error || event);
    });

    // Add ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        debug.log('🗺️ MapboxMap: Container resized, triggering map.resize()');
        map.current.resize();
      }
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();

      // Remove markers and map instance so remounts bind to the current container.
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      markerAttractionIndicesRef.current = [];

      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      routeLayerRef.current = null;
      routeSourceRef.current = null;
      dayTrailLayerRef.current = null;
      dayTrailSourceRef.current = null;
      mapFallbackAppliedRef.current = false;
    };
  }, [useMapboxStyle, hasMapboxToken, osmRasterStyle, primaryMapStyle, mapboxToken, center, zoom]);

  // Add/update markers when attractions change
  useEffect(() => {
    if (!map.current || attractions.length === 0) return;

    attractionsRef.current = attractions;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    markerAttractionIndicesRef.current = [];

    debug.log('🗺️ MapboxMap: Adding/updating markers for', attractions.length, 'attractions');
    debug.log('🗺️ MapboxMap: First attraction details:', {
      name: attractions[0]?.name,
      lat: attractions[0]?.lat,
      lng: attractions[0]?.lng,
      location: attractions[0]?.location,
      allAttraction: attractions[0],
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidMarkers = false;
    
    attractions.forEach((attraction, index) => {
      const coords = getCoordinates(attraction);
      
      if (coords) {
        const [lng, lat] = coords;
        debug.log(`🗺️ MapboxMap: Marker ${index}:`, { name: attraction.name, lat, lng });
        
        const markerElement = createMarkerElement(index, index === selectedIndex);
        const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'bottom' })
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
        markerAttractionIndicesRef.current.push(index);
        bounds.extend([lng, lat]);
        hasValidMarkers = true;
      }
    });

    setSelectableIndices([...markerAttractionIndicesRef.current]);

    // Fit bounds to all markers
    if (hasValidMarkers && markersRef.current.length > 0) {
      try {
        debug.log('🗺️ MapboxMap: Fitting bounds to', markersRef.current.length, 'markers');
        debug.log('🗺️ MapboxMap: First marker coords:', markersRef.current[0]?.getLngLat());
        debug.log('🗺️ MapboxMap: Last marker coords:', markersRef.current[markersRef.current.length - 1]?.getLngLat());
        
        if (markersRef.current.length === 1) {
          // Single marker: just center on it
          const coords = markersRef.current[0].getLngLat();
          debug.log('🗺️ MapboxMap: Single marker, flying to:', coords);
          map.current.flyTo({
            center: coords,
            zoom: 15,
            duration: 1000,
          });
        } else {
          // Multiple markers: fit bounds
          debug.log('🗺️ MapboxMap: Multiple markers, fitting bounds');
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
      markerAttractionIndicesRef.current = [];
    };
  }, [attractions, onAttractionSelect]);

  // Update marker colors when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, markerIndex) => {
      const attractionIndex = markerAttractionIndicesRef.current[markerIndex];
      const newColor = attractionIndex === selectedIndex ? '#10B981' : '#2563EB';
      marker.setDraggable(false);

      const element = marker.getElement();
      element.style.backgroundColor = newColor;
    });

    // Optionally fly to selected marker
    const markerPosition = markerAttractionIndicesRef.current.indexOf(selectedIndex);
    if (markerPosition >= 0 && markersRef.current[markerPosition] && map.current) {
      const lngLat = markersRef.current[markerPosition].getLngLat();
      debug.log('🗺️ MapboxMap: Flying to marker', selectedIndex);
      map.current.flyTo({
        center: lngLat,
        zoom: 15,
        duration: 1000,
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    const selectable = getSelectableAttractionIndices();

    if (attractions.length === 0 || selectable.length === 0) {
      setSelectedIndex(0);
      return;
    }

    const isCurrentSelectable = selectable.includes(selectedIndex);
    if (!isCurrentSelectable || selectedIndex >= attractions.length) {
      setSelectedIndex(selectable[0]);
    }
  }, [attractions, selectedIndex, selectableIndices]);

  // Render a light day trail connecting all valid attraction points.
  useEffect(() => {
    if (!map.current) return;

    const renderDayTrail = () => {
      if (!map.current) return;

      if (!map.current.isStyleLoaded()) {
        map.current.once('styledata', renderDayTrail);
        return;
      }

      try {
        clearDayTrail();

        // Keep detailed navigation route as visual priority when available.
        if (route) return;

        const points = attractions
          .map((attraction) => getCoordinates(attraction))
          .filter((coords): coords is [number, number] => Boolean(coords));

        if (points.length < 2) return;

        const sourceId = `day-trail-source-${Date.now()}`;
        const layerId = `day-trail-layer-${Date.now()}`;

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: points,
            },
            properties: {},
          } as GeoJSON.Feature,
        });

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#0EA5E9',
            'line-width': 2,
            'line-opacity': 0.75,
            'line-dasharray': [2, 2],
          },
        });

        dayTrailSourceRef.current = sourceId;
        dayTrailLayerRef.current = layerId;
      } catch (error) {
        debug.error('❌ MapboxMap: Error rendering day trail:', error);
      }
    };

    renderDayTrail();

    return () => {
      clearDayTrail();
    };
  }, [attractions, route]);

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
    const selectable = getSelectableAttractionIndices();
    if (selectable.length === 0) return;

    const currentPos = selectable.indexOf(selectedIndex);
    const newPos = currentPos <= 0 ? selectable.length - 1 : currentPos - 1;
    const newIndex = selectable[newPos];

    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractionsRef.current[newIndex], newIndex);
  };

  const handleNext = () => {
    const selectable = getSelectableAttractionIndices();
    if (selectable.length === 0) return;

    const currentPos = selectable.indexOf(selectedIndex);
    const newPos = currentPos < 0 || currentPos === selectable.length - 1 ? 0 : currentPos + 1;
    const newIndex = selectable[newPos];

    setSelectedIndex(newIndex);
    onAttractionSelect?.(attractionsRef.current[newIndex], newIndex);
  };

  const selectedMapIndex = selectableIndices.includes(selectedIndex)
    ? selectedIndex
    : selectableIndices[0] ?? selectedIndex;
  const selectedMapPosition = Math.max(0, selectableIndices.indexOf(selectedMapIndex));
  const selectedCoords = getCoordinates(attractions[selectedMapIndex]);
  const fallbackLng = selectedCoords?.[0] ?? center[0] ?? 0;
  const fallbackLat = selectedCoords?.[1] ?? center[1] ?? 0;
  const iframeMapUrl = getIframeMapUrl(fallbackLng, fallbackLat);

  return (
    <div className="relative w-full">
      <div className="mapbox-wrapper">
        {useIframeFallback ? (
          <iframe
            title="OpenStreetMap fallback"
            src={iframeMapUrl}
            className="mapbox-container-mobile border-2 border-gray-200 dark:border-gray-700"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div
            ref={mapContainer}
            className="mapbox-container-mobile border-2 border-gray-200 dark:border-gray-700"
          />
        )}
        {false && !hasMapboxToken && (
          <div className="absolute top-3 left-3 z-10 rounded-md bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
            Mapa em modo offline: configure VITE_MAPBOX_API_KEY para usar o estilo Mapbox original.
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      {selectableIndices.length > 1 && (
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
              {attractions[selectedMapIndex]?.name}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {selectedMapPosition + 1} de {selectableIndices.length}
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
