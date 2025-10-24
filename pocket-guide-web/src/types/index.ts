// ============================================
// 🔐 AUTH & USER TYPES
// ============================================

/**
 * Authenticated User Profile
 * Stored in Firestore and used throughout the app
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  tags: string[]; // ["gastronomia", "médio", "casal"]
  createdAt: Date;
  lastSignIn: Date;
}

/**
 * Firebase Auth State (for internal use only)
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
}

/**
 * Structured auth errors
 */
export interface AuthError {
  code: string;
  message: string;
  timestamp: Date;
}

// ============================================
// ✈️ TRIP & ITINERARY TYPES
// ============================================

/**
 * Travel Destination with coordinates
 */
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  name?: string;
}

/**
 * Single Attraction/Activity
 */
export interface Attraction {
  id: string;
  day: number; // 1, 2, 3...
  time: string; // "09:00"
  name: string;
  duration: number; // em minutos
  reason: string;
  tip?: string;
  location: Location;
  order?: number; // para controlar ordem de drag & drop
  notes?: string;
}

/**
 * Complete Travel Trip
 */
export interface Trip {
  id: string;
  userId: string;
  destination: string;
  country?: string;
  startDate: Date | string;
  endDate: Date | string;
  attractions?: Attraction[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isSyncedToFirestore?: boolean;
  tags?: string[];
  notes?: string;
  interests?: string[];
  budget?: "econômico" | "médio" | "luxo";
  description?: string;
  imageUrl?: string;
  itinerary?: any;
}

/**
 * Trip creation parameters
 */
export interface CreateTripParams {
  destination: string;
  startDate: Date;
  endDate: Date;
  tags: string[];
  travelStyle: TravelStyle;
  budget: Budget;
}

// ============================================
// 📋 ONBOARDING & PREFERENCES
// ============================================

/**
 * Travel Style Options
 */
export type TravelStyle = "aventura" | "relax" | "cultura" | "gastronomia";

/**
 * Budget Level Options
 */
export type Budget = "econômico" | "médio" | "luxo";

/**
 * Travel Companion Type
 */
export type TravelCompanion = "sozinho" | "casal" | "família" | "amigos";

/**
 * User Preferences from Onboarding Quiz
 */
export interface QuizAnswers {
  travelStyle: TravelStyle;
  budget: Budget;
  travelWith: TravelCompanion;
}

// ============================================
// 🗺️ API RESPONSE TYPES
// ============================================

/**
 * Gemini AI Generated Itinerary Item
 */
export interface GeminiItinerary {
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip: string;
  location: Location;
}

/**
 * Google Places AutoComplete Prediction
 */
export interface PlacePrediction {
  main_text: string;
  secondary_text: string;
  place_id: string;
}

/**
 * Google Maps Direction Response
 */
export interface DirectionRoute {
  distance: string;
  duration: string;
  polyline: string;
}

/**
 * GraphHopper Route Response
 */
export interface RouteResponse {
  routes: Array<{
    distance: number;
    time: number;
    points: string;
  }>;
}

// ============================================
// 🔧 UTILITY TYPES
// ============================================

/**
 * API Error Response
 */
export interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Async Operation State
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Cache Entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
