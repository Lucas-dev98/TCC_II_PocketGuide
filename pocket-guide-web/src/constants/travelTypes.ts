/**
 * Travel Types Constants
 * Configuração centralizada de todos os tipos de viagem da aplicação
 * Use este arquivo para manter consistência em toda a aplicação
 */

/**
 * Tipos de viagem disponíveis
 */
export const TRAVEL_TYPES = {
  RELAXAMENTO: 'relaxamento',
  AVENTURA: 'aventura',
  CULTURA: 'cultura',
  DIVERSAO: 'diversao',
  EXPLORACAO: 'exploracao',
  ROMANTICA: 'romantica',
  GASTRONOMIA: 'gastronomia',
  NATUREZA: 'natureza',
  ESPORTES: 'esportes',
  BEM_ESTAR: 'bem-estar',
} as const;

/**
 * Array com todos os tipos de viagem para iteração
 */
export const TRAVEL_TYPES_ARRAY = Object.values(TRAVEL_TYPES);

/**
 * Tipo TypeScript para tipos de viagem
 */
export type TravelType = typeof TRAVEL_TYPES[keyof typeof TRAVEL_TYPES];

/**
 * Configuração completa de cada tipo de viagem
 * Inclui: id, label i18n key, descrição i18n key, emoji, cor
 */
export const TRAVEL_TYPE_CONFIG: Record<
  TravelType,
  {
    id: TravelType;
    icon: string;
    labelKey: string;
    descriptionKey: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  [TRAVEL_TYPES.RELAXAMENTO]: {
    id: TRAVEL_TYPES.RELAXAMENTO,
    icon: '🏖️',
    labelKey: 'newFlow.step1.relaxamento',
    descriptionKey: 'newFlow.step1.relaxamento_desc',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  [TRAVEL_TYPES.AVENTURA]: {
    id: TRAVEL_TYPES.AVENTURA,
    icon: '⛰️',
    labelKey: 'newFlow.step1.aventura',
    descriptionKey: 'newFlow.step1.aventura_desc',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  [TRAVEL_TYPES.CULTURA]: {
    id: TRAVEL_TYPES.CULTURA,
    icon: '🏛️',
    labelKey: 'newFlow.step1.cultura',
    descriptionKey: 'newFlow.step1.cultura_desc',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  [TRAVEL_TYPES.DIVERSAO]: {
    id: TRAVEL_TYPES.DIVERSAO,
    icon: '🎉',
    labelKey: 'newFlow.step1.diversao',
    descriptionKey: 'newFlow.step1.diversao_desc',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
  [TRAVEL_TYPES.EXPLORACAO]: {
    id: TRAVEL_TYPES.EXPLORACAO,
    icon: '🌍',
    labelKey: 'newFlow.step1.exploracao',
    descriptionKey: 'newFlow.step1.exploracao_desc',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  [TRAVEL_TYPES.ROMANTICA]: {
    id: TRAVEL_TYPES.ROMANTICA,
    icon: '💕',
    labelKey: 'newFlow.step1.romantica',
    descriptionKey: 'newFlow.step1.romantica_desc',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  [TRAVEL_TYPES.GASTRONOMIA]: {
    id: TRAVEL_TYPES.GASTRONOMIA,
    icon: '🍽️',
    labelKey: 'newFlow.step1.gastronomia',
    descriptionKey: 'newFlow.step1.gastronomia_desc',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  [TRAVEL_TYPES.NATUREZA]: {
    id: TRAVEL_TYPES.NATUREZA,
    icon: '🌲',
    labelKey: 'newFlow.step1.natureza',
    descriptionKey: 'newFlow.step1.natureza_desc',
    color: 'from-green-600 to-teal-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  [TRAVEL_TYPES.ESPORTES]: {
    id: TRAVEL_TYPES.ESPORTES,
    icon: '⚽',
    labelKey: 'newFlow.step1.esportes',
    descriptionKey: 'newFlow.step1.esportes_desc',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
  [TRAVEL_TYPES.BEM_ESTAR]: {
    id: TRAVEL_TYPES.BEM_ESTAR,
    icon: '🧘',
    labelKey: 'newFlow.step1.bem-estar',
    descriptionKey: 'newFlow.step1.bem-estar_desc',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
};

/**
 * Mapeamento de tipos para usar em exibição
 * Converte o ID do tipo para rótulo i18n
 */
export const getTravelTypeLabel = (type: TravelType): string => {
  return TRAVEL_TYPE_CONFIG[type]?.labelKey || type;
};

/**
 * Obter configuração completa de um tipo de viagem
 */
export const getTravelTypeConfig = (type: TravelType) => {
  return TRAVEL_TYPE_CONFIG[type] || TRAVEL_TYPE_CONFIG[TRAVEL_TYPES.CULTURA];
};

/**
 * Validar se é um tipo de viagem válido
 */
export const isValidTravelType = (type: any): type is TravelType => {
  return TRAVEL_TYPES_ARRAY.includes(type);
};

/**
 * Obter todos os tipos para formar opções de select
 */
export const getTravelTypesForSelect = () => {
  return TRAVEL_TYPES_ARRAY.map((type) => ({
    value: type,
    config: getTravelTypeConfig(type as TravelType),
  }));
};
