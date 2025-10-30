/**
 * Backend Gemini Proxy Service
 * 
 * This service calls our backend API proxy instead of calling Gemini directly.
 * This keeps API keys secure on the backend and enables rate limiting.
 * 
 * Features:
 * - Secure backend proxy (API key never exposed)
 * - Firebase token authentication
 * - Rate limiting per user
 * - Type-safe request/response handling
 * - Robust error handling
 */

import { Location } from "../types";
import { LanguageCode } from "./promptTranslator";
import { auth } from "./firebase";

// Use environment variable or fallback to relative URL
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Structured itinerary item
 */
export interface ItineraryItem {
  day: number;
  time: string;
  name: string;
  duration: number; // in minutes
  reason: string;
  tip: string;
  location?: Location;
  category: string;
}

/**
 * Complete generated itinerary response
 */
export interface GeneratedItinerary {
  destination: string;
  days: number;
  itinerary: ItineraryItem[];
  tips: string[];
}

/**
 * Generate itinerary using backend proxy
 * 
 * Request sent to: POST /api/gemini/generate-itinerary
 * 
 * Backend validates and forwards to Gemini API with:
 * - Your API key (secure on backend)
 * - Rate limiting enforcement
 * - Firebase token authentication
 * - Response validation
 */
export const generateItineraryWithBackend = async (
  destination: string,
  days: number,
  tags: string[],
  budget: string = 'mid',
  groupType: string = 'couple',
  language: LanguageCode = 'en-US'
): Promise<GeneratedItinerary | null> => {
  try {
    // Get Firebase token for authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Not authenticated - cannot call backend');
      return null;
    }

    const token = await currentUser.getIdToken();
    if (!token) {
      console.error('❌ Could not get auth token');
      return null;
    }

    // Convert language format (en-US -> en)
    const langCode = language.split('-')[0] as 'pt' | 'en' | 'es';

    console.log('📤 Calling backend proxy for Gemini...', {
      destination,
      days,
      budget,
      groupType,
      language: langCode,
    });

    // Call backend proxy
    const response = await fetch(`${BACKEND_API_URL}/api/gemini/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        destination,
        days,
        interests: tags,
        budget,
        groupType,
        language: langCode,
      }),
    });

    // Handle authentication errors
    if (response.status === 401) {
      console.error('❌ Unauthorized - token may be expired');
      return null;
    }

    // Handle rate limiting
    if (response.status === 429) {
      console.error('⚠️ Rate limited - too many requests');
      throw new Error('Rate limit exceeded - please try again later');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend API error:', response.status, errorData);
      return null;
    }

    // Parse response
    const data = await response.json();
    console.log('📦 Backend response received');

    // Validate response structure
    if (!data.success || !data.itinerary) {
      console.error('❌ Invalid backend response structure:', data);
      return null;
    }

    // Transform backend response to expected format
    return {
      destination: data.destination || destination,
      days: data.days || days,
      itinerary: data.itinerary || [],
      tips: data.tips || [],
    };
  } catch (error) {
    console.error('❌ Error calling backend:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('⚠️ Backend server not responding - is it running?');
      console.error('📍 Trying to reach:', BACKEND_API_URL);
    }
    
    return null;
  }
};

/**
 * Check if backend proxy is available
 */
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Backend health check failed:', error);
    return false;
  }
};
