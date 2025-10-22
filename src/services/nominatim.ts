/**
 * Nominatim Service - OpenStreetMap Geocoding & Search
 * Free alternative to Google Places API
 * https://nominatim.org/
 */

export interface NominatimPlace {
  osm_id: string | number;
  display_name: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
  icon?: string;
  importance?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Search for cities/places by query
 * @param query Search term (e.g., "Lisboa, Portugal")
 * @param limit Maximum results
 */
export async function searchPlaces(
  query: string,
  limit: number = 5
): Promise<NominatimPlace[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PocketGuideApp/1.0.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimPlace[] = await response.json();
    return data;
  } catch (error) {
    console.error('Nominatim search error:', error);
    throw error;
  }
}

/**
 * Search for cities only
 * @param query Search term
 * @param limit Maximum results
 */
export async function searchCities(
  query: string,
  limit: number = 5
): Promise<NominatimPlace[]> {
  const results = await searchPlaces(query, limit * 2); // Get more results to filter
  return results.filter(
    (place) =>
      place.class === 'place' &&
      (place.type === 'city' ||
        place.type === 'town' ||
        place.type === 'village' ||
        place.type === 'county')
  );
}

/**
 * Search for attractions (restaurants, museums, etc)
 * @param query Search term (e.g., "restaurants", "museums")
 * @param latitude Center latitude
 * @param longitude Center longitude
 * @param radius Search radius in kilometers
 */
export async function searchAttractions(
  query: string,
  latitude: number,
  longitude: number,
  radius: number = 5
): Promise<NominatimPlace[]> {
  try {
    const bbox = calculateBbox(latitude, longitude, radius);
    const encodedQuery = encodeURIComponent(query);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&viewbox=${bbox}&bounded=1&limit=20&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PocketGuideApp/1.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimPlace[] = await response.json();
    return data;
  } catch (error) {
    console.error('Nominatim attractions search error:', error);
    throw error;
  }
}

/**
 * Get coordinates from place name (forward geocoding)
 * @param placeName Place name or address
 */
export async function geocode(placeName: string): Promise<Coordinates | null> {
  try {
    const results = await searchPlaces(placeName, 1);
    if (results.length === 0) return null;

    const place = results[0];
    return {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get place name from coordinates (reverse geocoding)
 * @param latitude Latitude
 * @param longitude Longitude
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'PocketGuideApp/1.0.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return data.address?.city || data.address?.town || data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Calculate bounding box from center point and radius
 * @param latitude Center latitude
 * @param longitude Center longitude
 * @param radiusKm Radius in kilometers
 */
function calculateBbox(
  latitude: number,
  longitude: number,
  radiusKm: number
): string {
  // Rough conversion: 1 degree ≈ 111 km
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

  const minLat = longitude - lngDelta;
  const maxLat = longitude + lngDelta;
  const minLon = latitude - latDelta;
  const maxLon = latitude + latDelta;

  return `${minLat},${minLon},${maxLat},${maxLon}`;
}

/**
 * Get popular attractions near a city
 * @param city City name
 * @param category Category (restaurant, museum, park, etc)
 */
export async function getPopularAttractions(
  city: string,
  category: string = 'restaurant'
): Promise<NominatimPlace[]> {
  try {
    // First get city coordinates
    const coordinates = await geocode(city);
    if (!coordinates) {
      console.error(`City not found: ${city}`);
      return [];
    }

    // Search for attractions in that city
    return searchAttractions(category, coordinates.latitude, coordinates.longitude, 10);
  } catch (error) {
    console.error('Get popular attractions error:', error);
    return [];
  }
}
