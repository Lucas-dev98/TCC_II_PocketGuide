/**
 * Interests data and matching engine
 * Provides contextualized interests based on trip type
 */

import { TripType } from '../types';

export interface Interest {
  id: string;
  label: string;
  emoji: string;
  category: 'activities' | 'culture' | 'dining' | 'relaxation' | 'nature' | 'adventure';
}

export interface InterestCategory {
  name: string;
  emoji: string;
  interests: Interest[];
}

export const ALL_INTERESTS: Interest[] = [
  // 🏛️ CULTURE & HISTORY (8 items)
  { id: 'museus', label: 'Museus', emoji: '🏛️', category: 'culture' },
  { id: 'monumentos', label: 'Monumentos Históricos', emoji: '🗿', category: 'culture' },
  { id: 'arquitetura', label: 'Arquitetura', emoji: '🏗️', category: 'culture' },
  { id: 'arte-rua', label: 'Arte de Rua', emoji: '🎨', category: 'culture' },
  { id: 'sítios-arqueológicos', label: 'Sítios Arqueológicos', emoji: '⛏️', category: 'culture' },
  { id: 'castelos', label: 'Castelos & Fortalezas', emoji: '🏰', category: 'culture' },
  { id: 'templos', label: 'Templos Religiosos', emoji: '⛩️', category: 'culture' },
  { id: 'patrimônio-cultural', label: 'Patrimônio Cultural', emoji: '📜', category: 'culture' },
  
  // 🍽️ DINING & GASTRONOMY (10 items)
  { id: 'gastronomia', label: 'Gastronomia Local', emoji: '🍽️', category: 'dining' },
  { id: 'street-food', label: 'Street Food', emoji: '🌮', category: 'dining' },
  { id: 'bares', label: 'Bares & Drinks', emoji: '🍷', category: 'dining' },
  { id: 'cafes', label: 'Cafés Tradicionais', emoji: '☕', category: 'dining' },
  { id: 'restaurantes-fine-dining', label: 'Fine Dining', emoji: '🍴', category: 'dining' },
  { id: 'food-tours', label: 'Food Tours', emoji: '🥘', category: 'dining' },
  { id: 'padarias', label: 'Padarias & Confeitarias', emoji: '🥐', category: 'dining' },
  { id: 'mercados-alimentos', label: 'Mercados de Alimentos', emoji: '🏪', category: 'dining' },
  { id: 'cervejarias', label: 'Cervejarias Artesanais', emoji: '🍺', category: 'dining' },
  { id: 'aulas-culinarias', label: 'Aulas Culinárias', emoji: '👨‍🍳', category: 'dining' },
  
  // 🌲 NATURE & OUTDOOR (12 items)
  { id: 'trilhas', label: 'Trilhas & Caminhadas', emoji: '🥾', category: 'nature' },
  { id: 'praias', label: 'Praias', emoji: '🏖️', category: 'nature' },
  { id: 'montanhas', label: 'Montanhas', emoji: '⛰️', category: 'nature' },
  { id: 'parques', label: 'Parques Naturais', emoji: '🌲', category: 'nature' },
  { id: 'cachoeiras', label: 'Cachoeiras', emoji: '💧', category: 'nature' },
  { id: 'cavernas', label: 'Cavernas & Grutas', emoji: '🕳️', category: 'nature' },
  { id: 'fauna', label: 'Observação de Fauna', emoji: '🦁', category: 'nature' },
  { id: 'flora', label: 'Observação de Flora', emoji: '🌺', category: 'nature' },
  { id: 'piscinas-naturais', label: 'Piscinas Naturais', emoji: '🏞️', category: 'nature' },
  { id: 'jardins-botanicos', label: 'Jardins Botânicos', emoji: '🌿', category: 'nature' },
  { id: 'safari', label: 'Safari & Safáris', emoji: '🚙', category: 'nature' },
  { id: 'cicloturismo', label: 'Cicloturismo', emoji: '🚴', category: 'nature' },
  
  // 💆 RELAXATION & WELLNESS (10 items)
  { id: 'spa', label: 'Spa & Massagem', emoji: '💆', category: 'relaxation' },
  { id: 'yoga', label: 'Yoga & Meditação', emoji: '🧘', category: 'relaxation' },
  { id: 'retiros', label: 'Retiros Espirituais', emoji: '🏡', category: 'relaxation' },
  { id: 'piscinas', label: 'Piscinas & Termas', emoji: '🏊', category: 'relaxation' },
  { id: 'banhos-termais', label: 'Banhos Termais', emoji: '♨️', category: 'relaxation' },
  { id: 'balnearios', label: 'Balneários', emoji: '🛁', category: 'relaxation' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧠', category: 'relaxation' },
  { id: 'terapias', label: 'Terapias Alternativas', emoji: '💜', category: 'relaxation' },
  { id: 'desintoxicacao', label: 'Retiros Detox', emoji: '🍃', category: 'relaxation' },
  { id: 'leitura-repouso', label: 'Leitura & Repouso', emoji: '📖', category: 'relaxation' },
  
  // 🧗 ADVENTURE & SPORTS (14 items)
  { id: 'escalada', label: 'Escalada em Rocha', emoji: '🧗', category: 'adventure' },
  { id: 'mergulho', label: 'Mergulho Subaquático', emoji: '🤿', category: 'adventure' },
  { id: 'skate', label: 'Skate & Esportes de Rua', emoji: '🛹', category: 'adventure' },
  { id: 'parapente', label: 'Parapente', emoji: '🪂', category: 'adventure' },
  { id: 'rafting', label: 'Rafting', emoji: '🚣', category: 'adventure' },
  { id: 'surfe', label: 'Surfe & Windsurfe', emoji: '🏄', category: 'adventure' },
  { id: 'esqui', label: 'Esqui & Snowboard', emoji: '⛷️', category: 'adventure' },
  { id: 'tirolesa', label: 'Tirolesa', emoji: '🪶', category: 'adventure' },
  { id: 'caiaque', label: 'Caiaque & Canoagem', emoji: '🛶', category: 'adventure' },
  { id: 'bungee', label: 'Bungee Jumping', emoji: '🦘', category: 'adventure' },
  { id: 'mountainbike', label: 'Mountain Bike', emoji: '🚵', category: 'adventure' },
  { id: 'caminhada-gelo', label: 'Caminhada no Gelo', emoji: '❄️', category: 'adventure' },
  { id: 'pesca', label: 'Pesca Esportiva', emoji: '🎣', category: 'adventure' },
  { id: 'esqui-agua', label: 'Esqui Aquático', emoji: '🏂', category: 'adventure' },
  
  // 🎭 ENTERTAINMENT & ACTIVITIES (14 items)
  { id: 'vida-noturna', label: 'Vida Noturna & Discotecas', emoji: '🎉', category: 'activities' },
  { id: 'dancas-tradicionais', label: 'Danças Tradicionais', emoji: '💃', category: 'activities' },
  { id: 'musica-ao-vivo', label: 'Música ao Vivo', emoji: '🎸', category: 'activities' },
  { id: 'teatros', label: 'Teatros & Shows', emoji: '🎭', category: 'activities' },
  { id: 'cinema', label: 'Cinema', emoji: '🎬', category: 'activities' },
  { id: 'musica-classica', label: 'Música Clássica & Ópera', emoji: '🎻', category: 'activities' },
  { id: 'festivals', label: 'Festivais & Eventos', emoji: '🎊', category: 'activities' },
  { id: 'fotografía', label: 'Fotografia & Paisagens', emoji: '📸', category: 'activities' },
  { id: 'museus-arte-moderna', label: 'Arte Moderna & Contemporânea', emoji: '🖼️', category: 'activities' },
  { id: 'compras', label: 'Compras & Mercados', emoji: '🛍️', category: 'activities' },
  { id: 'mercados-artesanato', label: 'Mercados de Artesanato', emoji: '🏺', category: 'activities' },
  { id: 'parques-tematicos', label: 'Parques Temáticos', emoji: '🎪', category: 'activities' },
  { id: 'observatorio', label: 'Observatórios Astronômicos', emoji: '🔭', category: 'activities' },
  { id: 'museus-ciencia', label: 'Museus de Ciência', emoji: '🧪', category: 'activities' },
];

// Interests organized by category
export const INTERESTS_BY_CATEGORY: Record<string, InterestCategory> = {
  culture: {
    name: 'Cultura & História',
    emoji: '🏛️',
    interests: ALL_INTERESTS.filter((i) => i.category === 'culture'),
  },
  dining: {
    name: 'Gastronomia',
    emoji: '🍽️',
    interests: ALL_INTERESTS.filter((i) => i.category === 'dining'),
  },
  nature: {
    name: 'Natureza',
    emoji: '🌲',
    interests: ALL_INTERESTS.filter((i) => i.category === 'nature'),
  },
  relaxation: {
    name: 'Relaxamento',
    emoji: '💆',
    interests: ALL_INTERESTS.filter((i) => i.category === 'relaxation'),
  },
  adventure: {
    name: 'Aventura',
    emoji: '🧗',
    interests: ALL_INTERESTS.filter((i) => i.category === 'adventure'),
  },
  activities: {
    name: 'Atividades & Entretenimento',
    emoji: '🎭',
    interests: ALL_INTERESTS.filter((i) => i.category === 'activities'),
  },
};

// Trip type to recommended interest categories mapping
const TRIP_TYPE_RECOMMENDATIONS: Record<TripType, string[]> = {
  relaxamento: ['relaxation', 'dining', 'nature', 'culture'],
  aventura: ['adventure', 'nature', 'activities', 'dining'],
  cultura: ['culture', 'dining', 'activities', 'nature'],
  diversao: ['activities', 'dining', 'culture', 'adventure'],
  exploracao: ['nature', 'adventure', 'culture', 'activities'],
  romantica: ['dining', 'culture', 'relaxation', 'nature'],
  gastronomia: ['dining', 'culture', 'activities', 'relaxation'],
  natureza: ['nature', 'adventure', 'activities', 'relaxation'],
  esportes: ['adventure', 'activities', 'nature', 'dining'],
  'bem-estar': ['relaxation', 'dining', 'nature', 'activities'],
};

/**
 * Get recommended interests for a specific trip type
 * Returns categories ordered by relevance
 */
export function getRecommendedInterests(tripType: TripType): InterestCategory[] {
  const categoryOrder = TRIP_TYPE_RECOMMENDATIONS[tripType];
  return categoryOrder
    .map((categoryKey) => INTERESTS_BY_CATEGORY[categoryKey])
    .filter((cat) => cat !== undefined);
}

/**
 * Get PRIMARY recommended interests for a specific trip type
 * Returns ONLY the main/primary category for that trip type
 */
export function getPrimaryRecommendedInterests(tripType: TripType): InterestCategory[] {
  const categoryOrder = TRIP_TYPE_RECOMMENDATIONS[tripType];
  if (categoryOrder.length === 0) return [];
  
  // Return only the primary category
  const primaryCategoryKey = categoryOrder[0];
  const primaryCategory = INTERESTS_BY_CATEGORY[primaryCategoryKey];
  return primaryCategory ? [primaryCategory] : [];
}

/**
 * Get PRIMARY recommended interests for multiple trip types
 * If only 1 trip type: return its primary category
 * If 2+ trip types: return primary categories of all, removing duplicates
 */
export function getPrimaryRecommendedInterestsByTypes(tripTypes: TripType[]): InterestCategory[] {
  if (tripTypes.length === 0) return [];
  
  // Get primary category key for each trip type
  const categoryKeys = tripTypes.map((tripType) => {
    const categoryOrder = TRIP_TYPE_RECOMMENDATIONS[tripType];
    return categoryOrder[0];
  });
  
  // Remove duplicates while preserving order
  const uniqueCategoryKeys = Array.from(new Set(categoryKeys));
  
  // Map to actual categories
  return uniqueCategoryKeys
    .map((key) => INTERESTS_BY_CATEGORY[key])
    .filter((cat) => cat !== undefined);
}

/**
 * Get all interest categories
 */
export function getAllInterestCategories(): InterestCategory[] {
  return Object.values(INTERESTS_BY_CATEGORY);
}

/**
 * Get interest by ID
 */
export function getInterestById(id: string): Interest | undefined {
  return ALL_INTERESTS.find((i) => i.id === id);
}

/**
 * Get interests by IDs
 */
export function getInterestsByIds(ids: string[]): Interest[] {
  return ids
    .map((id) => getInterestById(id))
    .filter((interest) => interest !== undefined) as Interest[];
}

/**
 * Get interest category by key
 */
export function getInterestCategory(
  key: 'culture' | 'dining' | 'nature' | 'relaxation' | 'adventure' | 'activities'
): InterestCategory | undefined {
  return INTERESTS_BY_CATEGORY[key];
}

/**
 * Validate interests (check if all IDs are valid)
 */
export function validateInterests(ids: string[]): boolean {
  return ids.every((id) => ALL_INTERESTS.some((i) => i.id === id));
}
