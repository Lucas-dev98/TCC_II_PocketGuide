import { Router, Response } from 'express'

export const healthRouter = Router()

/**
 * GET /health
 * Health check endpoint (no auth required)
 */
healthRouter.get('/', (_req, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})
