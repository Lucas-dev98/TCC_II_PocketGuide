/**
 * User Location Service
 * Handles retrieval of user's current location via browser geolocation API
 */

import { Location } from '../types';
import logger from './logger';

/**
 * Get user's current location from browser
 * Uses HTML5 Geolocation API
 */
export const getUserLocation = (): Promise<Location | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      logger.warn('⚠️ Geolocation not supported by browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        logger.info('📍 User location retrieved', {
          lat: latitude,
          lng: longitude,
        });
        
        resolve({
          lat: latitude,
          lng: longitude,
          address: 'User Location',
        });
      },
      (error) => {
        logger.warn('⚠️ Failed to get user location', {
          code: error.code,
          message: error.message,
        });
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes cache
      }
    );
  });
};

/**
 * Get user's country from location coordinates
 * Uses reverse geocoding (simple country detection based on coordinates)
 */
export const detectCountryFromCoordinates = (lat: number, lng: number): string => {
  // Brazil bounds
  if (lat >= -33.7683 && lat <= 5.2419 && lng >= -73.9830 && lng <= -28.8383) {
    return 'Brazil';
  }
  
  // Argentina
  if (lat >= -55.75 && lat <= -21.78 && lng >= -73.56 && lng <= -53.63) {
    return 'Argentina';
  }

  // Chile
  if (lat >= -56.51 && lat <= -17.50 && lng >= -81.63 && lng <= -66.38) {
    return 'Chile';
  }

  // Peru
  if (lat >= -18.35 && lat <= 0.04 && lng >= -81.23 && lng <= -68.67) {
    return 'Peru';
  }

  // Colombia
  if (lat >= -4.23 && lat <= 12.46 && lng >= -81.81 && lng <= -66.87) {
    return 'Colombia';
  }

  // Venezuela
  if (lat >= 0.64 && lat <= 12.20 && lng >= -73.37 && lng <= -59.80) {
    return 'Venezuela';
  }

  // Uruguay
  if (lat >= -34.97 && lat <= -30.11 && lng >= -58.43 && lng <= -53.21) {
    return 'Uruguay';
  }

  // Default to unknown
  return 'Unknown';
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
