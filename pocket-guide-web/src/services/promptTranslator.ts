/**
 * promptTranslator.ts - Translate Gemini AI prompts based on user language
 * 
 * Features:
 * - Generate Gemini prompts in PT-BR, EN-US, ES-ES
 * - Translate activity categories
 * - Translate tips and descriptions
 * - Support multi-language itinerary generation
 */

import type { Location } from '../types';

export type LanguageCode = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Get system instruction in the specified language
 */
export const getSystemInstruction = (language: LanguageCode): string => {
  const instructions: Record<LanguageCode, string> = {
    'pt-BR': 'Retorne apenas JSON válido. Sem markdown. Sem explicações. Sem pensamentos.',
    'en-US': 'Return only valid JSON. No markdown. No explanation. No thinking.',
    'es-ES': 'Devuelva solo JSON válido. Sin markdown. Sin explicación. Sin pensamientos.',
  };
  
  return instructions[language] || instructions['en-US'];
};

/**
 * Map budget codes to detailed descriptions with price ranges
 */
const getBudgetDescription = (budget: string, language: LanguageCode): string => {
  const budgetMappings: Record<string, Record<LanguageCode, string>> = {
    'ultra-economico': {
      'pt-BR': 'Ultra-econômico (menos de €30/dia) - Hospedagem compartilhada, refeições em lanchonetes, atrações gratuitas',
      'en-US': 'Ultra-economical (under €30/day) - Shared accommodation, street food, free attractions',
      'es-ES': 'Ultra-económico (menos de €30/día) - Alojamiento compartido, comida callejera, atracciones gratuitas',
    },
    'economico': {
      'pt-BR': 'Econômico (€30-€60/dia) - Hospedagem simples, restaurantes locais, museus com desconto',
      'en-US': 'Economical (€30-€60/day) - Budget accommodation, local restaurants, discounted museums',
      'es-ES': 'Económico (€30-€60/día) - Alojamiento presupuestario, restaurantes locales, museos con descuento',
    },
    'medio': {
      'pt-BR': 'Médio (€60-€150/dia) - Hotel 3 estrelas, restaurantes variados, atividades pagas',
      'en-US': 'Mid-range (€60-€150/day) - 3-star hotel, variety of restaurants, paid activities',
      'es-ES': 'Medio (€60-€150/día) - Hotel de 3 estrellas, restaurantes variados, actividades pagadas',
    },
    'premium': {
      'pt-BR': 'Premium (€150-€300/dia) - Hotel 4 estrelas, restaurantes sofisticados, tours privados',
      'en-US': 'Premium (€150-€300/day) - 4-star hotel, upscale restaurants, private tours',
      'es-ES': 'Premium (€150-€300/día) - Hotel de 4 estrellas, restaurantes de lujo, tours privados',
    },
    'luxo': {
      'pt-BR': 'Luxo (mais de €300/dia) - Hotel 5 estrelas, restaurantes Michelin, experiências exclusivas',
      'en-US': 'Luxury (over €300/day) - 5-star hotel, Michelin restaurants, exclusive experiences',
      'es-ES': 'Lujo (más de €300/día) - Hotel de 5 estrellas, restaurantes Michelin, experiencias exclusivas',
    },
  };

  return budgetMappings[budget]?.[language] || budgetMappings['medio'][language];
};

/**
 * Map user interests to suggested activity types
 */
const mapInterestsToActivities = (tags: string[]): string => {
  const interestActivityMap: Record<string, string> = {
    // Beach & Water Activities
    'praia': 'Beach clubs, water sports, snorkeling, sunset beach walks',
    'natureza': 'National parks, hiking trails, waterfalls, wildlife observation',
    'trilha': 'Mountain trails, guided hikes, rock climbing, nature reserves',
    'água': 'Beach bars, swimming, kayaking, boat tours, water activities',
    
    // Culture & History
    'cultura': 'Museums, historical sites, cultural centers, local markets',
    'história': 'Historical monuments, archaeological sites, local heritage tours',
    'gastronomia': 'Food tours, cooking classes, local restaurants, markets',
    'local': 'Authentic local experiences, community tours, street food',
    
    // Adventure & Sports
    'aventura': 'Rock climbing, paragliding, zip-lining, extreme sports',
    'esportes': 'Sports centers, activities, adventure parks, outdoor challenges',
    'adrenalina': 'Adrenaline activities, speed sports, thrilling experiences',
    
    // Relaxation & Wellness
    'relaxamento': 'Spas, wellness centers, meditation, peaceful environments',
    'yoga': 'Yoga studios, meditation classes, wellness retreats',
    'spa': 'Massage centers, sauna, hot springs, beauty treatments',
    'bem-estar': 'Wellness activities, mindfulness, healing experiences',
    
    // Arts & Entertainment
    'arte': 'Art galleries, museums, artist studios, cultural performances',
    'música': 'Live music venues, concerts, music festivals, local performances',
    'noturna': 'Nightclubs, bars, lounges, evening entertainment',
    'diversão': 'Entertainment venues, theme parks, fun activities, shows',
    
    // Food & Drink
    'comida': 'Restaurants, street food, food markets, dining experiences',
    'bebida': 'Wine bars, breweries, cocktail lounges, beverage tastings',
    'café': 'Coffee shops, local cafés, specialty coffee experiences',
    'vinho': 'Wine regions, wine bars, tastings, vineyards tours',
    
    // Shopping & Urban
    'compras': 'Shopping centers, markets, boutiques, local shops',
    'shopping': 'Shopping malls, designer stores, bargain hunting',
    'urbana': 'City tours, street art, urban culture, local neighborhoods',
    
    // Nature & Wildlife
    'animais': 'Wildlife sanctuaries, animal encounters, nature reserves',
    'fotografia': 'Photography tours, scenic viewpoints, picturesque locations',
    'paisagem': 'Scenic landscapes, viewpoints, photography spots, natural beauty',
  };

  return tags
    .map(tag => {
      const normalized = tag.toLowerCase().trim();
      const activities = interestActivityMap[normalized] || 'Relevant local experiences';
      return `• ${tag.toUpperCase()}: ${activities}`;
    })
    .join('\n   ');
};

