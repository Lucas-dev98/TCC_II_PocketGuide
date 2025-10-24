/**
 * itineraryGenerator.ts - Itinerary generation with fallback options
 * Uses Gemini API when available, falls back to local/predefined data
 * Includes retry logic and structured logging for resilience
 */

import { generateItineraryWithGemini } from './geminiItinerary';
import { withRetry } from '../utils/retryService';
import logger from './logger';
import cacheManager from '../utils/cacheManager';

export interface ItineraryItem {
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip: string;
  location?: {
    lat: number;
    lng: number;
  };
  category: string;
  id?: string;
}

// Predefined itineraries for popular destinations (fallback)
const predefinedItineraries: Record<string, ItineraryItem[]> = {
  'Lisboa': [
    {
      id: 'lx-001',
      day: 1,
      time: '09:00',
      name: 'Café A Brasileira',
      duration: 60,
      reason: 'Historic café famous for pastéis de nata',
      tip: 'Ask for café com leite (coffee with milk)',
      location: { lat: 38.7100, lng: -9.1410 },
      category: 'Food & Beverage',
    },
    {
      id: 'lx-002',
      day: 1,
      time: '10:30',
      name: 'Livraria Bertrand',
      duration: 90,
      reason: "World's oldest bookstore since 1732",
      tip: 'Browse the Portuguese literature section',
      location: { lat: 38.7105, lng: -9.1412 },
      category: 'Culture',
    },
    {
      id: 'lx-003',
      day: 1,
      time: '12:30',
      name: 'Bairro Alto',
      duration: 120,
      reason: 'Historic neighborhood with vintage shops and street art',
      tip: 'Explore narrow streets and local restaurants',
      location: { lat: 38.7102, lng: -9.1425 },
      category: 'Exploration',
    },
    {
      id: 'lx-004',
      day: 2,
      time: '09:00',
      name: 'Torre de Belém',
      duration: 90,
      reason: 'UNESCO-listed fortress with historical significance',
      tip: 'Visit early to avoid crowds',
      location: { lat: 38.6916, lng: -9.2160 },
      category: 'Historical',
    },
    {
      id: 'lx-005',
      day: 2,
      time: '10:45',
      name: 'Mosteiro dos Jerónimos',
      duration: 120,
      reason: 'Stunning Manueline architecture and UNESCO site',
      tip: 'Book tickets online to skip queues',
      location: { lat: 38.6948, lng: -9.2024 },
      category: 'Historical',
    },
  ],
  'Paris': [
    {
      id: 'paris-001',
      day: 1,
      time: '09:00',
      name: 'Eiffel Tower',
      duration: 120,
      reason: 'Iconic iron lattice monument',
      tip: 'Buy tickets online and go early morning',
      location: { lat: 48.8584, lng: 2.2945 },
      category: 'Historical',
    },
    {
      id: 'paris-002',
      day: 1,
      time: '11:30',
      name: 'Trocadéro',
      duration: 60,
      reason: 'Best viewpoint for Eiffel Tower photos',
      tip: 'Bring water and sun protection',
      location: { lat: 48.8614, lng: 2.2857 },
      category: 'Viewpoint',
    },
    {
      id: 'paris-003',
      day: 2,
      time: '09:00',
      name: 'Louvre Museum',
      duration: 180,
      reason: "World's largest art museum",
      tip: 'Book tickets online to skip the line',
      location: { lat: 48.8606, lng: 2.3352 },
      category: 'Culture',
    },
  ],
  'São Paulo': [
    {
      id: 'sp-001',
      day: 1,
      time: '10:00',
      name: 'MASP - Museu de Arte de São Paulo',
      duration: 120,
      reason: 'Contemporary art museum in iconic building',
      tip: 'Visit on Sunday for free admission',
      location: { lat: -23.5569, lng: -46.6560 },
      category: 'Culture',
    },
    {
      id: 'sp-002',
      day: 1,
      time: '12:30',
      name: 'Mercadão',
      duration: 90,
      reason: 'Historic market with specialty foods',
      tip: 'Try the famoso X-tudo sandwich',
      location: { lat: -23.5505, lng: -46.6333 },
      category: 'Food & Beverage',
    },
  ],
};

/**
 * Generate itinerary using Gemini API with fallback to predefined data
 * Includes retry logic for better reliability
 */
