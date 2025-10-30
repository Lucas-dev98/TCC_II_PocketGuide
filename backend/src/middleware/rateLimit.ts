import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')

/**
 * Simple in-memory rate limiter
 * TODO: Replace with Redis for production (distributed systems)
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip rate limiting for health checks
  if (req.path === '/health') {
    return next()
  }

  const userId = (req as any).user?.uid || req.ip || 'anonymous'
  const now = Date.now()

  if (!store[userId]) {
    store[userId] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    }
    return next()
  }

  const userLimit = store[userId]

  // Check if window has expired
  if (now > userLimit.resetTime) {
    userLimit.count = 1
    userLimit.resetTime = now + WINDOW_MS
    return next()
  }

  // Check if limit exceeded
  if (userLimit.count >= MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for user: ${userId}`)
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Max ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000}s`,
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
    })
  }

  userLimit.count++
  next()
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [userId, data] of Object.entries(store)) {
    if (now > data.resetTime) {
      delete store[userId]
    }
  }
}

// Cleanup every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000)