/**
 * Map budget codes to detailed descriptions with price ranges
 */

/**
 * Generate itinerary prompt in the specified language
 */
export const generateItineraryPrompt = (
  days: number,
  destination: string,
  budget: string,
  groupType: string,
  tags: string[],
  language: LanguageCode,
  season?: 'primavera' | 'verão' | 'outono' | 'inverno',
  tripScope?: 'nacional' | 'internacional' | '',
  userLocation?: Location | null
): string => {
  const tagsString = tags.join(', ');
  const budgetDescription = getBudgetDescription(budget, language);
  const activitiesCount = days * 3;
  const tripScopeDescription = tripScope === 'nacional' 
    ? (language === 'pt-BR' ? 'Nacional' : language === 'en-US' ? 'Domestic' : 'Nacional')
    : (language === 'pt-BR' ? 'Internacional' : language === 'en-US' ? 'International' : 'Internacional');
  
  const prompts: Record<LanguageCode, string> = {
    'pt-BR': `GERAR ROTEIRO 100% DIVERSIFICADO E CRIATIVO PARA ${destination} (${tripScopeDescription})

🚨 PARÂMETROS OBRIGATÓRIOS:
- Duração: ${days} dias
- Orçamento: ${budgetDescription}
- Grupo: ${groupType}
- Interesses: ${tagsString}
- Tipo de Viagem: ${tripScopeDescription}
- Estação: ${season || 'não especificada'}${userLocation && (userLocation.lat || userLocation.lng) ? `
- Localização do Usuário: ${userLocation.address || `Latitude ${userLocation.lat?.toFixed(4)}, Longitude ${userLocation.lng?.toFixed(4)}`}

📍 CONTEXTO DE LOCALIZAÇÃO DO USUÁRIO:
   - O usuário está em: ${userLocation.address || `Coordenadas ${userLocation.lat?.toFixed(4)}, ${userLocation.lng?.toFixed(4)}`}
   - Considere a distância de ${destination} ao planejar o roteiro
   - Para viagens nacionais (Brasil): considere tempo de deslocamento/voos internos
   - Para viagens internacionais: voos internacionais podem ser necessários` : ''}

⚠️ REGRA CRÍTICA - TIPO DE VIAGEM (${tripScopeDescription.toUpperCase()}):
${tripScope === 'nacional' 
  ? '🇧🇷 NACIONAL OBRIGATÓRIO: Todas as atividades DEVEM estar dentro do Brasil APENAS.\n   ❌ NÃO PERMITIDO: Atividades no exterior.\n   ✅ VÁLIDO: São Paulo, Rio, Bahia, Santa Catarina, Minas Gerais, qualquer lugar do Brasil.'
  : tripScope === 'internacional'
  ? '🌍 INTERNACIONAL OBRIGATÓRIO: Todas as atividades DEVEM estar fora do Brasil.\n   ❌ NÃO PERMITIDO: Atividades dentro do Brasil.\n   ✅ VÁLIDO: Argentina, Peru, Chile, Europa, Ásia, qualquer lugar FORA do Brasil.'
  : 'Tipo de viagem não especificado'
}

🎯 REQUISITOS CRÍTICOS - DEVE CUMPRIR TODOS:

⭐⭐⭐ REQUIREMENT #0: INTERESSES SELECIONADOS (HIGHEST PRIORITY!) ⭐⭐⭐
   🎯 INTERESSES DO USUÁRIO: ${tagsString.toUpperCase()}
   📋 OBRIGAÇÃO: CADA atividade DEVE estar alinhada com UM dos interesses selecionados
   ✅ EXEMPLO: Se usuário selecionou "Praia, Relaxamento, Gastronomia":
      - Atividade 1: Praia com piscinas naturais (alinhado com PRAIA)
      - Atividade 2: Spa com massagem relaxante (alinhado com RELAXAMENTO)
      - Atividade 3: Restaurante com gastronomia local (alinhado com GASTRONOMIA)
   ❌ NÃO FAZER: Sugerir trilha de montanha extrema se usuário não selecionou "Aventura"
   ❌ NÃO FAZER: Sugerir museu de arte se usuário selecionou "Praia, Comida, Diversão"
   
   📊 MAPEAMENTO DE INTERESSES → ATIVIDADES:
   ${mapInterestsToActivities(tags)}
   
   🔄 DISTRIBUIÇÃO DE INTERESSES POR DIA:
   - Cada dia DEVE ter atividades de DIFERENTES interesses
   - Se 3 interesses, cada dia tem 1 interesse diferente
   - Ou alterne entre interesses nos 3 horários do dia
   - NUNCA coloque 3 atividades do mesmo interesse em um dia

1. EXATAMENTE ${activitiesCount} ATIVIDADES (${days} atividades por dia):
   ✅ Total de atividades: ${activitiesCount}
   ✅ Distribuição: 3 atividades por dia
   ✅ Variação: cada dia DIFERENTE do anterior

2. ZERO REPETIÇÃO - REGRA ABSOLUTA:
   ❌ NÃO pode repetir NENHUMA atividade entre dias
   ❌ NÃO pode repetir NENHUMA categoria entre dias
   ❌ NÃO pode repetir NENHUM tipo de comida entre dias
   ❌ NÃO pode repetir horário similar entre dias

3. DIVERSIDADE FORÇADA - ESTRUTURA OBRIGATÓRIA POR DIA:
   
   Dia 1 - TIPO A: [Cultura Histórica] [Comida Local] [Entretenimento Noturno]
   Dia 2 - TIPO B: [Natureza/Outdoor] [Comida Sofisticada] [Arte/Museu]
   Dia 3 - TIPO C: [Experiência Imersiva] [Comida Casual] [Vida Noturna/Bar]
   Dia 4 - TIPO D: [Compras/Mercado] [Comida Moderna] [Atividade Ativa]
   
   Se tiver mais dias, alternar entre TIPOS A, B, C, D

4. CATEGORIAS PERMITIDAS (use 1 diferente por atividade):
   ✅ Monumento/Histórico
   ✅ Museu/Arte
   ✅ Parque/Natureza
   ✅ Praia/Água
   ✅ Trilha/Hiking
   ✅ Restaurante Fino
   ✅ Comida Local/Mercado
   ✅ Comida Casual/Rua
   ✅ Comida Moderna/Fusion
   ✅ Bar/Drinks
   ✅ Clube Noturno
   ✅ Compras/Shopping
   ✅ Mercado Local
   ✅ Experiência Aventureira
   ✅ Spa/Wellness
   
5. RESPEITAR ORÇAMENTO ${budgetDescription}:
   - Mostrar preço REAL em USD (não deixe em branco)
   - Sugerir alternativas se caro
   - NÃO recomendar atividades cara para orçamentos baixos
   - Incluir: transporte, comida, entrada

6. ADAPTAR À ESTAÇÃO ${season || 'atual'}:
   - Considerar clima e atividades sazonais
   - Incluir eventos/festival se relevante
   - NÃO recomendar praia em inverno (a menos que hemisfério sul)

7. CADA ATIVIDADE EXIGE:
   - Horário REALISTA: 09:00-22:00 (não repetir de atividade anterior)
   - Duração REAL em minutos (não deixar tudo 120)
   - Nome EXATO do local/restaurante (pesquisável no Google Maps)
   - Razão ESPECÍFICA (não genérica como "visitar monumento")
   - Dica PRÁTICA (não frase comum)
   - Coordenadas GPS ou deixar 0 (obrigatório para 60% das atividades)

EXEMPLO DE VARIAÇÃO CORRETA (2 dias em Rio, Yoga, Médio):
Dia 1: 
  - 09:00: Christ Redeemer (Histórico) - Considerar a vista panorâmica
  - 13:00: Frontera Grill (Comida Local) - Ceviche e peixe fresco
  - 19:00: Lapa (Vida Noturna) - Samba ao vivo e caipirinha

Dia 2:
  - 08:00: Pedra do Telégrafo (Natureza) - Trilha com vista única
  - 12:30: Açaí Bowl e Smoothies (Comida Saudável) - Pós trilha energético
  - 20:00: Botafogo Praia Club (Bar/Drinks) - DJ set ao entardecer

FORMATO JSON (sem markdown, sem código blocks, válido):
{
  "itinerary": [
    {"day": 1, "time": "09:00", "name": "Nome Exato do Local", "duration": 120, "reason": "Razão específica", "tip": "Dica", "category": "Categoria", "lat": -22.9068, "lng": -43.1729},
    {"day": 1, "time": "13:00", "name": "Restaurante Real", "duration": 90, "reason": "Tipo comida", "tip": "Reservar", "category": "Food", "lat": 0, "lng": 0}
  ]
}

⚠️ VALIDAÇÃO FINAL ANTES DE RESPONDER:
✓ Contei ${activitiesCount} atividades?
✓ Cada dia tem categorias DIFERENTES?
✓ Nenhuma atividade se repete?
✓ Todos os preços foram informados?
✓ Horários são DIFERENTES em cada atividade?
✓ ⭐ INTERESSES COBERTOS: Cada um dos interesses [${tagsString}] está representado NO MÍNIMO 1 vez?
✓ ⭐ ALINHAMENTO: Cada atividade está alinhada com UM DOS interesses selecionados?
✓ ⭐ DISTRIBUIÇÃO: Interesses são distribuídos ao longo dos dias, não concentrados?

RESPONDA AGORA - SÓ JSON, SEM EXPLICAÇÕES:`,

    'en-US': `GENERATE 100% DIVERSIFIED AND CREATIVE ITINERARY FOR ${destination} (${tripScopeDescription})

🚨 MANDATORY PARAMETERS:
- Duration: ${days} days
- Budget: ${budgetDescription}
- Group: ${groupType}
- Interests: ${tagsString}
- Trip Type: ${tripScopeDescription}
- Season: ${season || 'not specified'}${userLocation && (userLocation.lat || userLocation.lng) ? `
- User Location: ${userLocation.address || `Latitude ${userLocation.lat?.toFixed(4)}, Longitude ${userLocation.lng?.toFixed(4)}`}

📍 USER LOCATION CONTEXT:
   - User is located in: ${userLocation.address || `Coordinates ${userLocation.lat?.toFixed(4)}, ${userLocation.lng?.toFixed(4)}`}
   - Consider the distance from ${destination} when planning
   - For domestic trips (Brazil): consider travel time/domestic flights
   - For international trips: international flights may be necessary` : ''}

⚠️ CRITICAL RULE - TRIP TYPE (${tripScopeDescription.toUpperCase()}):
${tripScope === 'nacional' 
  ? '🇧🇷 DOMESTIC MANDATORY: All activities MUST be within Brazil ONLY.\n   ❌ NOT ALLOWED: Activities outside Brazil.\n   ✅ VALID: São Paulo, Rio, Bahia, Santa Catarina, Minas Gerais, any location in Brazil.'
  : tripScope === 'internacional'
  ? '🌍 INTERNATIONAL MANDATORY: All activities MUST be outside Brazil.\n   ❌ NOT ALLOWED: Activities inside Brazil.\n   ✅ VALID: Argentina, Peru, Chile, Europe, Asia, any location OUTSIDE Brazil.'
  : 'Trip type not specified'
}

🎯 CRITICAL REQUIREMENTS - MUST COMPLY WITH ALL:

1. EXACTLY ${activitiesCount} ACTIVITIES (${days} activities per day):
   ✅ Total activities: ${activitiesCount}
   ✅ Distribution: 3 activities per day
   ✅ Variation: each day DIFFERENT from previous

2. ZERO REPETITION - ABSOLUTE RULE:
   ❌ CANNOT repeat ANY activity between days
   ❌ CANNOT repeat ANY category between days
   ❌ CANNOT repeat ANY food type between days
   ❌ CANNOT repeat similar time between days

3. FORCED DIVERSITY - MANDATORY STRUCTURE PER DAY:
   
   Day 1 - TYPE A: [Historical Culture] [Local Food] [Nighttime Entertainment]
   Day 2 - TYPE B: [Nature/Outdoor] [Upscale Food] [Art/Museum]
   Day 3 - TYPE C: [Immersive Experience] [Casual Food] [Nightlife/Bar]
   Day 4 - TYPE D: [Shopping/Market] [Modern Food] [Active Activity]
   
   If more days, alternate between TYPES A, B, C, D

4. ALLOWED CATEGORIES (use 1 different per activity):
   ✅ Monument/Historical
   ✅ Museum/Art
   ✅ Park/Nature
   ✅ Beach/Water
   ✅ Trail/Hiking
   ✅ Fine Dining
   ✅ Local Food/Market
   ✅ Casual Food/Street
   ✅ Modern Food/Fusion
   ✅ Bar/Drinks
   ✅ Nightclub
   ✅ Shopping/Mall
   ✅ Local Market
   ✅ Adventure Experience
   ✅ Spa/Wellness

5. RESPECT ${budgetDescription} BUDGET:
   - Show REAL price in USD (don't leave blank)
   - Suggest alternatives if expensive
   - DON'T recommend expensive activities for low budgets
   - Include: transport, food, entrance

6. ADAPT TO ${season || 'current'} SEASON:
   - Consider weather and seasonal activities
   - Include events/festivals if relevant
   - DON'T recommend beach in winter (unless southern hemisphere)

7. EACH ACTIVITY REQUIRES:
   - REALISTIC time: 09:00-22:00 (don't repeat from previous activity)
   - REAL duration in minutes (don't leave everything 120)
   - EXACT place/restaurant name (searchable in Google Maps)
   - SPECIFIC reason (not generic like "visit monument")
   - PRACTICAL tip (not common phrase)
   - GPS coordinates or leave 0 (mandatory for 60% of activities)

CORRECT VARIATION EXAMPLE (2 days in New York, Yoga, Medium):
Day 1:
  - 09:00: Central Park Yoga Class (Historical) - Wellness in nature
  - 13:00: Gramercy Tavern (Local Food) - Farm-to-table menu
  - 19:00: Rooftop 230 Fifth (Nightlife) - Cocktails with skyline view

Day 2:
  - 08:00: Breakneck Ridge Trail (Nature) - Hiking with river views
  - 12:30: Juice Bar in SOHO (Casual Food) - Post-hike smoothie
  - 20:00: Blue Note Jazz Club (Bar/Culture) - Live jazz performance

JSON FORMAT (no markdown, no code blocks, valid):
{
  "itinerary": [
    {"day": 1, "time": "09:00", "name": "Exact Place Name", "duration": 120, "reason": "Specific reason", "tip": "Tip", "category": "Category", "lat": 40.7128, "lng": -74.0060},
    {"day": 1, "time": "13:00", "name": "Real Restaurant", "duration": 90, "reason": "Food type", "tip": "Book ahead", "category": "Food", "lat": 0, "lng": 0}
  ]
}

⚠️ FINAL VALIDATION BEFORE RESPONDING:
✓ Did I count ${activitiesCount} activities?
✓ Does each day have DIFFERENT categories?
✓ Does no activity repeat?
✓ Were all prices informed?
✓ Are times DIFFERENT in each activity?
✓ ⭐ INTERESTS COVERED: Is each of the interests [${tagsString}] represented AT LEAST once?
✓ ⭐ ALIGNMENT: Is every activity aligned with ONE OF the selected interests?
✓ ⭐ DISTRIBUTION: Are interests spread across days, not concentrated?

RESPOND NOW - ONLY JSON, NO EXPLANATIONS:`,

    'es-ES': `GENERAR ITINERARIO 100% DIVERSIFICADO Y CREATIVO PARA ${destination} (${tripScopeDescription})

🚨 PARÁMETROS OBLIGATORIOS:
- Duración: ${days} días
- Presupuesto: ${budgetDescription}
- Grupo: ${groupType}
- Intereses: ${tagsString}
- Tipo de Viaje: ${tripScopeDescription}
- Estación: ${season || 'no especificada'}

⚠️ REGLA CRÍTICA - TIPO DE VIAJE (${tripScopeDescription.toUpperCase()}):
${tripScope === 'nacional' 
  ? '🇧🇷 NACIONAL OBLIGATORIO: Todas las actividades DEBEN estar dentro de Brasil SOLAMENTE.\n   ❌ NO PERMITIDO: Actividades fuera de Brasil.\n   ✅ VÁLIDO: São Paulo, Rio, Bahia, Santa Catarina, Minas Gerais, cualquier lugar en Brasil.'
  : tripScope === 'internacional'
  ? '🌍 INTERNACIONAL OBLIGATORIO: Todas las actividades DEBEN estar fuera de Brasil.\n   ❌ NO PERMITIDO: Actividades dentro de Brasil.\n   ✅ VÁLIDO: Argentina, Perú, Chile, Europa, Asia, cualquier lugar FUERA de Brasil.'
  : 'Tipo de viaje no especificado'
}

🎯 REQUISITOS CRÍTICOS - DEBE CUMPLIR TODOS:

⭐⭐⭐ REQUISITO #0: INTERESES SELECCIONADOS (¡PRIORIDAD MÁXIMA!) ⭐⭐⭐
   🎯 INTERESES DEL USUARIO: ${tagsString.toUpperCase()}
   📋 OBLIGACIÓN: CADA actividad DEBE estar alineada con UNO de los intereses seleccionados
   ✅ EJEMPLO: Si usuario seleccionó "Playa, Relajación, Gastronomía":
      - Actividad 1: Playa con piscinas naturales (alineado con PLAYA)
      - Actividad 2: Spa con masaje relajante (alineado con RELAJACIÓN)
      - Actividad 3: Restaurante con gastronomía local (alineado con GASTRONOMÍA)
   ❌ NO HACER: Sugerir trekking de montaña extrema si usuario no seleccionó "Aventura"
   ❌ NO HACER: Sugerir museo de arte si usuario seleccionó "Playa, Comida, Diversión"
   
   📊 MAPEO DE INTERESES → ACTIVIDADES:
   ${mapInterestsToActivities(tags)}
   
   🔄 DISTRIBUCIÓN DE INTERESES POR DÍA:
   - Cada día DEBE tener actividades de DIFERENTES intereses
   - Si 3 intereses, cada día tiene 1 interés diferente
   - O alterne entre intereses en los 3 horarios del día
   - NUNCA coloque 3 actividades del mismo interés en un día

1. EXACTAMENTE ${activitiesCount} ACTIVIDADES (${days} actividades por día):
   ✅ Total actividades: ${activitiesCount}
   ✅ Distribución: 3 actividades por día
   ✅ Variación: cada día DIFERENTE del anterior

2. CERO REPETICIÓN - REGLA ABSOLUTA:
   ❌ NO puede repetir NINGUNA actividad entre días
   ❌ NO puede repetir NINGUNA categoría entre días
   ❌ NO puede repetir NINGÚN tipo de comida entre días
   ❌ NO puede repetir horario similar entre días

3. DIVERSIDAD FORZADA - ESTRUCTURA OBLIGATORIA POR DÍA:
   
   Día 1 - TIPO A: [Cultura Histórica] [Comida Local] [Entretenimiento Nocturno]
   Día 2 - TIPO B: [Naturaleza/Outdoor] [Comida Sofisticada] [Arte/Museo]
   Día 3 - TIPO C: [Experiencia Inmersiva] [Comida Casual] [Vida Nocturna/Bar]
   Día 4 - TIPO D: [Compras/Mercado] [Comida Moderna] [Actividad Activa]
   
   Si hay más días, alternar entre TIPOS A, B, C, D

4. CATEGORÍAS PERMITIDAS (use 1 diferente por actividad):
   ✅ Monumento/Histórico
   ✅ Museo/Arte
   ✅ Parque/Naturaleza
   ✅ Playa/Agua
   ✅ Senderismo/Trail
   ✅ Restaurante Fino
   ✅ Comida Local/Mercado
   ✅ Comida Casual/Calle
   ✅ Comida Moderna/Fusión
   ✅ Bar/Tragos
   ✅ Discoteca
   ✅ Compras/Centro Comercial
   ✅ Mercado Local
   ✅ Experiencia Aventurera
   ✅ Spa/Bienestar

5. RESPETAR PRESUPUESTO ${budgetDescription}:
   - Mostrar PRECIO REAL en USD (no dejar en blanco)
   - Sugerir alternativas si es caro
   - NO recomendar actividades caras para presupuestos bajos
   - Incluir: transporte, comida, entrada

6. ADAPTAR A LA ESTACIÓN ${season || 'actual'}:
   - Considerar clima y actividades estacionales
   - Incluir eventos/festivales si relevante
   - NO recomendar playa en invierno (a menos que hemisferio sur)

7. CADA ACTIVIDAD REQUIERE:
   - Hora REALISTA: 09:00-22:00 (no repetir de actividad anterior)
   - Duración REAL en minutos (no dejar todo 120)
   - Nombre EXACTO del lugar/restaurante (buscable en Google Maps)
   - Razón ESPECÍFICA (no genérica como "visitar monumento")
   - Consejo PRÁCTICO (no frase común)
   - Coordenadas GPS o dejar 0 (obligatorio para 60% de actividades)

EJEMPLO DE VARIACIÓN CORRECTA (2 días en Barcelona, Yoga, Medio):
Día 1:
  - 09:00: Park Güell (Histórico) - Arquitectura modernista única
  - 13:00: El Xampanyet (Comida Local) - Tapas y vino local
  - 19:00: Sala Apolo (Vida Nocturna) - Concierto indie en vivo

Día 2:
  - 08:00: Montserrat Mountain Trail (Naturaleza) - Senderismo con vistas
  - 12:30: Cal Pep (Comida Sofisticada) - Seafood gourmet
  - 20:00: Vermouth Hour en La Ribera (Bar/Socializar) - Aperitivo tradicional

FORMATO JSON (sin markdown, sin bloques de código, válido):
{
  "itinerary": [
    {"day": 1, "time": "09:00", "name": "Nombre Exacto del Lugar", "duration": 120, "reason": "Razón específica", "tip": "Consejo", "category": "Categoría", "lat": 41.3851, "lng": 2.1734},
    {"day": 1, "time": "13:00", "name": "Restaurante Real", "duration": 90, "reason": "Tipo comida", "tip": "Reservar", "category": "Comida", "lat": 0, "lng": 0}
  ]
}

⚠️ VALIDACIÓN FINAL ANTES DE RESPONDER:
✓ ¿Conté ${activitiesCount} actividades?
✓ ¿Cada día tiene categorías DIFERENTES?
✓ ¿Ninguna actividad se repite?
✓ ¿Se informaron todos los precios?
✓ ¿Los horarios son DIFERENTES en cada actividad?
✓ ⭐ INTERESES CUBIERTOS: ¿Cada uno de los intereses [${tagsString}] está representado AL MENOS una vez?
✓ ⭐ ALINEACIÓN: ¿Cada actividad está alineada con UNO DE los intereses seleccionados?
✓ ⭐ DISTRIBUCIÓN: ¿Los intereses se distribuyen entre los días, no concentrados?

RESPONDA AHORA - SOLO JSON, SIN EXPLICACIONES:`,
  };

  return prompts[language] || prompts['en-US'];
};

