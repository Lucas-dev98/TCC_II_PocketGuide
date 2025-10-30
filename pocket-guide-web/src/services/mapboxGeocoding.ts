/**
 * Mapbox Geocoding Service
 * Autocomplete de cidades usando Mapbox Geocoding API
 * Com fallback para banco de dados local
 */

import { searchCitiesLocal } from '../utils/citiesDatabase';

interface GeocodeResult {
  id: string;
  name: string;
  place_name: string;
  place_type: string[];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    name: string;
    short_code?: string;
  }>;
}

interface CitySuggestion {
  city: string;
  country: string;
  coordinates: [number, number];
}

export type { CitySuggestion };

/**
 * Cache para armazenar resultados e evitar requisições desnecessárias
 */
const geocodeCache = new Map<string, CitySuggestion[]>();

/**
 * Busca por cidades usando Mapbox Geocoding API
 * @param query - Cidade a buscar
 * @param language - Idioma (pt, en, es)
 * @returns Promise com sugestões de cidades
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

  // PRIORIDADE 2: Tentar banco de dados local (mais rápido e confiável)
  console.log('🔍 Buscando no banco local...');
  const localResults = searchCitiesLocal(query);
  if (localResults && localResults.length > 0) {
    const localSuggestions = localResults.map(city => ({
      city: city.name,
      country: city.country,
      coordinates: [0, 0] as [number, number],
    }));
    console.log('✅ Encontrado no banco local:', localSuggestions.length, 'resultados');
    geocodeCache.set(cacheKey, localSuggestions);
    return localSuggestions;
  }

  // PRIORIDADE 3: Se não encontrou no local, tentar Mapbox API
  console.log('🌐 Banco local vazio, tentando Mapbox API...');
  
  try {
    const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY;
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.warn('⚠️ VITE_MAPBOX_API_KEY não configurada, usando apenas banco local');
      // Retornar banco local como fallback
      const fallbackResults = searchCitiesLocal(query);
      const fallbackSuggestions = fallbackResults.map(city => ({
        city: city.name,
        country: city.country,
        coordinates: [0, 0] as [number, number],
      }));
      geocodeCache.set(cacheKey, fallbackSuggestions);
      return fallbackSuggestions;
    }
    
    const url = new URL('https://api.mapbox.com/geocoding/v5/mapbox.places/');
    url.pathname += `${encodeURIComponent(query)}.json`;
    url.searchParams.set('access_token', mapboxToken);
    url.searchParams.set('limit', '10');
    url.searchParams.set('language', language === 'pt' ? 'pt' : language === 'es' ? 'es' : 'en');

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.features || !Array.isArray(data.features)) {
      throw new Error('Invalid Mapbox response');
    }

    // Processar resultados
    const suggestions: CitySuggestion[] = data.features
      .filter((feature: GeocodeResult) => {
        // Apenas features que têm país no context
        return feature.context?.some(ctx => ctx.id?.startsWith('country.'));
      })
      .map((feature: GeocodeResult) => {
        // Extrair país do context (com fallback)
        const countryContext = feature.context?.find(ctx => ctx.id?.startsWith('country.'));
        const country = countryContext?.name || 'Unknown';
        
        // Nome da cidade (sem país) - com fallback seguro
        const cityName = (feature.place_name || '').split(',')[0]?.trim() || feature.name || '';
        
        return {
          city: cityName,
          country: country,
          coordinates: feature.geometry?.coordinates as [number, number] || [0, 0],
        };
      })
      .filter((s: CitySuggestion) => s.city && s.country); // Remover entradas inválidas

    // Remover duplicatas
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [`${s.city}-${s.country}`, s])).values()
    );

    // Cachear resultado
    geocodeCache.set(cacheKey, uniqueSuggestions);

    console.log('✅ API Mapbox:', uniqueSuggestions.length, 'resultados');
    return uniqueSuggestions;
  } catch (error) {
    console.error('❌ Erro API Mapbox:', error);
    
    // Fallback: Usar banco de dados local
    console.log('🔄 Fallback para banco local');
    const localResults = searchCitiesLocal(query);
    const localSuggestions = localResults.map(city => ({
      city: city.name,
      country: city.country,
      coordinates: [0, 0] as [number, number],
    }));
    
    geocodeCache.set(cacheKey, localSuggestions);
    return localSuggestions;
  }
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
