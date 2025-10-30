export interface DirectionCoordinate {
  longitude: number;
  latitude: number;
}

export interface DirectionRoute {
  geometry: string;
  distance: number;
  duration: number;
  legs: DirectionLeg[];
}

export interface DirectionLeg {
  distance: number;
  duration: number;
  summary: string;
  steps: DirectionStep[];
}

export interface DirectionStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    instruction: string;
  };
  geometry: string;
}

export interface DirectionResponse {
  code: string;
  routes: DirectionRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
    distance: number;
  }>;
}

/**
 * Serviço para integração com Mapbox Directions API
 * Calcula rotas otimizadas entre múltiplas coordenadas
 */
class DirectionsService {
  private baseUrl = 'https://api.mapbox.com/directions/v5';
  private accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

  /**
   * Calcula a rota entre dois ou mais pontos
   * @param coordinates Array de [longitude, latitude]
   * @param profile Perfil de roteamento (driving, walking, cycling, driving-traffic)
   * @param options Opções adicionais (overview, geometries, steps, etc)
   */
  async getDirections(
    coordinates: DirectionCoordinate[],
    profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic' = 'driving',
    options?: {
      overview?: 'full' | 'simplified' | 'false';
      geometries?: 'geojson' | 'polyline' | 'polyline6';
      steps?: boolean;
      bannerInstructions?: boolean;
      voiceInstructions?: boolean;
      language?: string;
    }
  ): Promise<DirectionResponse> {
    try {
      console.log('🧭 DirectionsService.getDirections called with:', {
        coordinatesCount: coordinates.length,
        coordinates: coordinates.map(c => ({ lat: c.latitude, lng: c.longitude })),
        profile,
      });

      if (coordinates.length < 2) {
        throw new Error('Pelo menos 2 coordenadas são necessárias');
      }

      if (coordinates.length > 25) {
        throw new Error('Máximo de 25 coordenadas permitidas');
      }

      // Validar coordenadas
      coordinates.forEach((coord, idx) => {
        console.log(`🧭 Validating coordinate ${idx}:`, {
          longitude: coord.longitude,
          longitude_type: typeof coord.longitude,
          longitude_isFinite: Number.isFinite(coord.longitude),
          latitude: coord.latitude,
          latitude_type: typeof coord.latitude,
          latitude_isFinite: Number.isFinite(coord.latitude),
        });

        if (!Number.isFinite(coord.longitude) || !Number.isFinite(coord.latitude)) {
          throw new Error(
            `Coordenada ${idx} inválida: lng=${coord.longitude}, lat=${coord.latitude}`
          );
        }
        if (coord.longitude < -180 || coord.longitude > 180) {
          throw new Error(`Longitude ${idx} fora do range: ${coord.longitude}`);
        }
        if (coord.latitude < -90 || coord.latitude > 90) {
          throw new Error(`Latitude ${idx} fora do range: ${coord.latitude}`);
        }
      });

      // Formatar coordenadas como string semicolonada
      const coordinatesString = coordinates
        .map((coord) => `${coord.longitude},${coord.latitude}`)
        .join(';');

      console.log('🧭 Formatted coordinates:', coordinatesString);

      // Construir parâmetros da query
      // Nota: Mapbox espera parâmetros booleanos como true/false (sem aspas)
      // Para isso, construímos a query string manualmente
      const queryParams = [
        `access_token=${encodeURIComponent(this.accessToken)}`,
        `overview=${encodeURIComponent(options?.overview || 'full')}`,
        `geometries=${encodeURIComponent(options?.geometries || 'geojson')}`,
        `steps=${options?.steps ?? true}`,
        `bannerInstructions=${options?.bannerInstructions ?? false}`,
        `voiceInstructions=${options?.voiceInstructions ?? false}`,
        `language=${encodeURIComponent(options?.language || 'pt')}`,
      ].join('&');

      const url = `${this.baseUrl}/mapbox/${profile}/${coordinatesString}?${queryParams}`;

      console.log('🧭 API URL (without token):', url.split('access_token=')[0] + 'access_token=***');

      const response = await fetch(url);

      console.log('🧭 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🧭 API Error response:', errorText);
        throw new Error(`Erro ao calcular rota: ${response.status} ${response.statusText}`);
      }

      const data: DirectionResponse = await response.json();

      if (data.code !== 'Ok') {
        throw new Error(`Erro de rota: ${data.code}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Erro no serviço de direções:', error);
      throw error;
    }
  }

  /**
   * Calcula rota rápida entre dois pontos
   * @param origin Ponto de partida [longitude, latitude]
   * @param destination Ponto de destino [longitude, latitude]
   * @param profile Perfil de roteamento
   */
  async getQuickRoute(
    origin: DirectionCoordinate,
    destination: DirectionCoordinate,
    profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic' = 'driving'
  ): Promise<DirectionResponse> {
    console.log('🧭 DirectionsService.getQuickRoute called with:', {
      origin: { lat: origin.latitude, lng: origin.longitude },
      destination: { lat: destination.latitude, lng: destination.longitude },
      profile,
    });

    return this.getDirections([origin, destination], profile);
  }

  /**
   * Calcula distância em km entre dois pontos
   * @param route Rota da API
   */
  formatDistance(route: DirectionRoute): string {
    const distanceInKm = route.distance / 1000;
    return distanceInKm.toFixed(2);
  }

  /**
   * Formata duração em minutos e horas
   * @param route Rota da API
   */
  formatDuration(route: DirectionRoute): string {
    const totalSeconds = route.duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Extrai coordenadas da geometria GeoJSON
   * @param geometry Geometria GeoJSON LineString
   */
  extractCoordinatesFromGeometry(
    geometry: any
  ): Array<[number, number]> {
    if (geometry.type === 'LineString') {
      return geometry.coordinates;
    }
    return [];
  }

  /**
   * Valida se duas coordenadas são válidas
   */
  validateCoordinates(coords: DirectionCoordinate): boolean {
    const { longitude, latitude } = coords;
    return (
      typeof longitude === 'number' &&
      typeof latitude === 'number' &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    );
  }
}

export const directionsService = new DirectionsService();
export default directionsService;