/**
 * Translate activity categories
 */
export const translateCategory = (category: string, language: LanguageCode): string => {
  const categoryTranslations: Record<string, Record<LanguageCode, string>> = {
    'Historical': {
      'pt-BR': 'Histórico',
      'en-US': 'Historical',
      'es-ES': 'Histórico',
    },
    'Cultural': {
      'pt-BR': 'Cultural',
      'en-US': 'Cultural',
      'es-ES': 'Cultural',
    },
    'Food & Beverage': {
      'pt-BR': 'Gastronomia',
      'en-US': 'Food & Beverage',
      'es-ES': 'Gastronomía',
    },
    'Nature': {
      'pt-BR': 'Natureza',
      'en-US': 'Nature',
      'es-ES': 'Naturaleza',
    },
    'Adventure': {
      'pt-BR': 'Aventura',
      'en-US': 'Adventure',
      'es-ES': 'Aventura',
    },
    'Relaxation': {
      'pt-BR': 'Relaxamento',
      'en-US': 'Relaxation',
      'es-ES': 'Relajación',
    },
    'Shopping': {
      'pt-BR': 'Compras',
      'en-US': 'Shopping',
      'es-ES': 'Compras',
    },
    'Art & Museums': {
      'pt-BR': 'Arte & Museus',
      'en-US': 'Art & Museums',
      'es-ES': 'Arte & Museos',
    },
    'Entertainment': {
      'pt-BR': 'Entretenimento',
      'en-US': 'Entertainment',
      'es-ES': 'Entretenimiento',
    },
    'Exploration': {
      'pt-BR': 'Exploração',
      'en-US': 'Exploration',
      'es-ES': 'Exploración',
    },
    'Beach': {
      'pt-BR': 'Praia',
      'en-US': 'Beach',
      'es-ES': 'Playa',
    },
    'Nightlife': {
      'pt-BR': 'Vida Noturna',
      'en-US': 'Nightlife',
      'es-ES': 'Vida Nocturna',
    },
  };
  
  return categoryTranslations[category]?.[language] || category;
};

