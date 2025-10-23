import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GenerateItineraryRequestSchema, GetRouteRequestSchema } from './schemas';
import { generateItineraryWithGemini } from './geminiService';
import { getRouteWithGraphHopper } from './graphhopperService';

const router = express.Router();

// Middleware para logging
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * POST /api/generate-itinerary
 * Gera um itinerário usando Gemini AI
 */
router.post('/generate-itinerary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar request com Zod
    const data = GenerateItineraryRequestSchema.parse(req.body);

    console.log(`Generating itinerary for: ${data.destination}, ${data.days} days, tags: ${data.tags.join(', ')}`);

    // Chamar Gemini (chave segura no backend)
    const itinerary = await generateItineraryWithGemini(data.destination, data.days, data.tags);

    // Retornar resultado
    res.json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    next(error);
  }
});

/**
 * POST /api/get-route
 * Obter rota entre dois pontos usando GraphHopper
 */
router.post('/get-route', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar request
    const data = GetRouteRequestSchema.parse(req.body);

    console.log(`Getting route from (${data.startLat}, ${data.startLng}) to (${data.endLat}, ${data.endLng})`);

    // Chamar GraphHopper (chave segura no backend)
    const route = await getRouteWithGraphHopper(
      data.startLat,
      data.startLng,
      data.endLat,
      data.endLng,
      data.vehicle
    );

    // Retornar resultado
    res.json({
      success: true,
      data: route,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    next(error);
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
