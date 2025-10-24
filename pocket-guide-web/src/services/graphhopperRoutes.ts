/**
 * graphhopperRoutes.ts - Service to calculate routes between attractions using GraphHopper
 * Includes retry logic and structured logging for resilient API calls
 */

import { Attraction } from '../types';
import { withRetry } from '../utils/retryService';
import logger from './logger';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  from: Attraction;
  to: Attraction;
  distance: number; // meters
  duration: number; // seconds
  polyline: string; // encoded polyline
}

const GRAPHHOPPER_API_KEY = import.meta.env.VITE_GRAPHHOPPER_API_KEY;

/**
 * Calculate routes between consecutive attractions for a day
 */
export async function calculateDayRoutes(attractions: Attraction[]): Promise<RouteSegment[]> {
  if (attractions.length < 2) {
    return [];
  }

  logger.debug('Calculating routes for day', { attractionCount: attractions.length });

  // Sort by time
  const sorted = [...attractions].sort((a, b) => a.time.localeCompare(b.time));
  const routes: RouteSegment[] = [];

  // Calculate route between each consecutive pair
  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to = sorted[i + 1];

    try {
      const route = await getRoute(from.location, to.location);
      routes.push({
        from,
        to,
        distance: route.distance,
        duration: route.duration,
        polyline: route.polyline,
      });
      logger.debug(`Route calculated: ${from.name} -> ${to.name}`, {
        distance: route.distance,
        duration: route.duration,
      });
    } catch (error) {
      logger.error(
        `Error calculating route from ${from.name} to ${to.name}`,
        error instanceof Error ? error : new Error(String(error))
      );
      // Continue with next route
    }
  }

  logger.info('Day routes calculated successfully', { routeCount: routes.length });
  return routes;
}

/**
 * Get route between two locations using GraphHopper with retry logic
 */
async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ distance: number; duration: number; polyline: string }> {
  if (!GRAPHHOPPER_API_KEY) {
    logger.warn('GraphHopper API key not found, using fallback route');
    return getFallbackRoute(from, to);
  }

  try {
    // Use retry logic for resilient API calls
    const result = await withRetry(
      () =>
        (async () => {
          const url = new URL('https://graphhopper.com/api/1/route');
          url.searchParams.append('point', `${from.lat},${from.lng}`);
          url.searchParams.append('point', `${to.lat},${to.lng}`);
          url.searchParams.append('vehicle', 'car');
          url.searchParams.append('locale', 'pt');
          url.searchParams.append('points_encoded', 'true');
          url.searchParams.append('key', GRAPHHOPPER_API_KEY);

          const response = await fetch(url.toString());

          if (!response.ok) {
            throw new Error(`GraphHopper API error: ${response.status}`);
          }

          const data = await response.json();

          if (data.paths && data.paths.length > 0) {
            const path = data.paths[0];
            return {
              distance: path.distance || 0,
              duration: Math.round((path.time || 0) / 1000), // Convert ms to seconds
              polyline: path.points || '',
            };
          }

          return null;
        })(),
      {
        maxRetries: 2,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        multiplier: 2,
        onRetry: (attempt, delay, error) => {
          logger.warn(`GraphHopper route retry attempt ${attempt}`, {
            delay,
            error: error?.message,
          });
        },
      }
    );

    if (result) {
      return result;
    }

    logger.debug('GraphHopper returned no path, using fallback');
    return getFallbackRoute(from, to);
  } catch (error) {
    logger.error(
      'Error fetching route from GraphHopper after retries',
      error instanceof Error ? error : new Error(String(error))
    );
    return getFallbackRoute(from, to);
  }
}

/**
 * Calculate approximate distance and time between two points
 * Using Haversine formula for distance
 */
function getFallbackRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): { distance: number; duration: number; polyline: string } {
  // Haversine formula for distance
  const R = 6371; // Earth's radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.round(R * c * 1000); // in meters

  // Estimate duration: average speed of 40 km/h in cities
  const durationSeconds = Math.round((distance / 40000) * 3600);

  // Simple polyline encoding
  const polyline = encodePolyline([from, to]);

  return {
    distance,
    duration: durationSeconds,
    polyline,
  };
}

/**
 * Encode polyline to compressed format (simple version)
 */
function encodePolyline(points: { lat: number; lng: number }[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round((point.lat - prevLat) * 1e5);
    const lng = Math.round((point.lng - prevLng) * 1e5);

    encoded += encodeValue(lat) + encodeValue(lng);

    prevLat = point.lat;
    prevLng = point.lng;
  }

  return encoded;
}

/**
 * Encode individual value for polyline compression
 */
function encodeValue(value: number): string {
  let encoded = '';
  let v = value << 1;
  if (value < 0) v = ~v;

  while (v >= 0x20) {
    encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  encoded += String.fromCharCode(v + 63);

  return encoded;
}

/**
 * Decode polyline string to coordinates
 */
export function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    });
  }

  return points;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
