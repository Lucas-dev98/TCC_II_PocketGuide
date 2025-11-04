/**
 * Mapbox Geocoding Service
 * Autocomplete de cidades usando Mapbox Geocoding API
 * Com fallback para banco de dados local
 */

import { searchCitiesLocal, getCountryFromCityLocal } from '../utils/citiesDatabase';
import { CitySuggestion, GroupedCitySuggestions } from '../types';

interface GeocodeResult {
  id: string;
  name?: string;
  text?: string;
  place_name?: string;
  place_type: string[];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    name?: string;
    text?: string;
    text_pt?: string;
    short_code?: string;
  }>;
}

export type { CitySuggestion };

/**
 * Cache para armazenar resultados e evitar requisições desnecessárias
 */
const geocodeCache = new Map<string, CitySuggestion[]>();

/**
 * Classificar tipo de resultado (country, city, region, landmark)
 */
function classifyPlace(feature: GeocodeResult): 'country' | 'city' | 'region' | 'landmark' {
  // Verificar se é país
  if (feature.place_type?.includes('country')) {
    return 'country';
  }

  // Verificar se é região/estado
  if (feature.place_type?.includes('region')) {
    return 'region';
  }

  // Praias e pontos de interesse
  if (feature.place_type?.includes('poi') || feature.text?.toLowerCase().includes('praia')) {
    return 'landmark';
  }

  // Caso contrário é cidade
  return 'city';
}

/**
 * Calcular score de relevância (0-100)
 */
