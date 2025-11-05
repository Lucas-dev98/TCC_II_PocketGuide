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
  // Activities
  { id: 'museus', label: 'Museus', emoji: '🏛️', category: 'culture' },
  { id: 'monumentos', label: 'Monumentos', emoji: '🗿', category: 'culture' },
  { id: 'arquitetura', label: 'Arquitetura', emoji: '🏗️', category: 'culture' },
  { id: 'arte-rua', label: 'Arte de Rua', emoji: '🎨', category: 'culture' },
  
  // Dining
  { id: 'gastronomia', label: 'Gastronomia Local', emoji: '🍽️', category: 'dining' },
  { id: 'street-food', label: 'Street Food', emoji: '🌮', category: 'dining' },
  { id: 'bares', label: 'Bares & Drinks', emoji: '🍷', category: 'dining' },
  { id: 'cafes', label: 'Cafés Tradicionais', emoji: '☕', category: 'dining' },
  
  // Nature
  { id: 'trilhas', label: 'Trilhas', emoji: '🥾', category: 'nature' },
  { id: 'praias', label: 'Praias', emoji: '🏖️', category: 'nature' },
  { id: 'montanhas', label: 'Montanhas', emoji: '⛰️', category: 'nature' },
  { id: 'parques', label: 'Parques Naturais', emoji: '🌲', category: 'nature' },
  
  // Relaxation
  { id: 'spa', label: 'Spa & Wellness', emoji: '💆', category: 'relaxation' },
  { id: 'yoga', label: 'Yoga & Meditação', emoji: '🧘', category: 'relaxation' },
  { id: 'retiros', label: 'Retiros', emoji: '🏡', category: 'relaxation' },
  { id: 'piscinas', label: 'Piscinas & Resorts', emoji: '🏊', category: 'relaxation' },
  
  // Adventure
  { id: 'escalada', label: 'Escalada', emoji: '🧗', category: 'adventure' },
  { id: 'mergulho', label: 'Mergulho', emoji: '🤿', category: 'adventure' },
  { id: 'skate', label: 'Skate & Esportes', emoji: '🛹', category: 'adventure' },
  { id: 'parapente', label: 'Parapente', emoji: '🪂', category: 'adventure' },
  
  // Night Life
  { id: 'vida-noturna', label: 'Vida Noturna', emoji: '🎉', category: 'activities' },
  { id: 'dancas-tradicionais', label: 'Danças Tradicionais', emoji: '💃', category: 'activities' },
  { id: 'musica-ao-vivo', label: 'Música ao Vivo', emoji: '🎸', category: 'activities' },
  { id: 'teatros', label: 'Teatros & Shows', emoji: '🎭', category: 'activities' },
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
