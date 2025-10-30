import { Router } from 'express'

export const unsplashRouter = Router()

/**
 * POST /api/unsplash/search
 * Search for photos using Unsplash API
 */
unsplashRouter.post('/search', async (req, res) => {
  res.json({ message: 'Unsplash router - TODO: Implement' })
})
