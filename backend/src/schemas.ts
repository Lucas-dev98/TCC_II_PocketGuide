import { z } from 'zod';

/**
 * Schemas para validação de requests no backend
 */

// Schema para gerar itinerário
export const GenerateItineraryRequestSchema = z.object({
  destination: z
    .string()
    .min(2, 'Destination must be at least 2 characters')
    .max(100, 'Destination must not exceed 100 characters'),
  days: z
    .number()
    .int()
    .min(1, 'Trip must be at least 1 day')
    .max(365, 'Trip must not exceed 365 days'),
  tags: z
    .array(z.string())
    .min(1, 'Must select at least one tag')
    .max(5, 'Must select at most 5 tags'),
});

export type GenerateItineraryRequest = z.infer<typeof GenerateItineraryRequestSchema>;

// Schema para obter rota
export const GetRouteRequestSchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  endLat: z.number().min(-90).max(90),
  endLng: z.number().min(-180).max(180),
  vehicle: z.enum(['car', 'bike', 'foot']).default('car'),
});

export type GetRouteRequest = z.infer<typeof GetRouteRequestSchema>;

// Schema para validação de erro
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  timestamp: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
