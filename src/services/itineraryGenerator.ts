/**
 * itineraryGenerator.ts - Itinerary generation with fallback options
 * Uses Gemini API when available, falls back to local/predefined data
 */

import { generateItineraryWithGemini, GeneratedItinerary } from './geminiItinerary';

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
}

// Predefined itineraries for popular destinations (fallback)
const predefinedItineraries: Record<string, ItineraryItem[]> = {
  'Lisboa': [
    {
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
      day: 1,
      time: '10:30',
      name: 'Livraria Bertrand',
      duration: 90,
      reason: 'World\'s oldest bookstore since 1732',
      tip: 'Browse the Portuguese literature section',
      location: { lat: 38.7105, lng: -9.1412 },
      category: 'Culture',
    },
    {
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
      day: 2,
      time: '10:45',
      name: 'Mosteiro dos Jerónimos',
      duration: 120,
      reason: 'Stunning Manueline architecture and UNESCO site',
      tip: 'Book tickets online to skip queues',
      location: { lat: 38.6948, lng: -9.2024 },
      category: 'Historical',
    },
    {
      day: 2,
      time: '13:00',
      name: 'Pastéis de Nata at Pastéis de Belém',
      duration: 45,
      reason: 'Try the original pastéis de nata at the source',
      tip: 'Dusted with cinnamon and powdered sugar',
      location: { lat: 38.6972, lng: -9.2010 },
      category: 'Food & Beverage',
    },
  ],
  'Paris': [
    {
      day: 1,
      time: '09:00',
      name: 'Eiffel Tower',
      duration: 120,
      reason: 'Iconic iron lattice monument',
      tip: 'Buy tickets online and go early morning for fewer crowds',
      location: { lat: 48.8584, lng: 2.2945 },
      category: 'Historical',
    },
    {
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
      day: 2,
      time: '09:00',
      name: 'Louvre Museum',
      duration: 180,
      reason: 'World\'s largest art museum',
      tip: 'Book tickets online to skip the line at the pyramid entrance',
      location: { lat: 48.8606, lng: 2.3352 },
      category: 'Culture',
    },
  ],
  'São Paulo': [
    {
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
      day: 1,
      time: '12:30',
      name: 'Mercadão',
      duration: 90,
      reason: 'Historic market with specialty foods and local products',
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
    const geminiResult = await generateItineraryWithGemini(destination, days, tags, budget, groupType);

    if (geminiResult && geminiResult.itinerary.length > 0) {
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
    // Return first N items based on days
    const itemsPerDay = Math.ceil(items.length / days);
    return items.slice(0, days * itemsPerDay);
  }

  // Last resort: return generic itinerary
  return generateGenericItinerary(destination, days, tags);
};

/**
 * Generate a generic itinerary when destination is not found
 */
const generateGenericItinerary = (destination: string, days: number, tags: string[]): ItineraryItem[] => {
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

/**
 * Popular attractions database for major cities
 * In production, this would come from Nominatim + user preferences
 */
const ATTRACTIONS_DB: Record<string, Record<string, AttractionTime[]>> = {
  'Lisboa': {
    'gastronomia|casal|curto': [
      {
        day: 1,
        time: '09:00',
        name: 'Café A Brasileira',
        duration: 45,
        reason: 'Café histórico com pastéis de nata autênticos',
        tip: 'Reserve mesa com antecedência para dois',
        category: 'café',
        latitude: 38.71,
        longitude: -9.1410,
      },
      {
        day: 1,
        time: '11:00',
        name: 'Belém Tower (Torre de Belém)',
        duration: 60,
        reason: 'Monumento histórico do século XVI ao lado do Tejo',
        tip: 'Suba até ao topo para vista panorâmica do rio',
        category: 'monumento',
        latitude: 38.6916,
        longitude: -9.216,
      },
      {
        day: 1,
        time: '13:00',
        name: 'Pastéis de Nata em Belém',
        duration: 30,
        reason: 'Provar os famosos Pastéis de Nata da Confeitaria de Belém',
        tip: 'Peça morno, com canela e açúcar',
        category: 'doçaria',
        latitude: 38.6974,
        longitude: -9.2022,
      },
      {
        day: 2,
        time: '10:00',
        name: 'Mosteiro dos Jerónimos',
        duration: 90,
        reason: 'Arquitetura manuelina impressionante, Patrimônio da UNESCO',
        tip: 'Visite antes das 11:00 para evitar multidões',
        category: 'museu',
        latitude: 38.6979,
        longitude: -9.2064,
      },
      {
        day: 2,
        time: '13:00',
        name: 'Restaurante Tasca da Esquina',
        duration: 90,
        reason: 'Culinária portuguesa moderna e aconchegante',
        tip: 'Pede recomendação do chef (chef\'s tasting)',
        category: 'restaurante',
        latitude: 38.7236,
        longitude: -9.139,
      },
    ],
    'cultura|solo|longo': [
      {
        day: 1,
        time: '09:00',
        name: 'Museu Nacional do Azulejo',
        duration: 120,
        reason: 'Coleção única de azulejos portugueses de 5 séculos',
        tip: 'Não perca o painel de azulejos do Convento da Madre de Deus',
        category: 'museu',
        latitude: 38.7153,
        longitude: -9.1015,
      },
      {
        day: 1,
        time: '14:00',
        name: 'Café com vista no Chiado',
        duration: 45,
        reason: 'Café tradicional com vista para a Baixa de Lisboa',
        tip: 'Peça um Galão (leite com café)',
        category: 'café',
        latitude: 38.713,
        longitude: -9.1423,
      },
      {
        day: 1,
        time: '16:00',
        name: 'Livraria Lello & Irmão',
        duration: 60,
        reason: 'Uma das livrarias mais lindas do mundo (se aberta)',
        tip: 'Suba até à galeria superior para vista das estantes',
        category: 'cultura',
        latitude: 38.8102,
        longitude: -9.141,
      },
      {
        day: 2,
        time: '09:00',
        name: 'Mosteiro dos Jerónimos',
        duration: 120,
        reason: 'Arquitetura manuelina de tomar o fôlego',
        tip: 'Reserve guia local para melhor compreensão histórica',
        category: 'monumento',
        latitude: 38.6979,
        longitude: -9.2064,
      },
      {
        day: 2,
        time: '13:00',
        name: 'Monumento dos Descobrimentos',
        duration: 60,
        reason: 'Monumento às explorações marítimas portuguesas',
        tip: 'Suba até ao topo (96 metros) para vista do Tejo',
        category: 'monumento',
        latitude: 38.6938,
        longitude: -9.2051,
      },
      {
        day: 3,
        time: '10:00',
        name: 'Castelo de São Jorge',
        duration: 120,
        reason: 'Castelo histórico com vistas panorâmicas de Lisboa',
        tip: 'Leve água e chapéu, sem muita sombra no topo',
        category: 'castelo',
        latitude: 38.7138,
        longitude: -9.1347,
      },
      {
        day: 3,
        time: '15:00',
        name: 'Sintra (Palácio Nacional da Pena)',
        duration: 180,
        reason: 'Arquitetura romântica colorida nas serras de Sintra',
        tip: 'Pegue num comboio de Lisboa para Sintra (30 min)',
        category: 'palácio',
        latitude: 38.7867,
        longitude: -9.3881,
      },
    ],
    'natureza|família|curto': [
      {
        day: 1,
        time: '09:00',
        name: 'Parque de Monsanto',
        duration: 120,
        reason: 'Maior parque urbano de Lisboa com vistas e trilhas',
        tip: 'Leve piquenique e água',
        category: 'parque',
        latitude: 38.7174,
        longitude: -9.1877,
      },
      {
        day: 1,
        time: '13:00',
        name: 'Miradouro de Santa Apolónia',
        duration: 45,
        reason: 'Ponto de vista panorâmico da Baixa e Tejo',
        tip: 'Melhor ao pôr do sol',
        category: 'viewpoint',
        latitude: 38.7086,
        longitude: -9.133,
      },
      {
        day: 2,
        time: '10:00',
        name: 'Praia de Costa da Caparica',
        duration: 180,
        reason: 'Praia próxima a Lisboa com areia dourada',
        tip: 'Pegue na Cacilheiros de Almada ou de comboio',
        category: 'praia',
        latitude: 38.6534,
        longitude: -9.2534,
      },
      {
        day: 2,
        time: '14:00',
        name: 'Arroz de Marisco na Caparica',
        duration: 60,
        reason: 'Arroz fresco com marisco apanhado do dia',
        tip: 'Peça peixe grelhado como alternativa',
        category: 'restaurante',
        latitude: 38.6547,
        longitude: -9.2512,
      },
    ],
  },
  'Porto': {
    'gastronomia|casal|curto': [
      {
        day: 1,
        time: '09:00',
        name: 'Livraria Lello',
        duration: 60,
        reason: 'Uma das livrarias mais lindas do mundo',
        tip: 'Visite cedo para evitar multidões (9h-10h30)',
        category: 'cultura',
        latitude: 41.1624,
        longitude: -8.6237,
      },
      {
        day: 1,
        time: '11:00',
        name: 'Pastel de Nata no Pastel de Belém',
        duration: 30,
        reason: 'Pastel de Nata tradicional português',
        tip: 'Morno com canela',
        category: 'café',
        latitude: 41.1725,
        longitude: -8.6268,
      },
      {
        day: 1,
        time: '13:00',
        name: 'Francesinha - O Pap Açorda',
        duration: 60,
        reason: 'Francesinha Porto clássica (sanduíche com molho)',
        tip: 'Acompanhado com cerveja local Sagres',
        category: 'restaurante',
        latitude: 41.1615,
        longitude: -8.6289,
      },
      {
        day: 2,
        time: '14:00',
        name: 'Livraria Armazém',
        duration: 45,
        reason: 'Café em livraria com vista para rio Douro',
        tip: 'Vinho do Porto com queijo local',
        category: 'café',
        latitude: 41.1745,
        longitude: -8.6295,
      },
    ],
  },
  'Paris': {
    'cultura|solo|longo': [
      {
        day: 1,
        time: '09:00',
        name: 'Musée du Louvre',
        duration: 180,
        reason: 'Maior museu do mundo com obras-primas',
        tip: 'Reserve bilhete online, entre pelo Carrousel',
        category: 'museu',
        latitude: 48.8606,
        longitude: 2.3376,
      },
      {
        day: 1,
        time: '14:00',
        name: 'Torre Eiffel',
        duration: 120,
        reason: 'Ícone de Paris com vistas panorâmicas',
        tip: 'Suba a pé até ao segundo andar (menos filas)',
        category: 'monumento',
        latitude: 48.8584,
        longitude: 2.2945,
      },
      {
        day: 2,
        time: '10:00',
        name: 'Catedral de Notre-Dame',
        duration: 90,
        reason: 'Arquitetura gótica impressionante (exterior)',
        tip: 'Ainda em restauração, visite parque próximo',
        category: 'monumento',
        latitude: 48.853,
        longitude: 2.3499,
      },
      {
        day: 2,
        time: '14:00',
        name: 'Musée d\'Orsay',
        duration: 120,
        reason: 'Maior coleção de arte impressionista',
        tip: 'Visite à noite para menos multidões',
        category: 'museu',
        latitude: 48.8601,
        longitude: 2.3265,
      },
    ],
  },
};

/**
 * Generate personalized itinerary
 * @param destination City name
 * @param days Number of days
 * @param tags User preferences (gastronomia, cultura, natureza, família, etc)
 */
export function generateItinerary(
  destination: string,
  days: number,
  tags: string[]
): GeneratedItinerary | null {
  try {
    const normalizedDest = destination
      .toLowerCase()
      .split(',')[0] // Get city name only
      .trim();

    // Find matching attractions for destination and preferences
    const cityAttractions = ATTRACTIONS_DB[destination] || ATTRACTIONS_DB[normalizedDest];

    if (!cityAttractions) {
      console.warn(`No attractions found for ${destination}`);
      return null;
    }

    // Find best matching itinerary template
    let attractions: AttractionTime[] = [];
    let bestMatch = 0;

    for (const [key, attrList] of Object.entries(cityAttractions)) {
      // Count matching tags
      const matches = tags.filter((tag) => key.includes(tag.toLowerCase())).length;
      if (matches > bestMatch) {
        bestMatch = matches;
        attractions = attrList;
      }
    }

    // If no perfect match, use the first available template
    if (attractions.length === 0) {
      attractions = Object.values(cityAttractions)[0] || [];
    }

    // Adjust to requested number of days
    const adjustedAttractions = adjustAttractionsToDays(attractions, days);

    // Calculate total distance (rough estimate: 15km per day of city touring)
    const totalDistance = days * 15;

    // Generate tips based on preferences
    const tips = generateTips(destination, tags);

    return {
      destination,
      days,
      tags,
      attractions: adjustedAttractions,
      totalDistance,
      tips,
    };
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return null;
  }
}

/**
 * Adjust attractions to fit the requested number of days
 */
function adjustAttractionsToDays(
  attractions: AttractionTime[],
  days: number
): AttractionTime[] {
  if (attractions.length === 0) return [];

  const adjusted: AttractionTime[] = [];
  const attractionsPerDay = Math.ceil(attractions.length / days);

  for (let i = 0; i < attractions.length; i++) {
    const attraction = { ...attractions[i] };
    attraction.day = Math.floor(i / attractionsPerDay) + 1;

    if (attraction.day <= days) {
      adjusted.push(attraction);
    }
  }

  return adjusted;
}

/**
 * Generate travel tips based on preferences
 */
function generateTips(destination: string, tags: string[]): string[] {
  const tips: string[] = [];

  tips.push(`Bem-vindo a ${destination}! 🌍`);

  if (tags.includes('gastronomia')) {
    tips.push('Prove os pratos locais - a gastronomia é essencial!');
    tips.push('Reserve restaurantes com antecedência em horas de pico.');
  }

  if (tags.includes('cultura')) {
    tips.push('Compre um passe de museus para economizar.');
    tips.push('Visite monumentos ao amanhecer para menos multidões.');
  }

  if (tags.includes('natureza')) {
    tips.push('Leve protetor solar e água em abundância.');
    tips.push('Prefira trilhas matinais para melhor temperatura.');
  }

  if (tags.includes('família')) {
    tips.push('Leve snacks e água para as crianças.');
    tips.push('Parques são ótimos para pausas durante o dia.');
  }

  if (tags.includes('casal')) {
    tips.push('Aproveite miradouros ao pôr do sol para momentos românticos.');
    tips.push('Jantar à noite em restaurantes tradicionais é uma experiência!');
  }

  if (tags.includes('solo')) {
    tips.push('Hostelaria são boas para conhecer outros viajantes.');
    tips.push('Caminhe pela cidade - é a melhor forma de explorar.');
  }

  tips.push('Sempre respeite a cultura e costumes locais. 🤝');

  return tips;
}

/**
 * Format itinerary for display
 */
export function formatItinerary(itinerary: GeneratedItinerary): string {
  let formatted = `🌍 ${itinerary.days}-Day Itinerary for ${itinerary.destination}\n`;
  formatted += `Tags: ${itinerary.tags.join(', ')}\n\n`;

  const days: Record<number, AttractionTime[]> = {};
  itinerary.attractions.forEach((attr) => {
    if (!days[attr.day]) days[attr.day] = [];
    days[attr.day].push(attr);
  });

  for (let day = 1; day <= itinerary.days; day++) {
    formatted += `📅 Day ${day}\n`;
    if (days[day]) {
      days[day].forEach((attr) => {
        formatted += `  ${attr.time} - ${attr.name} (${attr.duration}min)\n`;
        formatted += `    💡 ${attr.reason}\n`;
        formatted += `    ✏️ Tip: ${attr.tip}\n`;
      });
    }
    formatted += '\n';
  }

  formatted += `📊 Total Distance: ~${itinerary.totalDistance}km\n\n`;
  formatted += '💡 Travel Tips:\n';
  itinerary.tips.forEach((tip) => {
    formatted += `  • ${tip}\n`;
  });

  return formatted;
}
