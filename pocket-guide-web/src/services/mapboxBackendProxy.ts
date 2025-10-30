/**
 * Backend Mapbox Proxy Service
 * 
 * Calls our backend API proxy instead of calling Mapbox directly.
 * This keeps API keys secure on the backend.
 * 
 * Features:
 * - Secure backend proxy (API key never exposed)
 * - Firebase token authentication
 * - Rate limiting per user
 * - Geocoding (address → coordinates)
 * - Reverse geocoding (coordinates → address)
 */

import { auth } from "./firebase";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Geocoding result from Mapbox
 */
export interface GeocodeResult {
  id: string;
  name: string;
  short_name?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  place_types: string[];
  relevance: number;
  bbox?: [number, number, number, number];
}

/**
 * Geocoding response
 */
export interface GeocodeResponse {
  success: boolean;
  query: string;
  total: number;
  results: GeocodeResult[];
}

/**
 * Search for a location (geocoding)
 * 
 * Converts address/city name to coordinates
 * Example: "Paris, France" → { latitude: 48.8566, longitude: 2.3522 }
 */
export const geocodeLocation = async (
  query: string,
  latitude?: number,
  longitude?: number,
  limit: number = 5
): Promise<GeocodeResult[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Not authenticated');
      return [];
    }

    const token = await currentUser.getIdToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return [];
    }

    console.log('📍 Geocoding location via backend:', query);

    const response = await fetch(`${BACKEND_API_URL}/api/mapbox/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        latitude,
        longitude,
        limit,
      }),
    });

    if (response.status === 401) {
      console.error('❌ Unauthorized');
      return [];
    }

    if (response.status === 429) {
      console.error('⚠️ Rate limited');
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      console.error('❌ Backend error:', response.status);
      return [];
    }

    const data: GeocodeResponse = await response.json();
    console.log('✅ Geocoding results:', data.results.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error geocoding location:', error);
    return [];
  }
};

/**
 * Reverse geocode: get address from coordinates
 */
export const reverseGeocodeLocation = async (
  latitude: number,
  longitude: number,
  limit: number = 1
): Promise<GeocodeResult[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Not authenticated');
      return [];
    }

    const token = await currentUser.getIdToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return [];
    }

    console.log('📍 Reverse geocoding via backend:', { latitude, longitude });

    const response = await fetch(
      `${BACKEND_API_URL}/api/mapbox/reverse?longitude=${longitude}&latitude=${latitude}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Reverse geocode failed:', response.status);
      return [];
    }

    const data: GeocodeResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('❌ Error reverse geocoding:', error);
    return [];
  }
};
