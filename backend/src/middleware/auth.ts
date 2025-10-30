import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'
import { logger } from '../utils/logger.js'

export interface AuthRequest extends Request {
  user?: {
    uid: string
    email?: string
  }
}

/**
 * Middleware para verificar Firebase Auth token
 * Valida JWT token no header Authorization: Bearer <token>
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid Authorization header')
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token)

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }

    logger.debug(`Authenticated user: ${decodedToken.uid}`)
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    })
  }
}
