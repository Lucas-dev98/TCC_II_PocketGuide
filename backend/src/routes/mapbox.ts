import { Router } from 'express'

export const mapboxRouter = Router()

/**
 * POST /api/mapbox/search
 * Search for cities using Mapbox Geocoding API
 */
mapboxRouter.post('/search', async (req, res) => {
  res.json({ message: 'Mapbox router - TODO: Implement' })
})
