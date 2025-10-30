import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const mapboxRouter = Router();

/**
 * Mapbox Search Request Schema
 * Validates input for geocoding requests
 */
const MapboxSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .max(100, 'Query must be less than 100 characters'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(10, 'Limit must be at most 10')
    .default(5),
  types: z
    .array(z.string())
    .optional()
    .default(['place']), // place, region, country, etc.
  language: z
    .enum(['pt', 'en', 'es'])
    .optional()
    .default('en'),
});

type MapboxSearchRequest = z.infer<typeof MapboxSearchSchema>;

interface MapboxFeature {
  id: string;
  type: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    name: string;
    short_name?: string;
    wikidata?: string;
  };
  place_name: string;
  bbox?: [number, number, number, number];
  center: [number, number];
  place_type: string[];
  relevance: number;
}

interface MapboxResponse {
  type: 'FeatureCollection';
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

/**
 * POST /api/mapbox/search
 * Search for locations using Mapbox Geocoding API
 * 
 * Request body:
 * {
 *   query: string (required, 1-100 chars)
 *   longitude?: number (-180 to 180)
 *   latitude?: number (-90 to 90)
 *   limit?: number (1-10, default 5)
 *   types?: string[] (default ['place'])
 *   language?: 'pt' | 'en' | 'es' (default 'en')
 * }
 * 
 * Response:
 * {
 *   type: 'FeatureCollection'
 *   features: [
 *     {
 *       id: string
 *       place_name: string
 *       center: [longitude, latitude]
 *       geometry: { type: 'Point', coordinates: [lng, lat] }
 *       place_type: string[]
 *       relevance: number
 *     }
 *   ]
 * }
 */
mapboxRouter.post('/search', async (req, res, next) => {
  try {
    // Validate request body with Zod
    const parsed = MapboxSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Mapbox search validation failed', parsed.error.issues);
      throw new ApiError(
        400,
        'Invalid request parameters',
        parsed.error.issues
      );
    }

    const { query, longitude, latitude, limit, types, language } = parsed.data;

    // Check API key
    const apiKey = process.env.MAPBOX_TOKEN;
    if (!apiKey) {
      logger.error('MAPBOX_TOKEN not configured');
      throw new ApiError(500, 'Mapbox service unavailable');
    }

    // Build proximity parameter if coordinates provided
    let proximityParam = '';
    if (longitude !== undefined && latitude !== undefined) {
      proximityParam = `&proximity=${longitude},${latitude}`;
    }

    // Build types filter
    const typesParam = types.map((t) => `type=${t}`).join('&');
    const typeFilter = typesParam ? `&${typesParam}` : '';

    // Build language parameter
    const languageParam = language ? `&language=${language}` : '';

    // Build Mapbox API URL
    const url = 
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${apiKey}` +
      `&limit=${limit}` +
      proximityParam +
      typeFilter +
      languageParam;

    logger.info('Calling Mapbox API', {
      query,
      limit,
      hasProximity: !!(longitude && latitude),
    });

    // Call Mapbox API with timeout
    const response = await axios.get<MapboxResponse>(url, {
      timeout: 30000, // 30 seconds
      headers: {
        'Accept': 'application/json',
      },
    });

    logger.info('Mapbox API response received', {
      featureCount: response.data.features.length,
      query,
    });

    // Extract relevant data to send to frontend
    const features = response.data.features.map((feature) => ({
      id: feature.id,
      name: feature.place_name,
      short_name: feature.properties?.short_name || feature.place_name,
      coordinates: {
        latitude: feature.center[1],
        longitude: feature.center[0],
      },
      place_types: feature.place_type,
      relevance: feature.relevance,
      bbox: feature.bbox,
    }));

    res.json({
      success: true,
      query,
      total: features.length,
      results: features,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (axios.isAxiosError(error)) {
      logger.error('Mapbox API error', {
        status: error.response?.status,
        message: error.message,
      });

      if (error.response?.status === 401) {
        next(new ApiError(401, 'Invalid Mapbox credentials'));
      } else if (error.response?.status === 404) {
        next(new ApiError(404, 'Location not found'));
      } else if (error.code === 'ECONNABORTED') {
        next(new ApiError(503, 'Mapbox service timeout'));
      } else {
        next(new ApiError(503, 'Mapbox service error'));
      }
    } else {
      logger.error('Unexpected error in Mapbox search', error);
      next(new ApiError(500, 'Internal server error'));
    }
  }
});

/**
 * GET /api/mapbox/reverse
 * Reverse geocoding - get location name from coordinates
 */
mapboxRouter.get('/reverse', async (req, res, next) => {
  try {
    const ReverseGeoSchema = z.object({
      longitude: z
        .string()
        .transform((v) => parseFloat(v))
        .refine((v) => v >= -180 && v <= 180, 'Invalid longitude'),
      latitude: z
        .string()
        .transform((v) => parseFloat(v))
        .refine((v) => v >= -90 && v <= 90, 'Invalid latitude'),
      limit: z
        .string()
        .transform((v) => parseInt(v, 10))
        .refine((v) => v >= 1 && v <= 5, 'Limit must be 1-5')
        .default('1'),
    });

    const parsed = ReverseGeoSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid query parameters');
    }

    const { longitude, latitude, limit } = parsed.data;

    const apiKey = process.env.MAPBOX_TOKEN;
    if (!apiKey) {
      throw new ApiError(500, 'Mapbox service unavailable');
    }

    const url = 
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${longitude},${latitude}.json?` +
      `access_token=${apiKey}` +
      `&limit=${limit}`;

    logger.info('Calling Mapbox reverse geocoding', {
      longitude,
      latitude,
      limit,
    });

    const response = await axios.get<MapboxResponse>(url, {
      timeout: 30000,
    });

    const features = response.data.features.map((feature) => ({
      id: feature.id,
      name: feature.place_name,
      coordinates: {
        latitude: feature.center[1],
        longitude: feature.center[0],
      },
      place_types: feature.place_type,
    }));

    res.json({
      success: true,
      coordinates: { latitude, longitude },
      total: features.length,
      results: features,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (axios.isAxiosError(error)) {
      next(new ApiError(503, 'Mapbox service error'));
    } else {
      next(new ApiError(500, 'Internal server error'));
    }
  }
});
