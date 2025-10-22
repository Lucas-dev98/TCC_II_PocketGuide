/**
 * Validation Schemas using Zod
 * Ensures type safety and runtime validation of data
 *
 * Schemas included:
 * - Trip: Main travel plan data
 * - Attraction: Individual attractions/activities
 * - ItineraryItem: Generated itinerary items
 * - UserPreferences: User preferences from quiz
 */

import { z } from 'zod';

/**
 * Location schema
 */
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export type Location = z.infer<typeof LocationSchema>;

/**
 * Attraction schema
 */
export const AttractionSchema = z.object({
  id: z.string(),
  day: z.number().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(1).max(100),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  reason: z.string().min(1).max(500),
  tip: z.string().max(200).optional(),
  location: LocationSchema.optional(),
  category: z.string().optional(),
});

export type Attraction = z.infer<typeof AttractionSchema>;

/**
 * Trip schema - Main data model
 */
export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  destination: z.string().min(1).max(100),
  startDate: z.union([z.date(), z.string().datetime()]),
  endDate: z.union([z.date(), z.string().datetime()]),
  attractions: z.array(AttractionSchema).default([]),
  budget: z.enum(['low', 'mid', 'high']).default('mid'),
  groupType: z.enum(['solo', 'couple', 'family', 'friends']).default('couple'),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  createdAt: z.union([z.date(), z.string().datetime()]),
  updatedAt: z.union([z.date(), z.string().datetime()]),
});

export type Trip = z.infer<typeof TripSchema>;

/**
 * User Preferences schema - from onboarding quiz
 */
export const UserPreferencesSchema = z.object({
  userId: z.string(),
  travelStyle: z.enum(['adventure', 'relaxation', 'culture', 'food']),
  budget: z.enum(['low', 'mid', 'high']),
  pace: z.enum(['slow', 'medium', 'fast']),
  groupType: z.enum(['solo', 'couple', 'family', 'friends']),
  interests: z.array(z.string()).min(1).max(10),
  createdAt: z.union([z.date(), z.string().datetime()]),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/**
 * Itinerary generation request
 */
export const GenerateItineraryRequestSchema = z.object({
  destination: z.string().min(1).max(100),
  days: z.number().min(1).max(365),
  tags: z.array(z.string()).min(1).max(10),
  budget: z.enum(['low', 'mid', 'high']).default('mid'),
  groupType: z.enum(['solo', 'couple', 'family', 'friends']).default('couple'),
});

export type GenerateItineraryRequest = z.infer<
  typeof GenerateItineraryRequestSchema
>;

/**
 * Route segment from GraphHopper
 */
export const RouteSegmentSchema = z.object({
  distance: z.number().min(0),
  duration: z.number().min(0), // seconds
  polyline: z.string().optional(),
});

export type RouteSegment = z.infer<typeof RouteSegmentSchema>;

/**
 * Validation helper - returns data if valid, throws error if not
 */
export function validateTrip(data: unknown): Trip {
  return TripSchema.parse(data);
}

/**
 * Validation helper with detailed error reporting
 */
export function validateTripSafe(
  data: unknown
): { success: boolean; data?: Trip; error?: string } {
  try {
    const trip = TripSchema.parse(data);
    return { success: true, data: trip };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return { success: false, error: message };
    }
    return { success: false, error: String(error) };
  }
}

export function validateAttraction(data: unknown): Attraction {
  return AttractionSchema.parse(data);
}

export function validateUserPreferences(data: unknown): UserPreferences {
  return UserPreferencesSchema.parse(data);
}

export function validateGenerateItineraryRequest(
  data: unknown
): GenerateItineraryRequest {
  return GenerateItineraryRequestSchema.parse(data);
}

/**
 * Batch validation for multiple items
 */
export function validateAttractions(data: unknown): Attraction[] {
  return z.array(AttractionSchema).parse(data);
}
