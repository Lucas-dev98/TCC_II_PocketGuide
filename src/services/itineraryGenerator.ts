/**
 * Itinerary Generator Service
 * Generates personalized travel itineraries based on user preferences
 * 
 * For MVP v1: Uses predefined itineraries and AI-powered suggestions
 * Can be upgraded later with Hugging Face Transformers.js or Gemini API
 */

export interface AttractionTime {
  day: number;
  time: string;
  name: string;
  duration: number; // in minutes
  reason: string;
  tip: string;
  category: string; // restaurant, museum, park, beach, etc
  latitude: number;
  longitude: number;
}

export interface GeneratedItinerary {
  destination: string;
  days: number;
  tags: string[];
  attractions: AttractionTime[];
  totalDistance: number; // in km
  tips: string[];
}

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
