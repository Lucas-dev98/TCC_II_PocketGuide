/**
 * geocodingService.ts - Generic geocoding service for any destination
 * Uses Nominatim (free, open-source) for coordinate resolution
 * Caches results to avoid repeated API calls
 */

import { Location } from '../types';

// Cache for geocoding results to avoid repeated API calls
const geocodingCache: Record<string, Location> = {};

/**
 * Get coordinates for a location using Nominatim (free geocoding)
 * Works for any destination worldwide
 */
export const geocodeLocation = async (locationName: string): Promise<Location | null> => {
  try {
    // Check cache first
    const cacheKey = locationName.toLowerCase();
    if (geocodingCache[cacheKey]) {
      console.log(`🗺️ Geocoding cache hit for "${locationName}"`);
      return geocodingCache[cacheKey];
    }

    // Use Nominatim API (free, no API key needed)
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', locationName);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PocketGuide-App'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Nominatim API error for "${locationName}": ${response.status}`);
      return null;
    }

    const results = await response.json() as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (results.length === 0) {
      console.warn(`⚠️ No geocoding results for "${locationName}"`);
      return null;
    }

    const result = results[0];
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Cache the result
    geocodingCache[cacheKey] = location;
    console.log(`✅ Geocoded "${locationName}" to [${location.lat}, ${location.lng}]`);

    return location;
  } catch (error) {
    console.error(`❌ Geocoding error for "${locationName}":`, error);
    return null;
  }
};

/**
 * Get coordinates for a specific place within a city/destination
 * Example: "Eiffel Tower, Paris" -> [48.8584, 2.2945]
 */
export const geocodePlaceInDestination = async (
  placeName: string,
  destination: string
): Promise<Location | null> => {
  try {
    // Try full address first (place + destination)
    const fullAddress = `${placeName}, ${destination}`;
    
    // Check cache
    const cacheKey = fullAddress.toLowerCase();
    if (geocodingCache[cacheKey]) {
      console.log(`🗺️ Geocoding cache hit for "${fullAddress}"`);
      return geocodingCache[cacheKey];
    }

    // Use Nominatim API
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.append('q', fullAddress);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PocketGuide-App'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Nominatim API error for "${fullAddress}": ${response.status}`);
      // Fallback: try just the place name
      return geocodeLocation(placeName);
    }

    const results = await response.json() as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (results.length === 0) {
      console.warn(`⚠️ No geocoding results for "${fullAddress}", trying place only`);
      // Fallback: try just the place name
      return geocodeLocation(placeName);
    }

    const result = results[0];
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Cache the result
    geocodingCache[cacheKey] = location;
    console.log(`✅ Geocoded "${fullAddress}" to [${location.lat}, ${location.lng}]`);

    return location;
  } catch (error) {
    console.error(`❌ Geocoding error for "${placeName}, ${destination}":`, error);
    // Fallback to destination center
    return geocodeLocation(destination);
  }
};

/**
 * Clear geocoding cache (useful for testing or freeing memory)
 */
export const clearGeocodeCache = (): void => {
  Object.keys(geocodingCache).forEach(key => delete geocodingCache[key]);
  console.log('🧹 Geocoding cache cleared');
};

/**
 * Get cache size (for debugging)
 */
export const getGeocacheSize = (): number => {
  return Object.keys(geocodingCache).length;
};
