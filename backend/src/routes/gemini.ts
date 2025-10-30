import { Router, Response } from 'express'
import axios from 'axios'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth.js'
import { ApiError } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

export const geminiRouter = Router()

// Validation schema
const generateItinerarySchema = z.object({
  destination: z.string().min(2).max(100),
  days: z.number().min(1).max(365),
  interests: z.array(z.string()).min(1),
  language: z.enum(['pt', 'en', 'es']).default('en'),
})

/**
 * POST /api/gemini/generate-itinerary
 * 
 * Gera um itinerário usando a IA Gemini
 * 
 * Request body:
 * {
 *   destination: "Paris",
 *   days: 3,
 *   interests: ["art", "food", "history"],
 *   language: "en"
 * }
 */
geminiRouter.post('/generate-itinerary', async (req: AuthRequest, res: Response) => {
  try {
    // Validate request
    const validated = generateItinerarySchema.parse(req.body)

    // Call Gemini API (backend has the API key)
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new ApiError(500, 'Gemini API key not configured')
    }

    const prompt = buildItineraryPrompt(validated)

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        timeout: 30000, // 30 second timeout
      }
    )

    // Extract response
    const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!responseText) {
      throw new ApiError(500, 'No response from Gemini API')
    }

    // Parse JSON response
    let itinerary
    try {
      itinerary = JSON.parse(responseText)
    } catch {
      // If not valid JSON, try to extract JSON from markdown
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[1])
      } else {
        throw new ApiError(500, 'Invalid response format from Gemini')
      }
    }

    logger.info(`Generated itinerary for ${validated.destination} (${validated.days} days)`)
    res.json(itinerary)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, 'Validation error', error.errors)
    }
    if (error instanceof ApiError) {
      throw error
    }
    if (axios.isAxiosError(error)) {
      logger.error('Gemini API error:', error.response?.data)
      throw new ApiError(
        error.response?.status || 500,
        'Error communicating with Gemini API',
        error.response?.data
      )
    }
    throw error
  }
})

/**
 * Build prompt for Gemini
 */
function buildItineraryPrompt(params: z.infer<typeof generateItinerarySchema>): string {
  const { destination, days, interests, language } = params

  const languageMap = {
    pt: { name: 'Português (Brasil)', city: 'Cidade', day: 'Dia', time: 'Horário' },
    en: { name: 'English', city: 'City', day: 'Day', time: 'Time' },
    es: { name: 'Español', city: 'Ciudad', day: 'Día', time: 'Hora' },
  }

  const lang = languageMap[language] || languageMap['en']

  return `
Create a detailed travel itinerary for ${destination} for ${days} days.
Language: ${lang.name}

Interests: ${interests.join(', ')}

Format the response as a JSON object with this structure:
{
  "destination": "${destination}",
  "days": ${days},
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "09:00",
          "name": "Activity name",
          "duration": 120,
          "reason": "Why this activity",
          "tip": "Helpful tip",
          "category": "category"
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2"]
}

Make the itinerary culturally relevant, practical, and interesting.
Include diverse activities matching the interests.
`
}
