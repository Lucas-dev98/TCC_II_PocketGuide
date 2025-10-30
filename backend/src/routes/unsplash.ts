import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const unsplashRouter = Router();

/**
 * Unsplash Search Request Schema
 * Validates input for photo search requests
 */
const UnsplashSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .max(100, 'Query must be less than 100 characters'),
  page: z
    .number()
    .min(1, 'Page must be at least 1')
    .default(1),
  per_page: z
    .number()
    .min(1, 'Per page must be at least 1')
    .max(50, 'Per page must not exceed 50')
    .default(12),
  order_by: z
    .enum(['relevant', 'latest'])
    .default('relevant'),
  color: z
    .enum(['black_and_white', 'black', 'white', 'yellow', 'orange', 'red', 'purple', 'magenta', 'green', 'teal', 'blue'])
    .optional(),
  orientation: z
    .enum(['landscape', 'portrait', 'squarish'])
    .optional(),
});

type UnsplashSearchRequest = z.infer<typeof UnsplashSearchSchema>;

interface UnsplashUser {
  id: string;
  username: string;
  name: string;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
    following: string;
    followers: string;
  };
}

interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string;
  alt_description: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  likes: number;
  liked_by_user: boolean;
  current_user_collections: any[];
  sponsorship: null;
  user: UnsplashUser;
  topic_submissions: Record<string, any>;
}

interface UnsplashResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * POST /api/unsplash/search
 * Search for photos using Unsplash API
 * 
 * Request body:
 * {
 *   query: string (required, 1-100 chars)
 *   page?: number (default 1)
 *   per_page?: number (1-50, default 12)
 *   order_by?: 'relevant' | 'latest' (default 'relevant')
 *   color?: color option (optional)
 *   orientation?: 'landscape' | 'portrait' | 'squarish' (optional)
 * }
 * 
 * Response:
 * {
 *   total: number
 *   total_pages: number
 *   results: [
 *     {
 *       id: string
 *       urls: { thumb, small, regular, full }
 *       description: string
 *       alt_description: string
 *       user: { name, username, profile_image }
 *       likes: number
 *     }
 *   ]
 * }
 */
unsplashRouter.post('/search', async (req, res, next) => {
  try {
    // Validate request body with Zod
    const parsed = UnsplashSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Unsplash search validation failed', parsed.error.issues);
      throw new ApiError(
        400,
        'Invalid request parameters',
        parsed.error.issues
      );
    }

    const { query, page, per_page, order_by, color, orientation } = parsed.data;

    // Check API key
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      logger.error('UNSPLASH_ACCESS_KEY not configured');
      throw new ApiError(500, 'Photo service unavailable');
    }

    // Build query parameters
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: per_page.toString(),
      order_by,
    });

    if (color) {
      params.append('color', color);
    }
    if (orientation) {
      params.append('orientation', orientation);
    }

    logger.info('Calling Unsplash API', {
      query,
      page,
      per_page,
      order_by,
    });

    // Call Unsplash API with timeout
    const response = await axios.get<UnsplashResponse>(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        timeout: 30000, // 30 seconds
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    logger.info('Unsplash API response received', {
      photoCount: response.data.results.length,
      total: response.data.total,
      query,
    });

    // Extract and transform photo data
    const photos = response.data.results.map((photo) => ({
      id: photo.id,
      description: photo.description,
      alt_description: photo.alt_description,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
      },
      user: {
        id: photo.user.id,
        username: photo.user.username,
        name: photo.user.name,
        profile_image: photo.user.profile_image.small,
        link: photo.user.links.html,
      },
      likes: photo.likes,
      created_at: photo.created_at,
      width: photo.width,
      height: photo.height,
      color: photo.color,
      blur_hash: photo.blur_hash,
    }));

    res.json({
      success: true,
      query,
      total: response.data.total,
      total_pages: response.data.total_pages,
      current_page: page,
      per_page,
      results: photos,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (axios.isAxiosError(error)) {
      logger.error('Unsplash API error', {
        status: error.response?.status,
        message: error.message,
      });

      if (error.response?.status === 401) {
        next(new ApiError(401, 'Invalid Unsplash credentials'));
      } else if (error.response?.status === 403) {
        next(new ApiError(429, 'Unsplash rate limit exceeded'));
      } else if (error.code === 'ECONNABORTED') {
        next(new ApiError(503, 'Photo service timeout'));
      } else {
        next(new ApiError(503, 'Photo service error'));
      }
    } else {
      logger.error('Unexpected error in Unsplash search', error);
      next(new ApiError(500, 'Internal server error'));
    }
  }
});

/**
 * GET /api/unsplash/random
 * Get random photo(s) from Unsplash
 */
unsplashRouter.get('/random', async (req, res, next) => {
  try {
    const RandomSchema = z.object({
      count: z
        .string()
        .transform((v) => parseInt(v, 10))
        .refine((v) => v >= 1 && v <= 30, 'Count must be 1-30')
        .default('1'),
      collections: z
        .string()
        .optional(),
      featured: z
        .string()
        .transform((v) => v === 'true')
        .default('false'),
    });

    const parsed = RandomSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid query parameters');
    }

    const { count, collections, featured } = parsed.data;

    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'Photo service unavailable');
    }

    const params = new URLSearchParams({
      count: count.toString(),
    });

    if (collections) {
      params.append('collections', collections);
    }
    if (featured) {
      params.append('featured', 'true');
    }

    logger.info('Calling Unsplash random API', {
      count,
      featured,
    });

    const response = await axios.get<UnsplashPhoto[]>(
      `https://api.unsplash.com/photos/random?${params.toString()}`,
      {
        timeout: 30000,
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    // Handle both single photo (object) and multiple (array)
    const photoList = Array.isArray(response.data) ? response.data : [response.data];

    const photos = photoList.map((photo) => ({
      id: photo.id,
      description: photo.description,
      alt_description: photo.alt_description,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full,
      },
      user: {
        username: photo.user.username,
        name: photo.user.name,
        profile_image: photo.user.profile_image.small,
      },
      likes: photo.likes,
      color: photo.color,
    }));

    res.json({
      success: true,
      total: photos.length,
      results: photos,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (axios.isAxiosError(error)) {
      next(new ApiError(503, 'Photo service error'));
    } else {
      next(new ApiError(500, 'Internal server error'));
    }
  }
});
