/**
 * services/mapbox.ts
 * Mapbox GL integration with Pocket Guide
 */

import { FeatureCollection, Feature, Point } from 'geojson';

interface MapboxAttractionMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
}

interface MapboxRoute {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

/**
 * Converte uma lista de atrações para GeoJSON
 */
export const attractionsToGeoJSON = (
  attractions: MapboxAttractionMarker[]
): FeatureCollection => {
  const features: Feature<Point>[] = attractions.map((attraction) => ({
    type: 'Feature',
    properties: {
      id: attraction.id,
      name: attraction.name,
      description: attraction.description,
      category: attraction.category,
    },
    geometry: {
      type: 'Point',
      coordinates: [attraction.longitude, attraction.latitude],
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
};

/**
 * Cria um estilo de mapa customizado para Mapbox GL
 */
export const createMapboxStyle = () => {
  return {
    version: 8,
    name: 'Pocket Guide',
    metadata: {
      'mapbox:autocomposite': true,
      'mapbox:type': 'template',
      'openmaptiles:version': '3.3',
      'openmaptiles:mapbox:owner': 'openmaptiles',
      'openmaptiles:mapbox:name': 'OpenMapTiles',
      'maputnik:editor': 'https://maputnik.github.io',
      'maputnik:last_update': new Date().toISOString(),
    },
    sources: {
      'openmaptiles': {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
      },
    },
    sprite: 'mapbox://sprites/mapbox/streets-v8',
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#eeeeee',
        },
      },
    ],
  };
};

/**
 * Obtém as coordenadas de um endereço usando Nominatim
 */
export const geocodeAddress = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Endereço não encontrado');
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    throw error;
  }
};

/**
 * Obtém a rota entre múltiplos pontos usando GraphHopper
 */
export const getOptimizedRoute = async (
  coordinates: [number, number][], // [lng, lat]
  apiKey: string
): Promise<MapboxRoute> => {
  try {
    if (coordinates.length < 2) {
      throw new Error('Pelo menos 2 coordenadas são necessárias');
    }

    // Formatar para GraphHopper: point=lat,lng|lat,lng
    const points = coordinates
      .map(([lng, lat]) => `${lat},${lng}`)
      .join('|');

    const response = await fetch(
      `https://graphhopper.com/api/1/route?` +
      `point=${points}` +
      `&vehicle=car` +
      `&locale=pt` +
      `&key=${apiKey}` +
      `&points_encoded=false`
    );

    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.paths || data.paths.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    const path = data.paths[0];
    const routeCoordinates: [number, number][] = path.points.coordinates.map(
      (point: [number, number]) => [point[0], point[1]]
    );

    return {
      coordinates: routeCoordinates,
      distance: path.distance / 1000, // Converter para km
      duration: path.time / 60000, // Converter para minutos
    };
  } catch (error) {
    console.error('Erro ao obter rota:', error);
    throw error;
  }
};

/**
 * Calcula a distância entre dois pontos (Fórmula de Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Valida se as coordenadas estão dentro de um retângulo delimitador
 */
export const isWithinBounds = (
  latitude: number,
  longitude: number,
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }
): boolean => {
  return (
    latitude >= bounds.minLat &&
    latitude <= bounds.maxLat &&
    longitude >= bounds.minLng &&
    longitude <= bounds.maxLng
  );
};

/**
 * Formata a duração em formato legível
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) {
    return 'Menos de 1 minuto';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Formata a distância em formato legível
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};
