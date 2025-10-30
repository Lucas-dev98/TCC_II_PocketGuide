import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error
  if (error instanceof ApiError) {
    logger.warn(`API Error [${error.statusCode}]: ${error.message}`)
  } else {
    logger.error('Unexpected error:', error)
  }

  // Send response
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
      ...(error.details && { details: error.details }),
    })
  }

  // Generic error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
  })
}
