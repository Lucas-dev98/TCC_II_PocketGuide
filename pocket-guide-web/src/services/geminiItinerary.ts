/**
 * Gemini AI Service - Intelligent Itinerary Generation
 * 
 * Features:
 * - Generate personalized travel itineraries using Google Gemini API in multiple languages
 * - Get travel tips for destinations
 * - Describe destinations with AI-generated content
 * - Robust error handling with fallback itineraries
 * - Type-safe API responses
 * - Multi-language support (PT-BR, EN-US, ES-ES)
 */

import { Location } from "../types";
import { generateItineraryPrompt, getSystemInstruction, LanguageCode } from "./promptTranslator";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Structured itinerary item from Gemini
 */
export interface ItineraryItem {
  day: number;
  time: string;
  name: string;
  duration: number; // in minutes
  reason: string;
  tip: string;
  location?: Location;
  category: string;
}

/**
 * Complete generated itinerary response
 */
export interface GeneratedItinerary {
  destination: string;
  days: number;
  itinerary: ItineraryItem[];
  tips: string[];
}

/**
 * Parsed Gemini activity data
 */
interface GeminiActivity {
  day?: number;
  time?: string;
  name?: string;
  duration?: number;
  reason?: string;
  tip?: string;
  category?: string;
  lat?: number;
  latitude?: number;
  lng?: number;
  longitude?: number;
}

/**
 * Extract coordinates from API response
 * Handles multiple coordinate naming conventions
 */
const extractCoordinates = (item: GeminiActivity, destination: string): Location => {
  let lat = item.lat !== undefined ? item.lat : item.latitude;
  let lng = item.lng !== undefined ? item.lng : item.longitude;
  
  // If no coordinates provided, use defaults
  if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
    const defaultCoords = getDefaultCoordinates(destination);
    lat = defaultCoords.lat;
    lng = defaultCoords.lng;
  }
  
  return {
    lat: Number(lat) || 0,
    lng: Number(lng) || 0,
  };
};

/**
 * Get default coordinates for common destinations
 */
const getDefaultCoordinates = (destination: string): { lat: number; lng: number } => {
  const defaultCoords: Record<string, { lat: number; lng: number }> = {
    'paris': { lat: 48.8566, lng: 2.3522 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'bangkok': { lat: 13.7563, lng: 100.5018 },
  };
  
  const destLower = destination.toLowerCase();
  return defaultCoords[destLower] || { lat: 0, lng: 0 };
};

/**
 * Parse Gemini API text response into JSON
 */
const parseGeminiResponse = (textContent: string): any => {
  try {
    // First try direct JSON parse
    return JSON.parse(textContent);
  } catch (parseError) {
    console.warn('⚠️ Direct JSON parse failed, trying extraction...');
    try {
      // Clean the text - remove control characters
      let cleanedText = textContent
        .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
      
      // Try to extract from markdown code blocks first
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
      }
      
      // Try to find JSON object or array
      let jsonStart = cleanedText.indexOf('{');
      let jsonEnd = cleanedText.lastIndexOf('}');
      
      if (jsonStart === -1) {
        jsonStart = cleanedText.indexOf('[');
        jsonEnd = cleanedText.lastIndexOf(']');
      }
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
        let jsonString = cleanedText.substring(jsonStart, jsonEnd + 1);
        
        try {
          return JSON.parse(jsonString);
        } catch (truncateError) {
          // If JSON is truncated, try to auto-fix it
          console.warn('⚠️ JSON appears truncated, attempting auto-fix...');
          
          // Count braces to see if we're missing closing ones
          const openBraces = (jsonString.match(/{/g) || []).length;
          const closeBraces = (jsonString.match(/}/g) || []).length;
          const openBrackets = (jsonString.match(/\[/g) || []).length;
          const closeBrackets = (jsonString.match(/\]/g) || []).length;
          
          // Add missing closing braces/brackets
          let fixedJson = jsonString;
          const missingBraces = openBraces - closeBraces;
          const missingBrackets = openBrackets - closeBrackets;
          
          if (missingBraces > 0 || missingBrackets > 0) {
            fixedJson = jsonString + ']'.repeat(missingBrackets) + '}'.repeat(missingBraces);
            console.warn(`⚠️ Added ${missingBraces} closing braces and ${missingBrackets} closing brackets`);
            
            try {
              return JSON.parse(fixedJson);
            } catch (stillError) {
              console.error('❌ Auto-fix failed, original error:', truncateError);
              throw truncateError;
            }
          }
          
          throw truncateError;
        }
      }
      
      throw new Error('No valid JSON found in response');
    } catch (extractError) {
      console.error('❌ Failed to extract JSON:', extractError);
      console.error('Raw content:', textContent.substring(0, 500));
      throw extractError;
    }
  }
};
export const generateItineraryWithGemini = async (
  destination: string,
  days: number,
  tags: string[],
  budget: string = 'mid',
  groupType: string = 'couple',
  language: LanguageCode = 'en-US',
  season?: 'primavera' | 'verão' | 'outono' | 'inverno'
): Promise<GeneratedItinerary | null> => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return null;
  }

  try {
    // Generate prompt in the specified language
    const prompt = generateItineraryPrompt(days, destination, budget, groupType, tags, language, season);
    const systemInstruction = getSystemInstruction(language);

    // DEBUG: Log all parameters
    console.log('════════════════════════════════════════════════════════');
    console.log('🎫 ITINERARY GENERATION PARAMETERS:');
    console.log('════════════════════════════════════════════════════════');
    console.log('📍 Destination:', destination);
    console.log('📅 Days:', days);
    console.log('⭐ Tags/Interests:', tags.join(', '));
    console.log('💰 Budget:', budget);
    console.log('👥 Group Type:', groupType);
    console.log('🌍 Season:', season || 'Not selected');
    console.log('🌐 Language:', language);
    console.log('════════════════════════════════════════════════════════');
    console.log('📝 FULL PROMPT TO GEMINI:');
    console.log('════════════════════════════════════════════════════════');
    console.log(prompt);
    console.log('════════════════════════════════════════════════════════');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: systemInstruction
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
          maxOutputTokens: 4096,
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

    // Parse JSON from response
    const jsonData = parseGeminiResponse(textContent);

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
      (item: GeminiActivity, index: number) => {
        const location = extractCoordinates(item, destination);
        
        return {
          day: item.day || Math.floor(index / 3) + 1,
          time: item.time || '09:00',
          name: item.name || 'Activity',
          duration: item.duration || 120,
          reason: item.reason || 'Explore this attraction',
          tip: item.tip || 'Check opening hours',
          category: item.category || 'General',
          location,
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
