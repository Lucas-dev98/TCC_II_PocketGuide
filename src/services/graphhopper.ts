/**
 * GraphHopper Service - Route Optimization & Directions
 * Free alternative to Google Directions API
 * https://graphhopper.com/
 * 
 * Free tier: 20,000 requests/month (enough for MVP)
 * Get API key at: https://graphhopper.com/dashboard
 */

export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteResponse {
  distance: number; // in meters
  time: number; // in milliseconds
  points: {
    coordinates: Array<[number, number]>; // [lng, lat] format
  };
  polyline?: string;
}

export interface OptimizedRoute {
  totalDistance: number;
  totalTime: number;
  points: RoutePoint[];
  coordinates: Array<{ latitude: number; longitude: number }>;
}

const GRAPHHOPPER_BASE_URL = 'https://graphhopper.com/api/1';

/**
 * Get GraphHopper API key from environment
 */
function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_GRAPHHOPPER_API_KEY;
  if (!key) {
    console.warn(
      'GraphHopper API key not configured. Using demo key with limited requests.'
    );
    return 'a6d0ab14-5e38-48b1-8880-5a7fe4ff5820'; // Demo key (limited)
  }
  return key;
}

/**
 * Get route between two points
 * @param start Starting point
 * @param end Ending point
 * @param vehicle Vehicle type (car, bike, foot, etc)
 */
export async function getRoute(
  start: RoutePoint,
  end: RoutePoint,
  vehicle: string = 'car'
): Promise<OptimizedRoute | null> {
  try {
    const apiKey = getApiKey();
    const params = new URLSearchParams({
      key: apiKey,
      points: `${start.latitude},${start.longitude}|${end.latitude},${end.longitude}`,
      vehicle,
      locale: 'pt',
    });

    const response = await fetch(`${GRAPHHOPPER_BASE_URL}/route?${params}`);

    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.paths || data.paths.length === 0) {
      throw new Error('No route found');
    }

    const path = data.paths[0];

    // Decode polyline to coordinates
    const coordinates = decodePolyline(path.points);

    return {
      totalDistance: path.distance,
      totalTime: path.time,
      points: [start, end],
      coordinates: coordinates.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      })),
    };
  } catch (error) {
    console.error('GraphHopper route error:', error);
    return null;
  }
}

/**
 * Get optimized route visiting multiple points (TSP solver)
 * @param points Array of points to visit
 * @param vehicle Vehicle type
 */
export async function getOptimizedRoute(
  points: RoutePoint[],
  vehicle: string = 'car'
): Promise<OptimizedRoute | null> {
  try {
    if (points.length < 2) {
      throw new Error('At least 2 points required');
    }

    const apiKey = getApiKey();

    // Build routing request
    const request = {
      vehicles: [
        {
          vehicle_id: 'vehicle_1',
          start_location: [points[0].longitude, points[0].latitude],
          profile: vehicle,
        },
      ],
      customers: points.slice(1).map((point, index) => ({
        id: `customer_${index}`,
        location: [point.longitude, point.latitude],
        name: point.name || `Point ${index + 1}`,
      })),
      objectives: [{ type: 'minimize', value: 'completion_time' }],
    };

    const response = await fetch(`${GRAPHHOPPER_BASE_URL}/vrp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    let totalDistance = 0;
    let totalTime = 0;

    // Extract all coordinates from activities
    const coordinates: Array<{ latitude: number; longitude: number }> = [];

    if (route.activities) {
      route.activities.forEach((activity: any) => {
        if (activity.location) {
          coordinates.push({
            latitude: activity.location[1],
            longitude: activity.location[0],
          });
        }
      });
    }

    if (route.legs) {
      route.legs.forEach((leg: any) => {
        totalDistance += leg.distance || 0;
        totalTime += leg.duration || 0;
      });
    }

    return {
      totalDistance,
      totalTime,
      points,
      coordinates,
    };
  } catch (error) {
    console.error('GraphHopper optimized route error:', error);
    return null;
  }
}

/**
 * Decode Google polyline format
 * Used by GraphHopper to encode route points
 */
function decodePolyline(
  polyline: string
): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let lat = 0;
  let lng = 0;

  for (let i = 0; i < polyline.length; ) {
    let s = 0;
    let changeInLatitude = 0;

    do {
      const b = polyline.charCodeAt(i++) - 63 - (s > 0 ? 32 : 0);
      changeInLatitude |= (b & 0x1f) << s;
      s += 5;
    } while (s < 32 && polyline[i - 1] > '@');

    s = 0;
    let changeInLongitude = 0;

    do {
      const b = polyline.charCodeAt(i++) - 63 - (s > 0 ? 32 : 0);
      changeInLongitude |= (b & 0x1f) << s;
      s += 5;
    } while (s < 32 && polyline[i - 1] > '@');

    lat += changeInLatitude > 0 ? changeInLatitude : changeInLatitude;
    lng += changeInLongitude > 0 ? changeInLongitude : changeInLongitude;

    points.push([lat * 1e-5, lng * 1e-5]);
  }

  return points;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format time for display
 */
export function formatTime(milliseconds: number): string {
  const minutes = Math.round(milliseconds / 60000);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}
