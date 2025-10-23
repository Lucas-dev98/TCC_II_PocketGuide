import axios from 'axios';

const GRAPHHOPPER_API = 'https://graphhopper.com/api/1/route';

/**
 * Obter rota entre dois pontos usando GraphHopper
 * Executado no backend seguro
 */
export async function getRouteWithGraphHopper(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  vehicle: string = 'car'
): Promise<any> {
  try {
    const response = await axios.get(GRAPHHOPPER_API, {
      params: {
        key: process.env.GRAPHHOPPER_API_KEY,
        points: `${startLat},${startLng};${endLat},${endLng}`,
        vehicle: vehicle,
        locale: 'pt',
        points_encoded: false,
        details: ['road_class', 'surface'],
      },
    });

    const routes = response.data.routes;
    if (!routes || routes.length === 0) {
      throw new Error('No route found');
    }

    const route = routes[0];
    return {
      distance: route.distance, // meters
      time: route.time, // milliseconds
      points: route.points,
      bbox: route.bbox,
    };
  } catch (error) {
    console.error('Error getting route:', error);
    throw new Error('Failed to get route');
  }
}
