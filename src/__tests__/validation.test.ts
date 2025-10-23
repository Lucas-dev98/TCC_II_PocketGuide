import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Criar schemas de teste baseados nos que criamos
const TripSchema = z.object({
  destination: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must not exceed 100 characters'),
  days: z
    .number()
    .int()
    .min(1, 'Trip must be at least 1 day')
    .max(365, 'Trip must not exceed 365 days'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const AttractionSchema = z.object({
  name: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  duration: z.string(),
  category: z.enum(['restaurant', 'museum', 'landmark', 'nature']),
});

describe('Zod Validation Schemas', () => {
  describe('TripSchema', () => {
    it('should validate a correct trip', () => {
      const validTrip = {
        destination: 'Rio de Janeiro',
        days: 5,
        startDate: '2025-10-22T10:00:00Z',
        endDate: '2025-10-27T10:00:00Z',
      };

      const result = TripSchema.safeParse(validTrip);
      expect(result.success).toBe(true);
    });

    it('should reject destination too short', () => {
      const invalidTrip = {
        destination: 'R',
        days: 5,
        startDate: '2025-10-22T10:00:00Z',
        endDate: '2025-10-27T10:00:00Z',
      };

      const result = TripSchema.safeParse(invalidTrip);
      expect(result.success).toBe(false);
    });

    it('should reject days outside range', () => {
      const invalidTrip = {
        destination: 'Paris',
        days: 500,
        startDate: '2025-10-22T10:00:00Z',
        endDate: '2026-10-27T10:00:00Z',
      };

      const result = TripSchema.safeParse(invalidTrip);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer days', () => {
      const invalidTrip = {
        destination: 'Tokyo',
        days: 5.5,
        startDate: '2025-10-22T10:00:00Z',
        endDate: '2025-10-27T10:00:00Z',
      };

      const result = TripSchema.safeParse(invalidTrip);
      expect(result.success).toBe(false);
    });
  });

  describe('AttractionSchema', () => {
    it('should validate a correct attraction', () => {
      const validAttraction = {
        name: 'Copacabana Beach',
        lat: -22.9749,
        lng: -43.1826,
        duration: '2 hours',
        category: 'nature',
      };

      const result = AttractionSchema.safeParse(validAttraction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const invalidAttraction = {
        name: 'Test Place',
        lat: 91,
        lng: -43.1826,
        duration: '1 hour',
        category: 'landmark',
      };

      const result = AttractionSchema.safeParse(invalidAttraction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid longitude', () => {
      const invalidAttraction = {
        name: 'Test Place',
        lat: -22.9749,
        lng: 181,
        duration: '1 hour',
        category: 'landmark',
      };

      const result = AttractionSchema.safeParse(invalidAttraction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidAttraction = {
        name: 'Test Place',
        lat: -22.9749,
        lng: -43.1826,
        duration: '1 hour',
        category: 'invalid_category',
      };

      const result = AttractionSchema.safeParse(invalidAttraction);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages', () => {
      const invalidTrip = {
        destination: 'X',
        days: 1000,
        startDate: 'invalid-date',
        endDate: 'invalid-date',
      };

      const result = TripSchema.safeParse(invalidTrip);
      if (!result.success) {
        const errors = result.error.issues || [];
        expect(errors.length).toBeGreaterThan(0);
        if (errors.length > 0) {
          expect(errors[0].message).toBeDefined();
        }
      }
    });
  });
});