/**
 * Get budget translations
 */
export const translateBudget = (budget: string, language: LanguageCode): string => {
  const budgetTranslations: Record<string, Record<LanguageCode, string>> = {
    'econômico': {
      'pt-BR': 'econômico',
      'en-US': 'budget',
      'es-ES': 'económico',
    },
    'médio': {
      'pt-BR': 'médio',
      'en-US': 'mid-range',
      'es-ES': 'medio',
    },
    'luxo': {
      'pt-BR': 'luxo',
      'en-US': 'luxury',
      'es-ES': 'lujo',
    },
    'economic': {
      'pt-BR': 'econômico',
      'en-US': 'budget',
      'es-ES': 'económico',
    },
    'mid': {
      'pt-BR': 'médio',
      'en-US': 'mid-range',
      'es-ES': 'medio',
    },
    'luxury': {
      'pt-BR': 'luxo',
      'en-US': 'luxury',
      'es-ES': 'lujo',
    },
  };
  
  const budgetLower = budget.toLowerCase();
  return budgetTranslations[budgetLower]?.[language] || budget;
};

/**
 * Get group type translations
 */
export const translateGroupType = (groupType: string, language: LanguageCode): string => {
  const groupTranslations: Record<string, Record<LanguageCode, string>> = {
    'casal': {
      'pt-BR': 'casal',
      'en-US': 'couple',
      'es-ES': 'pareja',
    },
    'family': {
      'pt-BR': 'família',
      'en-US': 'family',
      'es-ES': 'familia',
    },
    'friends': {
      'pt-BR': 'amigos',
      'en-US': 'friends',
      'es-ES': 'amigos',
    },
    'solo': {
      'pt-BR': 'viagem solo',
      'en-US': 'solo traveler',
      'es-ES': 'viaje en solitario',
    },
    'group': {
      'pt-BR': 'grupo',
      'en-US': 'group',
      'es-ES': 'grupo',
    },
    'couple': {
      'pt-BR': 'casal',
      'en-US': 'couple',
      'es-ES': 'pareja',
    },
  };
  
  const groupLower = groupType.toLowerCase();
  return groupTranslations[groupLower]?.[language] || groupType;
};