export const generateItinerary = async (
  destination: string,
  days: number,
  tags: string[],
  budget: string = 'mid',
  groupType: string = 'couple'
): Promise<ItineraryItem[]> => {
  // Create cache key
  const cacheKey = `itinerary_${destination.toLowerCase()}_${days}_${tags.join('_')}`;

  // Try to get from cache first
  const cached = await cacheManager.get<ItineraryItem[]>(cacheKey);
  if (cached) {
    logger.info('Itinerary retrieved from cache', { destination, days });
    return cached;
  }

  try {
    logger.info('Generating itinerary', {
      destination,
      days,
      tags,
      budget,
      groupType,
    });

    // Try to use Gemini API first with retry logic for resilience
    const geminiResult = await withRetry(
      () =>
        generateItineraryWithGemini(
          destination,
          days,
          tags,
          budget,
          groupType
        ),
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        multiplier: 2,
        onRetry: (attempt, delay, error) => {
          logger.warn(`Gemini API retry attempt ${attempt}`, {
            delay,
            error: error?.message,
          });
        },
      }
    );

    if (geminiResult && geminiResult.itinerary && geminiResult.itinerary.length > 0) {
      logger.info('Itinerary generated successfully from Gemini API', {
        itemCount: geminiResult.itinerary.length,
      });
      // Cache the result for 24 hours
      await cacheManager.set(cacheKey, geminiResult.itinerary, 24 * 60 * 60 * 1000);
      return geminiResult.itinerary;
    }
  } catch (error) {
    logger.warn('Gemini API error after retries, using fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Fallback to predefined itineraries
  logger.info('Using predefined itinerary fallback', { destination });

  const normalizedDestination = Object.keys(predefinedItineraries).find(
    (key) => key.toLowerCase() === destination.toLowerCase()
  );

  if (normalizedDestination) {
    const items = predefinedItineraries[normalizedDestination];
    const filtered = items.filter((item) => item.day <= days);
    logger.info('Predefined itinerary loaded', {
      destination: normalizedDestination,
      itemCount: filtered.length,
    });
    // Cache the result for 7 days
    await cacheManager.set(cacheKey, filtered, 7 * 24 * 60 * 60 * 1000);
    // Filter items for selected days
    return filtered;
  }

  // Last resort: return generic itinerary
  logger.info('Generating generic itinerary fallback', { destination });
  const genericResult = generateGenericItinerary(destination, days, tags);
  // Cache the result for 24 hours
  await cacheManager.set(cacheKey, genericResult, 24 * 60 * 60 * 1000);
  return genericResult;
};

/**
 * Generate a generic itinerary when destination is not found
 */
const generateGenericItinerary = (
  destination: string,
  days: number,
  tags: string[]
): ItineraryItem[] => {
  const itinerary: ItineraryItem[] = [];

  // Default coordinates for common destinations
  const defaultCoords: { [key: string]: { lat: number; lng: number } } = {
    'paris': { lat: 48.8566, lng: 2.3522 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'bangkok': { lat: 13.7563, lng: 100.5018 },
    'lisbon': { lat: 38.7223, lng: -9.1393 },
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'são paulo': { lat: -23.5505, lng: -46.6333 },
    'buenos aires': { lat: -34.6037, lng: -58.3816 },
    'sydney': { lat: -33.8688, lng: 151.2093 },
    'istanbul': { lat: 41.0082, lng: 28.9784 },
  };

  const destLower = destination.toLowerCase();
  const baseCoords = defaultCoords[destLower] || { lat: 0, lng: 0 };

  for (let day = 1; day <= days; day++) {
    const activities = [
      {
        time: '09:00',
        name: `Explore ${destination} - Morning Tour`,
        category: 'Exploration',
        reason: 'Discover the main attractions of the city',
        latOffset: 0,
        lngOffset: 0,
      },
      {
        time: '12:00',
        name: `Local Lunch in ${destination}`,
        category: 'Food & Beverage',
        reason: 'Experience authentic local cuisine',
        latOffset: 0.01,
        lngOffset: 0.01,
      },
      {
        time: '15:00',
        name: `Cultural Site Visit`,
        category: 'Culture',
        reason: 'Learn about local history and culture',
        latOffset: -0.01,
        lngOffset: 0.01,
      },
      {
        time: '19:00',
        name: `Dinner and Evening Entertainment`,
        category: 'Food & Beverage',
        reason: 'Enjoy local nightlife and restaurants',
        latOffset: -0.01,
        lngOffset: -0.01,
      },
    ];

    activities.forEach((activity, index) => {
      itinerary.push({
        id: `generic-${day}-${index}`,
        day,
        time: activity.time,
        name: activity.name,
        duration: index === 0 ? 180 : index === 1 ? 120 : index === 2 ? 120 : 180,
        reason: activity.reason,
        tip: `${tags[index % tags.length] || 'Enjoy'} this experience`,
        category: activity.category,
        location: {
          lat: baseCoords.lat + (activity.latOffset || 0),
          lng: baseCoords.lng + (activity.lngOffset || 0),
        },
      });
    });
  }

  return itinerary;
};

/**
 * Get popular destinations with suggestions
 */
export const getPopularDestinations = (): string[] => {
  return Object.keys(predefinedItineraries);
};

/**
 * Check if destination has predefined itinerary
 */
export const hasPredefinedItinerary = (destination: string): boolean => {
  return Object.keys(predefinedItineraries).some(
    (key) => key.toLowerCase() === destination.toLowerCase()
  );
};
