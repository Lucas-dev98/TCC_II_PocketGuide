/**
 * Destination matching engine based on user preferences
 * Scores destinations based on trip type, duration, budget, season, group composition, and interests
 */

import { TripType, TripDuration, BudgetPerDay, GroupType } from '../types';
import { getMonthStatus } from './seasonalData';

export interface DestinationScore {
  name: string;
  country: string;
  score: number; // 0-100
  reasons: string[];
  emoji: string;
  matchPercentage: number;
}

export interface DestinationDatabase {
  name: string;
  country: string;
  emoji: string;
  types: TripType[];
  bestDuration: TripDuration[];
  budgetRange: {
    min: BudgetPerDay;
    max: BudgetPerDay;
  };
  description: string;
}

export const DESTINATIONS_DB: DestinationDatabase[] = [
  // PORTUGAL
  {
    name: 'Lisboa',
    country: 'Portugal',
    emoji: '🌉',
    types: ['cultura', 'exploracao', 'romantica'],
    bestDuration: ['uma-semana', 'duas-semanas'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Capital vibrante com história, gastronomia e vida noturna',
  },
  {
    name: 'Algarve',
    country: 'Portugal',
    emoji: '🏖️',
    types: ['relaxamento', 'aventura'],
    bestDuration: ['uma-semana', 'duas-semanas'],
    budgetRange: { min: 'economico', max: 'luxo' },
    description: 'Praias douradas e resorts, perfeito para relaxamento',
  },
  {
    name: 'Porto',
    country: 'Portugal',
    emoji: '🍷',
    types: ['cultura', 'exploracao', 'romantica'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Vinho, tradição e vistas do Rio Douro',
  },

  // SPAIN
  {
    name: 'Barcelona',
    country: 'Spain',
    emoji: '🎨',
    types: ['cultura', 'diversao', 'aventura'],
    bestDuration: ['uma-semana', 'duas-semanas', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Arquitetura modernista, praias e vida noturna',
  },
  {
    name: 'Madrid',
    country: 'Spain',
    emoji: '🏛️',
    types: ['cultura', 'diversao', 'exploracao'],
    bestDuration: ['uma-semana', 'duas-semanas', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Museus, arte e gastronomia de classe mundial',
  },
  {
    name: 'Sevilla',
    country: 'Spain',
    emoji: '💃',
    types: ['cultura', 'romantica', 'exploracao'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'medio' },
    description: 'Flamenco, tradição andaluza e romance',
  },

  // ITALY
  {
    name: 'Roma',
    country: 'Italy',
    emoji: '🏛️',
    types: ['cultura', 'exploracao', 'romantica'],
    bestDuration: ['uma-semana', 'duas-semanas', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Ruínas romanas, Vaticano e comida italiana autêntica',
  },
  {
    name: 'Veneza',
    country: 'Italy',
    emoji: '🚤',
    types: ['romantica', 'cultura', 'aventura'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'medio', max: 'luxo' },
    description: 'Canais, gondolas e arquitetura medieval',
  },
  {
    name: 'Florença',
    country: 'Italy',
    emoji: '🎭',
    types: ['cultura', 'exploracao', 'aventura'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Renascença, arte e vinho toscano',
  },

  // FRANCE
  {
    name: 'Paris',
    country: 'France',
    emoji: '🗼',
    types: ['romantica', 'cultura', 'exploracao'],
    bestDuration: ['uma-semana', 'duas-semanas', 'fim-de-semana'],
    budgetRange: { min: 'medio', max: 'luxo' },
    description: 'A cidade da luz, moda e romance',
  },
  {
    name: 'Niza',
    country: 'France',
    emoji: '🏖️',
    types: ['relaxamento', 'romantica', 'aventura'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'medio', max: 'luxo' },
    description: 'Riviera Francesa com praias e montes',
  },

  // BRAZIL
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    emoji: '🏖️',
    types: ['relaxamento', 'aventura', 'diversao'],
    bestDuration: ['uma-semana', 'duas-semanas'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Praias icônicas, montanhas e vida noturna',
  },
  {
    name: 'Salvador',
    country: 'Brazil',
    emoji: '🌴',
    types: ['relaxamento', 'cultura', 'exploracao'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'medio' },
    description: 'Cultura afro-brasileira, praias e história',
  },

  // ARGENTINA
  {
    name: 'Buenos Aires',
    country: 'Argentina',
    emoji: '💃',
    types: ['cultura', 'diversao', 'exploracao'],
    bestDuration: ['uma-semana', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Tango, steak e arquitetura europeia',
  },
  {
    name: 'Bariloche',
    country: 'Argentina',
    emoji: '⛰️',
    types: ['aventura', 'exploracao', 'relaxamento'],
    bestDuration: ['uma-semana', 'duas-semanas'],
    budgetRange: { min: 'economico', max: 'premium' },
    description: 'Lagos, montanhas e Patagônia',
  },

  // THAILAND
  {
    name: 'Bangkok',
    country: 'Thailand',
    emoji: '🏯',
    types: ['cultura', 'diversao', 'exploracao'],
    bestDuration: ['uma-semana', 'duas-semanas'],
    budgetRange: { min: 'ultra-economico', max: 'premium' },
    description: 'Templos, mercados e comida de rua',
  },
  {
    name: 'Phuket',
    country: 'Thailand',
    emoji: '🏖️',
    types: ['relaxamento', 'aventura'],
    bestDuration: ['uma-semana', 'duas-semanas', 'fim-de-semana'],
    budgetRange: { min: 'economico', max: 'luxo' },
    description: 'Praias paradisíacas e mergulho',
  },
];

const BUDGET_ORDER = ['ultra-economico', 'economico', 'medio', 'premium', 'luxo'];

function getBudgetScore(
  userBudget: BudgetPerDay,
  destBudgetMin: BudgetPerDay,
  destBudgetMax: BudgetPerDay
): number {
  const budgetIdx = BUDGET_ORDER.indexOf(userBudget);
  const minIdx = BUDGET_ORDER.indexOf(destBudgetMin);
  const maxIdx = BUDGET_ORDER.indexOf(destBudgetMax);

  if (budgetIdx >= minIdx && budgetIdx <= maxIdx) return 100;

  // Partial match if close
  if (budgetIdx < minIdx) {
    const distance = minIdx - budgetIdx;
    return Math.max(0, 100 - distance * 20);
  } else {
    const distance = budgetIdx - maxIdx;
    return Math.max(0, 100 - distance * 20);
  }
}

function getSeasonScore(
  month: number | '',
  destination: string
): number {
  if (!month) return 70; // No penalty if season not selected
  const status = getMonthStatus(destination, month as number);
  switch (status) {
    case 'best':
      return 100;
    case 'warning':
      return 70;
    case 'avoid':
      return 30;
    default:
      return 70;
  }
}

export function matchDestinations(
  tripTypes: TripType[],
  interests?: string[],
  groupType?: GroupType,
  _numPeople?: number,
  _numChildren?: number,
  budget?: BudgetPerDay,
  _startDate?: string,
  _endDate?: string,
  month?: number | '',
  destination?: string
): DestinationScore[] {
  // If user manually selected a destination, return it with high score
  if (destination) {
    return [
      {
        name: destination,
        country: 'User Selected',
        score: 100,
        reasons: ['Destino selecionado pelo usuário'],
        emoji: '🎯',
        matchPercentage: 100,
      },
    ];
  }

  const scores: DestinationScore[] = DESTINATIONS_DB.map((dest) => {
    let score = 0;
    const reasons: string[] = [];

    // Type matching (25% weight)
    const typeMatches = dest.types.filter((t) => tripTypes.includes(t));
    const typeScore = typeMatches.length > 0 ? 100 : 0;
    score += typeScore * 0.25;

    if (typeMatches.length > 0) {
      reasons.push(`✓ Tipo de viagem: ${typeMatches.join(', ')}`);
    }

    // Interest-based matching (20% weight) - NEW
    let interestScore = 0;
    if (interests && interests.length > 0) {
      // Map interests to destination types for better matching
      const interestMapping: { [key: string]: TripType[] } = {
        praia: ['relaxamento'],
        montanha: ['aventura'],
        cultural: ['cultura'],
        gastronomia: ['exploracao'],
        vida_noturna: ['diversao'],
        natureza: ['aventura', 'relaxamento'],
        história: ['cultura', 'exploracao'],
        romance: ['romantica'],
        história_local: ['cultura'],
        aventura_extrema: ['aventura'],
        relaxamento_spa: ['relaxamento'],
      };

      const matchedInterests = interests.filter((interest) => {
        const relatedTypes = interestMapping[interest] || [];
        return relatedTypes.some((type) => dest.types.includes(type));
      });

      interestScore = matchedInterests.length > 0 ? 100 : 50;
      if (matchedInterests.length > 0) {
        reasons.push(`✓ Interesses: ${matchedInterests.join(', ')}`);
      }
    } else {
      interestScore = 70; // Default score if no interests selected
    }
    score += interestScore * 0.2;

    // Budget matching (25% weight)
    let budgetScore = 0;
    if (budget) {
      budgetScore = getBudgetScore(budget, dest.budgetRange.min, dest.budgetRange.max);
    } else {
      budgetScore = 70; // Default score if no budget selected
    }
    score += budgetScore * 0.25;

    if (budget && budgetScore === 100) {
      reasons.push(`✓ Orçamento perfeito`);
    }

    // Group type suitability (15% weight) - NEW
    let groupScore = 0;
    if (groupType) {
      // Destinations with diverse types tend to suit all group types
      const destTypeCount = dest.types.length;
      const baseGroupScore = Math.min(100, 50 + destTypeCount * 15);

      // Special considerations
      if (groupType === 'casal' && dest.types.includes('romantica')) {
        groupScore = 100;
        reasons.push(`✓ Perfeito para casal`);
      } else if (groupType === 'familia' && destTypeCount >= 2) {
        groupScore = 95;
        reasons.push(`✓ Bom para família`);
      } else if (groupType === 'amigos' && (dest.types.includes('diversao') || dest.types.includes('aventura'))) {
        groupScore = 100;
        reasons.push(`✓ Ideal para amigos`);
      } else {
        groupScore = baseGroupScore;
      }
    } else {
      groupScore = 70; // Default score
    }
    score += groupScore * 0.15;

    // Season matching (15% weight - reduced from 25%)
    let seasonScore = 0;
    if (month && typeof month === 'number') {
      seasonScore = getSeasonScore(month, dest.name);
    } else {
      seasonScore = 70; // No penalty if season not selected
    }
    score += seasonScore * 0.15;

    if (month && typeof month === 'number' && seasonScore === 100) {
      reasons.push(`✓ Melhor época neste mês`);
    }

    return {
      name: dest.name,
      country: dest.country,
      emoji: dest.emoji,
      score: Math.round(score),
      reasons: reasons.length > 0 ? reasons : ['Recomendação personalizada'],
      matchPercentage: Math.round(score),
    };
  });

  // Sort by score descending and return top 5
  return scores.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function getDestinationInfo(name: string): DestinationDatabase | undefined {
  return DESTINATIONS_DB.find((d) => d.name === name);
}

export function getAllDestinations(): string[] {
  return DESTINATIONS_DB.map((d) => d.name);
}
