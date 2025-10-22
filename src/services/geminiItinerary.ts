/**
 * geminiItinerary.ts - Gemini AI integration for intelligent itinerary generation
 * Uses Google's Gemini API to generate personalized travel itineraries
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface ItineraryItem {
  day: number;
  time: string;
  name: string;
  duration: number; // in minutes
  reason: string;
  tip: string;
  location?: {
    lat: number;
    lng: number;
  };
  category: string;
}

export interface GeneratedItinerary {
  destination: string;
  days: number;
  itinerary: ItineraryItem[];
  tips: string[];
}

/**
 * Generate an intelligent itinerary using Gemini AI
 * @param destination - Destination city
 * @param days - Number of days
 * @param tags - User preferences (e.g., ['gastronomy', 'culture', 'nightlife'])
 * @param budget - Budget level ('budget', 'mid', 'luxury')
 * @param groupType - Type of group ('solo', 'couple', 'family', 'friends')
 */
export const generateItineraryWithGemini = async (
  destination: string,
  days: number,
  tags: string[],
  budget: string = 'mid',
  groupType: string = 'couple'
): Promise<GeneratedItinerary | null> => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return null;
  }

  try {
    const prompt = `For ${destination} (${days} days), budget=${budget}, group=${groupType}, interests=${tags.join(',')}. Return JSON array of activities only. No thinking, no text.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "Return only valid JSON. No markdown. No explanation. No thinking."
          }]
        },
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    console.log('📦 Gemini API Response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid Gemini API response structure:', data);
      return null;
    }

    const content = data.candidates[0].content;
    
    // Check if there are parts in the content
    if (!content.parts || content.parts.length === 0) {
      console.error('❌ No content parts in response. Finish reason:', data.candidates[0].finishReason);
      if (data.candidates[0].finishReason === 'MAX_TOKENS') {
        console.error('⚠️ Response was cut off due to MAX_TOKENS limit');
      }
      return null;
    }

    if (!content.parts[0] || !content.parts[0].text) {
      console.error('❌ No text content in Gemini response');
      return null;
    }

    const textContent = content.parts[0].text;
    console.log('📄 Text content:', textContent);

    // Try to extract JSON from the response
    let jsonData;
    try {
      // First try to parse directly
      jsonData = JSON.parse(textContent);
    } catch (parseError) {
      console.warn('⚠️ Direct JSON parse failed, trying extraction...', parseError);
      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON object in the text
          const objectMatch = textContent.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            jsonData = JSON.parse(objectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (extractError) {
        console.error('❌ Failed to extract JSON:', extractError);
        console.error('Full response text:', textContent);
        throw extractError;
      }
    }

    console.log('✅ Parsed JSON:', jsonData);

    // Handle both array and object formats
    let activities: any[] = [];
    
    if (Array.isArray(jsonData)) {
      activities = jsonData;
    } else if (jsonData.itinerary && Array.isArray(jsonData.itinerary)) {
      activities = jsonData.itinerary;
    } else {
      console.warn('⚠️ No itinerary array in response, using empty array');
      activities = [];
    }

    const itineraryItems: ItineraryItem[] = activities.map(
      (item: any, index: number) => ({
        day: item.day || Math.floor(index / 3) + 1,
        time: item.time || '09:00',
        name: item.name || 'Activity',
        duration: item.duration || 120,
        reason: item.reason || 'Explore this attraction',
        tip: item.tip || 'Check opening hours',
        category: item.category || 'General',
      })
    );

    return {
      destination,
      days,
      itinerary: itineraryItems,
      tips: jsonData.tips || ['Check local weather', 'Learn basic local phrases'],
    };
  } catch (error) {
    console.error('❌ Error generating itinerary with Gemini:', error);
    console.warn('⚠️ Using fallback itinerary instead...');
    
    // Fallback itinerary when Gemini fails
    const fallbackItinerary: GeneratedItinerary = {
      destination,
      days,
      itinerary: Array.from({ length: days * 3 }, (_, i) => ({
        day: Math.floor(i / 3) + 1,
        time: ['09:00', '13:00', '18:00'][i % 3],
        name: `Activity ${i + 1}`,
        duration: 120,
        reason: `Explore ${destination}`,
        tip: 'Check opening hours and book in advance',
        category: 'General',
      })),
      tips: [
        `Start exploring ${destination} early in the morning`,
        'Try local restaurants and cuisine',
        'Take public transportation to save money',
        'Visit popular attractions during off-peak hours',
      ],
    };
    
    console.log('📋 Using fallback itinerary:', fallbackItinerary);
    return fallbackItinerary;
  }
};

/**
 * Get travel tips from Gemini for a destination
 */
export const getTravelTipsFromGemini = async (destination: string): Promise<string[]> => {
  if (!GEMINI_API_KEY) {
    return [];
  }

  try {
    const prompt = `Give 5 short, practical travel tips for visiting ${destination}. Return ONLY a JSON array of strings like: ["tip1", "tip2", "tip3", "tip4", "tip5"]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let tips: string[] = [];
    try {
      tips = JSON.parse(textContent);
    } catch {
      const match = textContent.match(/\[([\s\S]*?)\]/);
      if (match) {
        tips = JSON.parse(`[${match[1]}]`);
      }
    }

    return Array.isArray(tips) ? tips : [];
  } catch (error) {
    console.error('Error getting travel tips:', error);
    return [];
  }
};

/**
 * Describe a destination using Gemini
 */
export const describeDestination = async (destination: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    return '';
  }

  try {
    const prompt = `Write a 2-sentence engaging description of ${destination} as a travel destination. Be concise and inspiring.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Error describing destination:', error);
    return '';
  }
};