/**
 * Get error messages in the specified language
 */
export const getErrorMessage = (errorType: string, language: LanguageCode): string => {
  const errorMessages: Record<string, Record<LanguageCode, string>> = {
    'API_ERROR': {
      'pt-BR': 'Erro ao conectar com a IA. Tente novamente.',
      'en-US': 'Error connecting to AI service. Please try again.',
      'es-ES': 'Error al conectar con el servicio de IA. Intente de nuevo.',
    },
    'INVALID_RESPONSE': {
      'pt-BR': 'Resposta inválida da IA. Usando itinerário padrão.',
      'en-US': 'Invalid response from AI. Using default itinerary.',
      'es-ES': 'Respuesta inválida de la IA. Usando itinerario predeterminado.',
    },
    'RETRY_FAILED': {
      'pt-BR': 'Falha ao gerar itinerário após várias tentativas.',
      'en-US': 'Failed to generate itinerary after multiple attempts.',
      'es-ES': 'No se pudo generar el itinerario después de varios intentos.',
    },
    'NO_API_KEY': {
      'pt-BR': 'Chave da API não configurada.',
      'en-US': 'API key not configured.',
      'es-ES': 'Clave de API no configurada.',
    },
  };
  
  return errorMessages[errorType]?.[language] || 'An error occurred';
};

