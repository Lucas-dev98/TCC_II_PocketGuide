/**
 * itineraryGenerator.ts - Itinerary generation with fallback options
 * Uses Gemini API when available, falls back to local/predefined data
 * Includes retry logic and structured logging for resilience
 * Supports multi-language generation (PT-BR, EN-US, ES-ES)
 */

import { generateItineraryWithGemini } from './geminiItinerary';
import { withRetry } from '../utils/retryService';
import logger from './logger';
import type { LanguageCode } from './promptTranslator';
import type { Location } from '../types';
import { generateItineraryInBackend, isBackendApiEnabled, isBackendRequired } from './backendApi';

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
  groupType: string = 'couple',
  language: LanguageCode = 'en-US',
  season?: 'primavera' | 'verão' | 'outono' | 'inverno',
  tripScope?: 'nacional' | 'internacional' | '',
  userLocation?: Location | null
): Promise<ItineraryItem[]> => {
  try {
    if (isBackendRequired() && !isBackendApiEnabled()) {
      throw new Error('Backend API is required in production. Configure VITE_BACKEND_URL.');
    }

    if (isBackendApiEnabled()) {
      const backendItems = await withRetry(
        () => generateItineraryInBackend({
          destination,
          days,
          tags,
          budget,
          groupType,
          language,
          season,
          tripScope,
          async: false,
        }),
        {
          maxRetries: 2,
          baseDelayMs: 500,
          maxDelayMs: 3000,
          multiplier: 2,
          onRetry: (attempt, delay, error) => {
            logger.warn(`Backend itinerary retry ${attempt}`, {
              delay,
              error: error?.message,
            });
          },
        }
      );

      if (backendItems && backendItems.length > 0) {
        logger.info('Itinerary generated from backend API', {
          itemCount: backendItems.length,
        });
        return backendItems;
      }
    }

    // DEBUG: Log ALL parameters received
    console.log('════════════════════════════════════════════════════════');
    console.log('🎯 ITINERARY GENERATOR - PARAMETERS RECEIVED:');
    console.log('════════════════════════════════════════════════════════');
    console.log('📍 Destination:', destination);
    console.log('📅 Days:', days);
    console.log('⭐ Tags/Interests:', tags.join(', '));
    console.log('💰 BUDGET:', budget, '← CRITICAL!');
    console.log('👥 Group Type:', groupType);
    console.log('🌐 Language:', language);
    console.log('🌍 Season:', season);
    console.log('🗺️ Trip Scope:', tripScope || 'Not selected');
    console.log('════════════════════════════════════════════════════════');

    logger.info('Generating itinerary', {
      destination,
      days,
      tags,
      budget,
      groupType,
      season,
      tripScope,
      language,
    });

    // Try to use Gemini API first with retry logic for resilience
    const geminiResult = await withRetry(
      () =>
        generateItineraryWithGemini(
          destination,
          days,
          tags,
          budget,
          groupType,
          language,
          season,
          tripScope,
          userLocation
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
    // Filter items for selected days
    return filtered;
  }

  // Last resort: return generic itinerary
  logger.info('Generating generic itinerary fallback', { destination });
  const genericResult = generateGenericItinerary(destination, days, tags);
  return genericResult;
};

type FallbackPOI = {
  name: string;
  category: 'Culture' | 'Nature' | 'Food & Beverage' | 'Exploration' | 'Historical' | 'Viewpoint';
  reason: string;
  tip: string;
  location: { lat: number; lng: number };
};

const smartFallbackCatalog: Record<string, FallbackPOI[]> = {
  'rio de janeiro': [
    { name: 'Cristo Redentor', category: 'Viewpoint', reason: 'Ícone da cidade com vista panorâmica completa', tip: 'Chegue cedo para evitar filas e neblina', location: { lat: -22.9519, lng: -43.2105 } },
    { name: 'Pão de Açúcar', category: 'Viewpoint', reason: 'Um dos mirantes mais famosos do Rio', tip: 'Prefira horário de pôr do sol', location: { lat: -22.9486, lng: -43.1566 } },
    { name: 'Copacabana', category: 'Nature', reason: 'Praia clássica com grande infraestrutura', tip: 'Evite horários de pico na orla', location: { lat: -22.9711, lng: -43.1822 } },
    { name: 'Ipanema', category: 'Nature', reason: 'Praia vibrante com excelente ambiente urbano', tip: 'No fim da tarde, siga para o Arpoador', location: { lat: -22.9847, lng: -43.1986 } },
    { name: 'Jardim Botânico do Rio', category: 'Nature', reason: 'Área verde histórica com trilhas e estufas', tip: 'Leve água e calçado confortável', location: { lat: -22.9634, lng: -43.2230 } },
    { name: 'Escadaria Selarón', category: 'Culture', reason: 'Obra artística urbana reconhecida internacionalmente', tip: 'A região é melhor para visita diurna', location: { lat: -22.9153, lng: -43.1790 } },
    { name: 'Museu do Amanhã', category: 'Culture', reason: 'Museu interativo com foco em ciência e futuro', tip: 'Compre ingresso online', location: { lat: -22.8938, lng: -43.1800 } },
    { name: 'Real Gabinete Português de Leitura', category: 'Historical', reason: 'Patrimônio histórico e arquitetônico do centro', tip: 'Confira horário de funcionamento antes', location: { lat: -22.9071, lng: -43.1819 } },
    { name: 'Confeitaria Colombo', category: 'Food & Beverage', reason: 'Experiência gastronômica tradicional do Rio', tip: 'Experimente doces da casa', location: { lat: -22.9034, lng: -43.1779 } },
    { name: 'Santa Teresa', category: 'Exploration', reason: 'Bairro histórico com ateliês e vista da cidade', tip: 'Use transporte por app para maior conforto', location: { lat: -22.9240, lng: -43.1850 } },
    { name: 'Lapa', category: 'Exploration', reason: 'Região cultural com arquitetura e vida noturna', tip: 'Visite os Arcos e os arredores com movimento', location: { lat: -22.9135, lng: -43.1823 } },
    { name: 'Parque Lage', category: 'Nature', reason: 'Parque com trilhas e vista para o Corcovado', tip: 'Ideal para manhã de clima ameno', location: { lat: -22.9606, lng: -43.2118 } },
  ],
};

const normalizeCategoryFromTag = (tag: string): FallbackPOI['category'] => {
  const t = tag.toLowerCase();
  if (t.includes('gastr') || t.includes('culin') || t.includes('food')) return 'Food & Beverage';
  if (t.includes('natur') || t.includes('praia') || t.includes('beach') || t.includes('trilha')) return 'Nature';
  if (t.includes('hist') || t.includes('muse') || t.includes('cult')) return 'Culture';
  if (t.includes('vista') || t.includes('mirante')) return 'Viewpoint';
  return 'Exploration';
};

/**
 * Generate a smart fallback itinerary when backend/gemini are unavailable.
 * Avoids generic activity names and prioritizes destination POIs.
 */
const generateGenericItinerary = (
  destination: string,
  days: number,
  tags: string[]
): ItineraryItem[] => {
  const itinerary: ItineraryItem[] = [];
  const used = new Set<string>();
  const normalizedDestination = destination.toLowerCase().trim();

  const catalog =
    smartFallbackCatalog[normalizedDestination] ||
    [
      {
        name: `Centro Histórico de ${destination}`,
        category: 'Historical',
        reason: `Roteiro histórico para conhecer os principais marcos de ${destination}`,
        tip: 'Comece cedo para aproveitar melhor os pontos do centro',
        location: { lat: 0, lng: 0 },
      },
      {
        name: `Mercado Municipal de ${destination}`,
        category: 'Food & Beverage',
        reason: 'Excelente ponto para provar sabores locais',
        tip: 'Prefira horários fora do almoço para menos filas',
        location: { lat: 0.01, lng: 0.01 },
      },
      {
        name: `Parque Central de ${destination}`,
        category: 'Nature',
        reason: 'Área verde ideal para pausa e passeio ao ar livre',
        tip: 'Leve água e protetor solar',
        location: { lat: -0.01, lng: 0.01 },
      },
      {
        name: `Rota Cultural de ${destination}`,
        category: 'Culture',
        reason: 'Combina arte, história e arquitetura local',
        tip: 'Verifique horários de museus e centros culturais',
        location: { lat: -0.01, lng: -0.01 },
      },
    ];

  const preferredCategories: FallbackPOI['category'][] =
    tags.length > 0
      ? tags.map(normalizeCategoryFromTag)
      : ['Exploration', 'Food & Beverage', 'Culture', 'Nature'];

  const slots = [
    { time: '09:00', duration: 150 },
    { time: '12:00', duration: 90 },
    { time: '15:00', duration: 120 },
    { time: '19:00', duration: 120 },
  ];

  const pickNextPOI = (preferredCategory: FallbackPOI['category'], seed: number): FallbackPOI => {
    const prioritized = catalog.filter((poi) => poi.category === preferredCategory);
    const pool = prioritized.length > 0 ? prioritized : catalog;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[(seed + i) % pool.length];
      if (!used.has(candidate.name.toLowerCase())) {
        used.add(candidate.name.toLowerCase());
        return candidate;
      }
    }

    const fallback = pool[seed % pool.length];
    return {
      ...fallback,
      name: `${fallback.name} (roteiro ${seed + 1})`,
    };
  };

  for (let day = 1; day <= days; day++) {
    slots.forEach((slot, slotIndex) => {
      const seed = (day - 1) * slots.length + slotIndex;
      const preferredCategory = preferredCategories[seed % preferredCategories.length];
      const poi = pickNextPOI(preferredCategory, seed);

      itinerary.push({
        id: `smart-fallback-${day}-${slotIndex}`,
        day,
        time: slot.time,
        name: poi.name,
        duration: slot.duration,
        reason: poi.reason,
        tip: poi.tip,
        category: poi.category,
        location: {
          lat: poi.location.lat,
          lng: poi.location.lng,
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
