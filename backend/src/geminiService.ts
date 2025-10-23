import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Gerar itinerário usando Gemini API
 * Executado no backend seguro
 */
export async function generateItineraryWithGemini(
  destination: string,
  days: number,
  tags: string[]
): Promise<any> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Create a ${days}-day itinerary for ${destination} focused on: ${tags.join(', ')}.

Format response as JSON with this structure:
{
  "title": "Itinerary title",
  "description": "Brief description",
  "days": [
    {
      "day": 1,
      "attractions": [
        {
          "name": "Place name",
          "description": "Description",
          "duration": "2 hours",
          "lat": latitude,
          "lng": longitude,
          "category": "restaurant|museum|landmark|nature"
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const itinerary = JSON.parse(jsonMatch[0]);
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw new Error('Failed to generate itinerary');
  }
}