function calculateRelevance(feature: GeocodeResult, query: string): number {
  const queryLower = query.toLowerCase();
  const cityName = (feature.place_name || '').split(',')[0]?.toLowerCase() || '';

  let score = 50; // Base

  // Bônus se começa com a query
  if (cityName.startsWith(queryLower)) {
    score += 30;
  }

  // Bônus se é match exato
  if (cityName === queryLower) {
    score += 20;
  }

  // Bônus para capitais
  if (feature.context?.some((ctx) => ctx.id?.includes('capital'))) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Extrair descrição do local
 */
function getDescription(feature: GeocodeResult): string {
  // Verificar tipo
  if (feature.place_type?.includes('country')) {
    return 'País';
  }
  if (feature.place_type?.includes('region')) {
    return 'Região';
  }

  // Verificar se é capital
  if (feature.context?.some((ctx) => ctx.id?.includes('capital'))) {
    return 'Capital';
  }

  return 'Cidade';
}

/**
 * Busca por cidades usando Mapbox Geocoding API
 * @param query - Cidade a buscar
 * @param language - Idioma (pt, en, es)
 * @returns Promise com sugestões de cidades enriquecidas com tipo, relevância, etc.
 */
export async function searchCities(
  query: string,
  language: string = 'en'
): Promise<CitySuggestion[]> {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase();
  const cacheKey = `${queryLower}-${language}`;
  
  // PRIORIDADE 1: Verificar cache PRIMEIRO
  if (geocodeCache.has(cacheKey)) {
    console.log('💾 Cache hit:', cacheKey);
    return geocodeCache.get(cacheKey) || [];
  }

  // PRIORIDADE 2: Tentar banco de dados local PRIMEIRO (mais rápido e confiável)
  console.log('🔍 Buscando no banco local...');
  const localResults = searchCitiesLocal(query);
  if (localResults && localResults.length > 0) {
    const localSuggestions: CitySuggestion[] = localResults.map(city => ({
      city: city.name,
      country: city.country,
      coordinates: [0, 0] as [number, number],
      type: 'city',
      population: 0,
      description: 'Cidade',
      relevance: 80,
      isCapital: false,
      isMajorCity: false,
    }));
    console.log('✅ Encontrado no banco local:', localSuggestions.length, 'resultados');
    geocodeCache.set(cacheKey, localSuggestions);
    return localSuggestions;
  }

  // PRIORIDADE 3: Se não encontrou no local, tentar Mapbox API
  console.log('🌐 Banco local vazio, tentando Mapbox API...');
  
  try {
    const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
    console.log('🔑 Token configurado:', !!mapboxToken && mapboxToken.length > 0);
    
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.warn('⚠️ VITE_MAPBOX_API_KEY não configurada, usando apenas banco local');
      // Retornar banco local como fallback
      const fallbackResults = searchCitiesLocal(query);
      const fallbackSuggestions: CitySuggestion[] = fallbackResults.map(city => ({
        city: city.name,
        country: city.country,
        coordinates: [0, 0] as [number, number],
        type: 'city',
        population: 0,
        description: 'Cidade',
        relevance: 80,
        isCapital: false,
        isMajorCity: false,
      }));
      geocodeCache.set(cacheKey, fallbackSuggestions);
      return fallbackSuggestions;
    }
    
    const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/');
    url.pathname += `${encodeURIComponent(query)}.json`;
    url.searchParams.set('access_token', mapboxToken);
    url.searchParams.set('limit', '10');
    url.searchParams.set('language', language === 'pt' ? 'pt' : language === 'es' ? 'es' : 'en');

    console.log('📡 Chamando API Mapbox:', url.toString().split('pk.')[0] + 'pk.***');
    
    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    
    console.log('📦 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Dados recebidos:', data);
    
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error('Invalid Mapbox response');
    }

    // ✅ Processar resultados com dados enriquecidos
    const suggestionsWithType: CitySuggestion[] = data.features
      .map((feature: GeocodeResult) => {
        // Extrair país do context
        const countryContext = feature.context?.find(ctx => ctx.id?.startsWith('country.'));
        let country = countryContext?.name || countryContext?.text_pt || countryContext?.text || '';
        
        // Nome da cidade (sem país)
        const cityName = (feature.place_name || '').split(',')[0]?.trim() || feature.text || feature.name || '';
        
        console.log('🏙️ Processando:', { cityName, country, hasContext: !!countryContext });
        
        // Se não tem país, tenta buscar no banco local
        if (!country && cityName) {
          country = getCountryFromCityLocal(cityName) || '';
        }
        
        return {
          city: cityName,
          country: country,
          coordinates: feature.geometry?.coordinates as [number, number] || [0, 0],
          
          // ✅ Novos campos
          type: classifyPlace(feature),
          population: 0, // Mapbox não retorna população
          description: getDescription(feature),
          relevance: calculateRelevance(feature, query),
          isCapital: feature.context?.some(ctx => ctx.id?.includes('capital')) || false,
          isMajorCity: false, // Será atualizado após obter população
        };
      })
      .filter((s: CitySuggestion) => {
        const isValid = s.city && s.country;
        if (!isValid) {
          console.log('❌ Filtrada sugestão inválida:', s);
        }
        return isValid;
      }); // Remover entradas inválidas

    // Se não teve resultados válidos na API, tenta o banco local como fallback final
    if (suggestionsWithType.length === 0) {
      console.log('⚠️ API retornou resultados mas sem país, tentando banco local...');
      const localFallback = searchCitiesLocal(query);
      if (localFallback.length > 0) {
        const localSuggestions: CitySuggestion[] = localFallback.map(city => ({
          city: city.name,
          country: city.country,
          coordinates: [0, 0] as [number, number],
          type: 'city',
          population: 0,
          description: 'Cidade',
          relevance: 80,
          isCapital: false,
          isMajorCity: false,
        }));
        geocodeCache.set(cacheKey, localSuggestions);
        console.log('✅ Usando banco local como fallback:', localSuggestions.length, 'resultados');
        return localSuggestions;
      }
    }

    // ✅ Remover duplicatas mantendo o com maior relevância
    const uniqueSuggestions = Array.from(
      new Map(suggestionsWithType.map(s => [
        `${s.city.toLowerCase()}-${s.country.toLowerCase()}`,
        s
      ])).values()
    );

    // ✅ Ordenar por relevância
    uniqueSuggestions.sort((a, b) => {
      // 1. Por relevância score
      if ((b.relevance || 0) !== (a.relevance || 0)) {
        return (b.relevance || 0) - (a.relevance || 0);
      }
      
      // 2. Por população
      if ((b.population || 0) !== (a.population || 0)) {
        return (b.population || 0) - (a.population || 0);
      }
      
      // 3. Alfabético
      return a.city.localeCompare(b.city);
    });

    // Cachear resultado
    geocodeCache.set(cacheKey, uniqueSuggestions);

    console.log('✅ API Mapbox:', uniqueSuggestions.length, 'resultados');
    return uniqueSuggestions;
  } catch (error) {
    console.error('❌ Erro API Mapbox:', error);
    
    // Fallback: Usar banco de dados local
    console.log('🔄 Fallback para banco local');
    const localResults = searchCitiesLocal(query);
    const localSuggestions: CitySuggestion[] = localResults.map(city => ({
      city: city.name,
      country: city.country,
      coordinates: [0, 0] as [number, number],
      type: 'city',
      population: 0,
      description: 'Cidade',
      relevance: 80,
      isCapital: false,
      isMajorCity: false,
    }));
    
    geocodeCache.set(cacheKey, localSuggestions);
    return localSuggestions;
  }
}

/**
 * Agrupar sugestões por tipo
 */
export function groupSuggestions(suggestions: CitySuggestion[]): GroupedCitySuggestions {
  return {
    countries: suggestions.filter(s => s.type === 'country'),
    cities: suggestions.filter(s => s.type === 'city'),
    regions: suggestions.filter(s => s.type === 'region'),
    landmarks: suggestions.filter(s => s.type === 'landmark'),
  };
}

/**
 * Busca o país de uma cidade específica
 * @param city - Nome da cidade
 * @param language - Idioma
 * @returns Promise com o país (string)
 */
export async function getCountryFromCityAPI(
  city: string,
  language: string = 'en'
): Promise<string | null> {
  const suggestions = await searchCities(city, language);
  
  if (suggestions.length > 0) {
    // Retornar o país da primeira sugestão (mais relevante)
    return suggestions[0].country;
  }
  
  return null;
}

/**
 * Limpar cache (útil para testes ou quando mudar idioma)
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