/**
 * Get system instruction for date recommendations
 */
export const getSystemInstructionForDates = (language: LanguageCode = 'pt-BR'): string => {
  const instructions: Record<LanguageCode, string> = {
    'pt-BR': `Você é um especialista em planejamento de viagens com profundo conhecimento de:
- Melhor época para cada destino (clima, preços, eventos, turismo)
- Padrões sazonais e variações climáticas mundiais
- Períodos de festas e eventos culturais
- Flutuações de preço de viagens por temporada

Quando um usuário descreve uma viagem, você fornecerá exatamente 3 recomendações de datas com:
1. Período específico (data início e fim)
2. Motivos em 4 categorias: clima, multidão, orçamento, eventos
3. Score de confiança (1-100)
4. Emoji representativo

Responda SEMPRE em JSON válido, nunca em markdown.`,
    
    'en-US': `You are an expert travel planning specialist with deep knowledge of:
- Best season for each destination (weather, prices, events, tourism)
- Seasonal patterns and climate variations worldwide
- Holiday and cultural event periods
- Travel price fluctuations by season

When a user describes a trip, provide exactly 3 date recommendations with:
1. Specific period (start and end date)
2. Reasons in 4 categories: climate, crowds, budget, events
3. Confidence score (1-100)
4. Representative emoji

Always respond in valid JSON, never in markdown.`,
    
    'es-ES': `Eres un especialista en planificación de viajes con profundo conocimiento de:
- Mejor época para cada destino (clima, precios, eventos, turismo)
- Patrones estacionales y variaciones climáticas mundiales
- Períodos de fiestas y eventos culturales
- Fluctuaciones de precios de viajes por temporada

Cuando un usuario describe un viaje, proporciona exactamente 3 recomendaciones de fechas con:
1. Período específico (fecha inicio y fin)
2. Razones en 4 categorías: clima, multitud, presupuesto, eventos
3. Puntuación de confianza (1-100)
4. Emoji representativo

Responde SIEMPRE en JSON válido, nunca en markdown.`,
  };

  return instructions[language] || instructions['pt-BR'];
};

