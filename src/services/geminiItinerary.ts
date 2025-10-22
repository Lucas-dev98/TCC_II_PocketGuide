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
    const prompt = `Generate a ${days}-day itinerary for ${destination} with budget="${budget}" and group="${groupType}". Interests: ${tags.join(',')}. 

IMPORTANT: Return ONLY a valid JSON object in this exact format with NO markdown code blocks, NO explanations, NO extra text:
{
  "itinerary": [
    {
      "day": 1,
      "time": "09:00",
      "name": "Attraction name",
      "duration": 120,
      "reason": "Why visit",
      "tip": "Local tip",
      "category": "category",
      "lat": latitude_number,
      "lng": longitude_number
    }
  ],
  "tips": ["tip1", "tip2"]
}

Generate approximately ${days * 3} activities spread across ${days} days (3 per day). Each activity MUST include real coordinates (lat, lng) for places in ${destination}.`;

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
      (item: any, index: number) => {
        // Extract coordinates - they can be named lat/lng or latitude/longitude
        let lat = item.lat !== undefined ? item.lat : item.latitude;
        let lng = item.lng !== undefined ? item.lng : item.longitude;
        
        // If still no coordinates, generate random ones for the destination
        if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
          console.warn(`⚠️ No coordinates for ${item.name}, using defaults`);
          // Default coordinates for common destinations
          const defaultCoords: { [key: string]: [number, number] } = {
            'paris': [48.8566, 2.3522],
            'london': [51.5074, -0.1278],
            'new york': [40.7128, -74.0060],
            'tokyo': [35.6762, 139.6503],
            'rio de janeiro': [-22.9068, -43.1729],
            'barcelona': [41.3851, 2.1734],
            'rome': [41.9028, 12.4964],
            'dubai': [25.2048, 55.2708],
            'singapore': [1.3521, 103.8198],
            'bangkok': [13.7563, 100.5018],
          };
          
          const destLower = destination.toLowerCase();
          let coords = defaultCoords[destLower] || [0, 0];
          
          // Add slight random offset for nearby attractions
          lat = coords[0] + (Math.random() - 0.5) * 0.05;
          lng = coords[1] + (Math.random() - 0.5) * 0.05;
        }
        
        return {
          day: item.day || Math.floor(index / 3) + 1,
          time: item.time || '09:00',
          name: item.name || 'Activity',
          duration: item.duration || 120,
          reason: item.reason || 'Explore this attraction',
          tip: item.tip || 'Check opening hours',
          category: item.category || 'General',
          location: {
            lat: Number(lat) || 0,
            lng: Number(lng) || 0,
          },
        };
      }
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
    
    // Default coordinates for common destinations
    const defaultCoords: { [key: string]: [number, number] } = {
      'paris': [48.8566, 2.3522],
      'london': [51.5074, -0.1278],
      'new york': [40.7128, -74.0060],
      'tokyo': [35.6762, 139.6503],
      'rio de janeiro': [-22.9068, -43.1729],
      'barcelona': [41.3851, 2.1734],
      'rome': [41.9028, 12.4964],
      'dubai': [25.2048, 55.2708],
      'singapore': [1.3521, 103.8198],
      'bangkok': [13.7563, 100.5018],
    };
    
    const destLower = destination.toLowerCase();
    const baseCoords = defaultCoords[destLower] || [0, 0];
    
    // Fallback itinerary when Gemini fails
    const fallbackItinerary: GeneratedItinerary = {
      destination,
      days,
      itinerary: Array.from({ length: days * 3 }, (_, i) => {
        // Add slight random offset for nearby attractions
        const lat = baseCoords[0] + (Math.random() - 0.5) * 0.05;
        const lng = baseCoords[1] + (Math.random() - 0.5) * 0.05;
        
        return {
          day: Math.floor(i / 3) + 1,
          time: ['09:00', '13:00', '18:00'][i % 3],
          name: `Activity ${i + 1}`,
          duration: 120,
          reason: `Explore ${destination}`,
          tip: 'Check opening hours and book in advance',
          category: 'General',
          location: {
            lat,
            lng,
          },
        };
      }),
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
