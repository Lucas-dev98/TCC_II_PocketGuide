/**
 * itineraryGenerator.ts - Itinerary generation with fallback options
 * Uses Gemini API when available, falls back to local/predefined data
 */

import { generateItineraryWithGemini } from './geminiItinerary';

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
 */
export const generateItinerary = async (
  destination: string,
  days: number,
  tags: string[],
  budget: string = 'mid',
  groupType: string = 'couple'
): Promise<ItineraryItem[]> => {
  try {
    // Try to use Gemini API first
    const geminiResult = await generateItineraryWithGemini(
      destination,
      days,
      tags,
      budget,
      groupType
    );

    if (geminiResult && geminiResult.itinerary && geminiResult.itinerary.length > 0) {
      return geminiResult.itinerary;
    }
  } catch (error) {
    console.warn('Gemini API error, falling back to predefined itineraries:', error);
  }

  // Fallback to predefined itineraries
  const normalizedDestination = Object.keys(predefinedItineraries).find(
    (key) => key.toLowerCase() === destination.toLowerCase()
  );

  if (normalizedDestination) {
    const items = predefinedItineraries[normalizedDestination];
    // Filter items for selected days
    return items.filter((item) => item.day <= days);
  }

  // Last resort: return generic itinerary
  return generateGenericItinerary(destination, days, tags);
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

  for (let day = 1; day <= days; day++) {
    const activities = [
      {
        time: '09:00',
        name: `Explore ${destination} - Morning Tour`,
        category: 'Exploration',
        reason: 'Discover the main attractions of the city',
      },
      {
        time: '12:00',
        name: `Local Lunch in ${destination}`,
        category: 'Food & Beverage',
        reason: 'Experience authentic local cuisine',
      },
      {
        time: '15:00',
        name: `Cultural Site Visit`,
        category: 'Culture',
        reason: 'Learn about local history and culture',
      },
      {
        time: '19:00',
        name: `Dinner and Evening Entertainment`,
        category: 'Food & Beverage',
        reason: 'Enjoy local nightlife and restaurants',
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