/**
 * Generate date recommendation prompt in the specified language
 */
export const generateDateRecommendationPrompt = (
  destination: string,
  tripType: string,
  interests: string[],
  budget: string = 'medio',
  minDuration: number = 7,
  maxDuration: number = 10,
  language: LanguageCode = 'pt-BR',
): string => {
  const budgetMap: Record<string, Record<LanguageCode, string>> = {
    'econômico': { 'pt-BR': 'econômico', 'en-US': 'budget-friendly', 'es-ES': 'económico' },
    'médio': { 'pt-BR': 'médio', 'en-US': 'moderate', 'es-ES': 'moderado' },
    'luxo': { 'pt-BR': 'luxuoso', 'en-US': 'luxury', 'es-ES': 'lujoso' },
  };

  const tripTypeMap: Record<string, Record<LanguageCode, string>> = {
    'solo': { 'pt-BR': 'viajante solo', 'en-US': 'solo traveler', 'es-ES': 'viajero solo' },
    'casal': { 'pt-BR': 'casal', 'en-US': 'couple', 'es-ES': 'pareja' },
    'família': { 'pt-BR': 'família', 'en-US': 'family', 'es-ES': 'familia' },
    'amigos': { 'pt-BR': 'grupo de amigos', 'en-US': 'friends group', 'es-ES': 'grupo de amigos' },
  };

  const templates: Record<LanguageCode, string> = {
    'pt-BR': `Analise as seguintes preferências de viagem e recomende as 3 melhores épocas:

**Destino**: ${destination}
**Tipo de Viagem**: ${tripTypeMap[tripType]?.[language] || tripType}
**Interesses**: ${interests.join(', ')}
**Orçamento**: ${budgetMap[budget]?.[language] || budget}
**Duração Desejada**: ${minDuration}-${maxDuration} dias

Para cada recomendação, forneça um JSON com exatamente esta estrutura:
[
  {
    "label": "🌞 Descrição curta",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Descrição do clima nessa época",
      "crowds": "Informação sobre turismo/multidão",
      "budget": "Informação sobre preços e custos",
      "events": "Eventos ou festividades relevantes"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Importante:
- Datas devem ser futuras (a partir de hoje)
- Responda APENAS com JSON válido
- Scores: 90-100 (excelente), 75-89 (bom), 60-74 (aceitável)
- Emoji deve ser representativo da sugestão`,

    'en-US': `Analyze the following travel preferences and recommend the 3 best times to travel:

**Destination**: ${destination}
**Trip Type**: ${tripTypeMap[tripType]?.[language] || tripType}
**Interests**: ${interests.join(', ')}
**Budget**: ${budgetMap[budget]?.[language] || budget}
**Desired Duration**: ${minDuration}-${maxDuration} days

For each recommendation, provide JSON with exactly this structure:
[
  {
    "label": "🌞 Short description",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Weather description for this period",
      "crowds": "Information about tourism/crowds",
      "budget": "Information about prices and costs",
      "events": "Relevant events or festivities"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Important:
- Dates must be future (from today onwards)
- Respond ONLY with valid JSON
- Scores: 90-100 (excellent), 75-89 (good), 60-74 (acceptable)
- Emoji should be representative of the suggestion`,

    'es-ES': `Analiza las siguientes preferencias de viaje y recomienda los 3 mejores momentos:

**Destino**: ${destination}
**Tipo de Viaje**: ${tripTypeMap[tripType]?.[language] || tripType}
**Intereses**: ${interests.join(', ')}
**Presupuesto**: ${budgetMap[budget]?.[language] || budget}
**Duración Deseada**: ${minDuration}-${maxDuration} días

Para cada recomendación, proporciona JSON con exactamente esta estructura:
[
  {
    "label": "🌞 Descripción corta",
    "dateRange": {
      "start": "YYYY-MM-DD",
      "end": "YYYY-MM-DD"
    },
    "reasons": {
      "climate": "Descripción del clima en esta época",
      "crowds": "Información sobre turismo/multitud",
      "budget": "Información sobre precios y costos",
      "events": "Eventos o festividades relevantes"
    },
    "score": 95,
    "emoji": "🌞"
  },
  ...
]

Importante:
- Las fechas deben ser futuras (a partir de hoy)
- Responde SOLO con JSON válido
- Puntuaciones: 90-100 (excelente), 75-89 (bueno), 60-74 (aceptable)
- El emoji debe ser representativo de la sugestión`,
  };

  return templates[language] || templates['pt-BR'];
};

