/**
 * Backend Unsplash Proxy Service
 * 
 * Calls our backend API proxy instead of calling Unsplash directly.
 * This keeps API keys secure on the backend.
 * 
 * Features:
 * - Secure backend proxy (API key never exposed)
 * - Firebase token authentication
 * - Rate limiting per user
 * - Photo search with filters
 * - Random photo generation
 */

import { auth } from "./firebase";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Photo result from Unsplash
 */
export interface UnsplashPhoto {
  id: string;
  description: string;
  alt_description: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    profile_image: string;
    link: string;
  };
  likes: number;
  created_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
}

/**
 * Photo search response
 */
export interface PhotoSearchResponse {
  success: boolean;
  query: string;
  total: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  results: UnsplashPhoto[];
}

/**
 * Search for photos by keyword
 * 
 * Example: searchPhotos("mountains", { page: 1, per_page: 12 })
 */
export const searchPhotos = async (
  query: string,
  options?: {
    page?: number;
    per_page?: number;
    order_by?: 'relevant' | 'latest';
    color?: string;
    orientation?: 'landscape' | 'portrait' | 'squarish';
  }
): Promise<UnsplashPhoto[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Not authenticated');
      return [];
    }

    const token = await currentUser.getIdToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return [];
    }

    console.log('🖼️ Searching photos via backend:', query);

    const response = await fetch(`${BACKEND_API_URL}/api/unsplash/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        page: options?.page || 1,
        per_page: options?.per_page || 12,
        order_by: options?.order_by || 'relevant',
        color: options?.color,
        orientation: options?.orientation,
      }),
    });

    if (response.status === 401) {
      console.error('❌ Unauthorized');
      return [];
    }

    if (response.status === 429) {
      console.error('⚠️ Rate limited');
      throw new Error('Rate limit exceeded');
    }

    if (!response.ok) {
      console.error('❌ Backend error:', response.status);
      return [];
    }

    const data: PhotoSearchResponse = await response.json();
    console.log('✅ Photos found:', data.results.length);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error searching photos:', error);
    return [];
  }
};

/**
 * Get random photos
 * 
 * Example: getRandomPhotos(6)  // Get 6 random photos
 */
export const getRandomPhotos = async (count: number = 1): Promise<UnsplashPhoto[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Not authenticated');
      return [];
    }

    const token = await currentUser.getIdToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return [];
    }

    console.log('🖼️ Getting random photos via backend:', { count });

    // Constrain count to reasonable number
    const safeCount = Math.min(Math.max(count, 1), 30);

    const response = await fetch(
      `${BACKEND_API_URL}/api/unsplash/random?count=${safeCount}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Random photo fetch failed:', response.status);
      return [];
    }

    const data = await response.json();
    const photos = data.results || [];
    console.log('✅ Random photos received:', photos.length);
    return photos;
  } catch (error) {
    console.error('❌ Error getting random photos:', error);
    return [];
  }
};

/**
 * Search for destination photos
 * 
 * Convenience function for trip planning
 * Returns photos relevant to a travel destination
 */
export const getDestinationPhotos = async (
  destination: string,
  count: number = 6
): Promise<UnsplashPhoto[]> => {
  try {
    // Search for high-quality landscape photos of the destination
    return await searchPhotos(destination, {
      per_page: count,
      order_by: 'relevant',
      orientation: 'landscape',
    });
  } catch (error) {
    console.error('❌ Error getting destination photos:', error);
    return [];
  }
};
