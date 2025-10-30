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

/**
 * ============================================================================
 * AUTHENTICATION SCHEMAS
 * ============================================================================
 */

/**
 * Login/Sign-In schema
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export type Login = z.infer<typeof LoginSchema>;

/**
 * Sign-Up/Register schema
 */
export const SignUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignUp = z.infer<typeof SignUpSchema>;

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

/**
 * Password reset confirmation schema
 */
export const PasswordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PasswordReset = z.infer<typeof PasswordResetSchema>;

/**
 * ============================================================================
 * USER PROFILE SCHEMAS
 * ============================================================================
 */

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  language: z.enum(['pt', 'en', 'es']).default('en'),
  theme: z.enum(['light', 'dark']).default('light'),
  currency: z.string().length(3).default('USD'), // ISO 4217
  preferences: UserPreferencesSchema.optional(),
  createdAt: z.union([z.date(), z.string().datetime()]),
  updatedAt: z.union([z.date(), z.string().datetime()]),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Update user profile schema
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .optional(),
  language: z.enum(['pt', 'en', 'es']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  currency: z.string().length(3).optional(),
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

/**
 * Change password schema
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type ChangePassword = z.infer<typeof ChangePasswordSchema>;

/**
 * ============================================================================
 * SEARCH & FILTER SCHEMAS
 * ============================================================================
 */

/**
 * Trip search schema
 */
export const TripSearchSchema = z.object({
  query: z.string().max(100).optional(),
  destination: z.string().max(100).optional(),
  startDate: z.union([z.date(), z.string().datetime()]).optional(),
  endDate: z.union([z.date(), z.string().datetime()]).optional(),
  budget: z.enum(['low', 'mid', 'high']).optional(),
  groupType: z.enum(['solo', 'couple', 'family', 'friends']).optional(),
  sortBy: z.enum(['date', 'name', 'recent']).default('date'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type TripSearch = z.infer<typeof TripSearchSchema>;

/**
 * Photo search schema
 */
export const PhotoSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(30).default(12),
});

export type PhotoSearch = z.infer<typeof PhotoSearchSchema>;

/**
 * ============================================================================
 * VALIDATION HELPERS - AUTHENTICATION
 * ============================================================================
 */

export function validateLogin(data: unknown): Login {
  return LoginSchema.parse(data);
}

export function validateLoginSafe(
  data: unknown
): { success: boolean; data?: Login; error?: string } {
  try {
    const login = LoginSchema.parse(data);
    return { success: true, data: login };
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

export function validateSignUp(data: unknown): SignUp {
  return SignUpSchema.parse(data);
}

export function validateSignUpSafe(
  data: unknown
): { success: boolean; data?: SignUp; error?: string } {
  try {
    const signUp = SignUpSchema.parse(data);
    return { success: true, data: signUp };
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

export function validatePasswordReset(data: unknown): PasswordReset {
  return PasswordResetSchema.parse(data);
}

export function validatePasswordResetRequest(
  data: unknown
): PasswordResetRequest {
  return PasswordResetRequestSchema.parse(data);
}

/**
 * ============================================================================
 * VALIDATION HELPERS - PROFILE
 * ============================================================================
 */

export function validateUserProfile(data: unknown): UserProfile {
  return UserProfileSchema.parse(data);
}

export function validateUpdateProfile(data: unknown): UpdateProfile {
  return UpdateProfileSchema.parse(data);
}

export function validateUpdateProfileSafe(
  data: unknown
): { success: boolean; data?: UpdateProfile; error?: string } {
  try {
    const profile = UpdateProfileSchema.parse(data);
    return { success: true, data: profile };
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

export function validateChangePassword(data: unknown): ChangePassword {
  return ChangePasswordSchema.parse(data);
}

export function validateChangePasswordSafe(
  data: unknown
): { success: boolean; data?: ChangePassword; error?: string } {
  try {
    const changePassword = ChangePasswordSchema.parse(data);
    return { success: true, data: changePassword };
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

/**
 * ============================================================================
 * VALIDATION HELPERS - SEARCH
 * ============================================================================
 */

export function validateTripSearch(data: unknown): TripSearch {
  return TripSearchSchema.parse(data);
}

export function validatePhotoSearch(data: unknown): PhotoSearch {
  return PhotoSearchSchema.parse(data);
}

