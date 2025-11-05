/**
 * Destination matching engine based on user preferences
 * Scores destinations based on trip type, duration, budget, and season
 */

import { TripType, TripDuration, BudgetPerDay } from '../types';
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
  budget: BudgetPerDay,
  month: number | '',
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

    // Type matching (40% weight)
    const typeMatches = dest.types.filter((t) => tripTypes.includes(t));
    const typeScore = (typeMatches.length / tripTypes.length) * 100;
    score += typeScore * 0.4;

    if (typeMatches.length > 0) {
      reasons.push(`✓ Atrai ${typeMatches.join(', ')}`);
    }

    // Budget matching (35% weight - increased from 25%)
    const budgetScore = getBudgetScore(
      budget,
      dest.budgetRange.min,
      dest.budgetRange.max
    );
    score += budgetScore * 0.35;

    if (budgetScore === 100) {
      reasons.push(`✓ Orçamento perfeito`);
    }

    // Season matching (25% weight - increased from 10%)
    const seasonScore = getSeasonScore(month, dest.name);
    score += seasonScore * 0.25;

    if (month && seasonScore === 100) {
      reasons.push(`✓ Melhor época neste mês`);
    }

    return {
      name: dest.name,
      country: dest.country,
      emoji: dest.emoji,
      score: Math.round(score),
      reasons,
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
