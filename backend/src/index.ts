import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pinoHttp from 'pino-http'
import { authMiddleware } from './middleware/auth.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { errorHandler } from './middleware/errorHandler.js'
import { geminiRouter } from './routes/gemini.js'
import { mapboxRouter } from './routes/mapbox.js'
import { unsplashRouter } from './routes/unsplash.js'
import { healthRouter } from './routes/health.js'
import { logger } from './utils/logger.js'

// Load environment variables
dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// ============================================
// Middleware Setup
// ============================================

// Logging
app.use(pinoHttp({ logger }))

// CORS
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}
app.use(cors(corsOptions))

// Body Parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Rate Limiting
app.use(rateLimitMiddleware)

// ============================================
// Routes
// ============================================

// Health check (no auth required)
app.use('/health', healthRouter)

// API Routes (all require Firebase auth)
app.use('/api/gemini', authMiddleware, geminiRouter)
app.use('/api/mapbox', authMiddleware, mapboxRouter)
app.use('/api/unsplash', authMiddleware, unsplashRouter)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint does not exist',
  })
})

// Error handler (must be last)
app.use(errorHandler)

// ============================================
// Server Startup
// ============================================

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT} (${NODE_ENV})`)
  logger.info(`📍 Health check: http://localhost:${PORT}/health`)
  logger.info(`🔒 CORS enabled for: ${corsOptions.origin}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

export default app
