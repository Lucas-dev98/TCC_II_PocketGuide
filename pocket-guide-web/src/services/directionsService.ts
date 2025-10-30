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
      if (coordinates.length < 2) {
        throw new Error('Pelo menos 2 coordenadas são necessárias');
      }

      if (coordinates.length > 25) {
        throw new Error('Máximo de 25 coordenadas permitidas');
      }

      // Formatar coordenadas como string semicolonada
      const coordinatesString = coordinates
        .map((coord) => `${coord.longitude},${coord.latitude}`)
        .join(';');

      // Construir parâmetros da query
      const params = new URLSearchParams({
        access_token: this.accessToken,
        overview: options?.overview || 'full',
        geometries: options?.geometries || 'geojson',
        steps: (options?.steps ?? true).toString(),
        bannerInstructions: (options?.bannerInstructions ?? false).toString(),
        voiceInstructions: (options?.voiceInstructions ?? false).toString(),
        language: options?.language || 'pt',
      });

      const url = `${this.baseUrl}/mapbox/${profile}/${coordinatesString}?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erro ao calcular rota: ${response.statusText}`);
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
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<DirectionRoute> {
    const response = await this.getDirections([origin, destination], profile, {
      overview: 'full',
      geometries: 'geojson',
      steps: true,
    });

    if (!response.routes || response.routes.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    return response.routes[0];
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
