/**
 * Seasonal data for destinations
 * Indicates best/worst months and weather patterns
 */

export interface SeasonalData {
  bestMonths: number[]; // 1-12
  warningMonths: number[]; // 1-12
  avoidMonths: number[]; // 1-12
  climate: string;
  rainyMonths?: number[];
  crowdedMonths?: number[];
}

export const SEASONAL_DATA: Record<string, SeasonalData> = {
  // Portugal
  'Lisboa': {
    bestMonths: [4, 5, 9, 10], // April, May, Sept, Oct
    warningMonths: [6, 7, 8, 11, 12, 1, 2, 3],
    avoidMonths: [],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },
  'Porto': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12, 1, 2, 3],
    avoidMonths: [],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },
  'Algarve': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8],
    avoidMonths: [12, 1, 2],
    climate: 'Mediterrâneo',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },

  // Spain
  'Barcelona': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12],
    avoidMonths: [1, 2, 3],
    climate: 'Mediterrâneo',
    rainyMonths: [10, 11, 12],
    crowdedMonths: [6, 7, 8],
  },
  'Madrid': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 12, 1, 2, 3],
    avoidMonths: [],
    climate: 'Continental',
    rainyMonths: [11, 12, 1, 2, 3],
    crowdedMonths: [7, 8],
  },
  'Sevilla': {
    bestMonths: [4, 5, 10, 11],
    warningMonths: [6, 7, 8, 9],
    avoidMonths: [12, 1, 2],
    climate: 'Semiárido',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [7, 8],
  },

  // Italy
  'Roma': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12],
    avoidMonths: [1, 2, 3],
    climate: 'Mediterrâneo',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },
  'Veneza': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12],
    avoidMonths: [1, 2, 3],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },
  'Florença': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12],
    avoidMonths: [1, 2, 3],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },

  // France
  'Paris': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8, 11, 12],
    avoidMonths: [1, 2, 3],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2, 3],
    crowdedMonths: [6, 7, 8],
  },
  'Niza': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8],
    avoidMonths: [11, 12, 1, 2, 3],
    climate: 'Mediterrâneo',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },

  // Default for unknown cities
  'default': {
    bestMonths: [4, 5, 9, 10],
    warningMonths: [6, 7, 8],
    avoidMonths: [1, 2, 12],
    climate: 'Temperado',
    rainyMonths: [11, 12, 1, 2],
    crowdedMonths: [6, 7, 8],
  },
};

export const MONTHS = [
  { number: 1, name: 'Janeiro', abbr: 'Jan' },
  { number: 2, name: 'Fevereiro', abbr: 'Fev' },
  { number: 3, name: 'Março', abbr: 'Mar' },
  { number: 4, name: 'Abril', abbr: 'Abr' },
  { number: 5, name: 'Maio', abbr: 'Mai' },
  { number: 6, name: 'Junho', abbr: 'Jun' },
  { number: 7, name: 'Julho', abbr: 'Jul' },
  { number: 8, name: 'Agosto', abbr: 'Ago' },
  { number: 9, name: 'Setembro', abbr: 'Set' },
  { number: 10, name: 'Outubro', abbr: 'Out' },
  { number: 11, name: 'Novembro', abbr: 'Nov' },
  { number: 12, name: 'Dezembro', abbr: 'Dez' },
];

/**
 * Get seasonal data for a destination
 * Falls back to default if not found
 */
export function getSeasonalData(destination: string): SeasonalData {
  return SEASONAL_DATA[destination] || SEASONAL_DATA['default'];
}

/**
 * Get status for a given month (best, warning, avoid)
 */
export function getMonthStatus(
  destination: string,
  month: number
): 'best' | 'warning' | 'avoid' {
  const data = getSeasonalData(destination);

  if (data.avoidMonths.includes(month)) return 'avoid';
  if (data.bestMonths.includes(month)) return 'best';
  if (data.warningMonths.includes(month)) return 'warning';

  return 'warning';
}

/**
 * Get reason why a month is not ideal
 */
export function getMonthReason(destination: string, month: number): string[] {
  const data = getSeasonalData(destination);
  const reasons: string[] = [];

  if (data.rainyMonths?.includes(month)) {
    reasons.push('Muita chuva');
  }
  if (data.crowdedMonths?.includes(month)) {
    reasons.push('Muito lotado');
  }
  if (data.avoidMonths.includes(month)) {
    reasons.push('Não recomendado');
  }

  return reasons.length > 0 ? reasons : ['Período aceitável'];
}
