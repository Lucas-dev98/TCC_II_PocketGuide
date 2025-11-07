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
 * Validate itinerary for repetitions and fix if needed
 */
const validateAndFixItinerary = (itinerary: ItineraryItem[]): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  const categories_by_day: Record<number, string[]> = {};
  const names_by_day: Record<number, string[]> = {};
  const all_categories: string[] = [];
  const all_names: string[] = [];

  itinerary.forEach((item) => {
    const day = item.day;
    
    // Check for repeated categories in same day
    if (!categories_by_day[day]) {
      categories_by_day[day] = [];
    }
    if (categories_by_day[day].includes(item.category)) {
      issues.push(`Day ${day}: Repeated category "${item.category}"`);
    }
    categories_by_day[day].push(item.category);

    // Check for repeated names in same day
    if (!names_by_day[day]) {
      names_by_day[day] = [];
    }
    if (names_by_day[day].includes(item.name)) {
      issues.push(`Day ${day}: Repeated activity name "${item.name}"`);
    }
    names_by_day[day].push(item.name);

    // Check for repeated categories across days
    if (all_categories.includes(item.category)) {
      issues.push(`Repeated category "${item.category}" across different days`);
    }
    all_categories.push(item.category);

    // Check for repeated names across all days
    if (all_names.includes(item.name)) {
      issues.push(`Repeated activity "${item.name}" across different days`);
    }
    all_names.push(item.name);
  });

  const valid = issues.length === 0;
  if (!valid) {
    console.warn('⚠️ ITINERARY VALIDATION ISSUES:');
    issues.forEach((issue) => console.warn(`   - ${issue}`));
  } else {
    console.log('✅ ITINERARY VALIDATION PASSED - All activities are unique!');
  }

  return { valid, issues };
};

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
/**
 * Generate a diversified fallback itinerary when Gemini fails
 * This creates varied activities based on tags and destination
 */
const generateDiversifiedFallbackItinerary = (
  destination: string,
  days: number,
  tags: string[],
  budget: string
): ItineraryItem[] => {
  // Predefined activity templates with variations
  interface ActivityTemplate {
    name: string;
    duration: number;
    category: string;
    time: string;
  }

  const activityTemplates: Record<string, ActivityTemplate[]> = {
    cultural: [
      { name: 'Visit Historic Museum', duration: 120, category: 'Museum/Art', time: '09:00' },
      { name: 'Explore Ancient Landmarks', duration: 150, category: 'Monument/Historical', time: '10:00' },
      { name: 'Local Cultural Center Tour', duration: 90, category: 'Cultural Site', time: '14:00' },
      { name: 'Art Gallery Walk', duration: 100, category: 'Museum/Art', time: '15:00' },
      { name: 'Historical District Walking Tour', duration: 180, category: 'Monument/Historical', time: '09:30' },
      { name: 'Heritage Site Exploration', duration: 140, category: 'Cultural Site', time: '11:00' },
    ],
    nature: [
      { name: 'Mountain Hiking Adventure', duration: 240, category: 'Hiking/Trail', time: '07:00' },
      { name: 'Beach Day & Water Activities', duration: 300, category: 'Beach/Water', time: '08:00' },
      { name: 'National Park Exploration', duration: 200, category: 'Park/Nature', time: '09:00' },
      { name: 'Sunset Viewing at Natural Park', duration: 120, category: 'Park/Nature', time: '17:00' },
      { name: 'Tropical Garden Visit', duration: 100, category: 'Park/Nature', time: '10:00' },
      { name: 'Waterfall Trek', duration: 210, category: 'Hiking/Trail', time: '08:30' },
    ],
    foodie: [
      { name: 'Street Food & Market Tour', duration: 120, category: 'Food Local/Market', time: '11:00' },
      { name: 'Fine Dining Experience', duration: 150, category: 'Restaurant Fine', time: '19:30' },
      { name: 'Cooking Class with Local Chef', duration: 180, category: 'Food Experience', time: '14:00' },
      { name: 'Farmers Market & Food Stalls', duration: 90, category: 'Food Local/Market', time: '08:00' },
      { name: 'Street Food Evening Tour', duration: 120, category: 'Food Casual/Street', time: '18:00' },
      { name: 'Traditional Restaurant Dinner', duration: 140, category: 'Restaurant Fine', time: '20:00' },
    ],
    shopping: [
      { name: 'Local Market & Souvenirs', duration: 120, category: 'Shopping/Market', time: '10:00' },
      { name: 'Artisan Craft Shop Tour', duration: 90, category: 'Shopping/Market', time: '11:00' },
      { name: 'Downtown Shopping District', duration: 150, category: 'Shopping/Market', time: '13:00' },
      { name: 'Night Market Exploration', duration: 120, category: 'Shopping/Market', time: '18:00' },
      { name: 'Boutique District Walk', duration: 100, category: 'Shopping/Market', time: '15:00' },
    ],
    adventure: [
      { name: 'Zip Line Adventure Park', duration: 180, category: 'Adventure/Active', time: '09:00' },
      { name: 'Rock Climbing Experience', duration: 150, category: 'Adventure/Active', time: '08:30' },
      { name: 'Skydiving or Extreme Sport', duration: 120, category: 'Adventure/Active', time: '10:00' },
      { name: 'ATV Desert Ride', duration: 180, category: 'Adventure/Active', time: '14:00' },
      { name: 'Surfing Lesson at Beach', duration: 120, category: 'Beach/Water', time: '09:00' },
    ],
    wellness: [
      { name: 'Spa & Wellness Retreat', duration: 180, category: 'Spa/Wellness', time: '10:00' },
      { name: 'Yoga Class in Nature', duration: 90, category: 'Spa/Wellness', time: '07:00' },
      { name: 'Meditation & Mindfulness Session', duration: 60, category: 'Spa/Wellness', time: '18:00' },
      { name: 'Traditional Massage Treatment', duration: 120, category: 'Spa/Wellness', time: '14:00' },
    ],
    nightlife: [
      { name: 'Local Bar & Drinks', duration: 90, category: 'Bar/Drinks', time: '20:00' },
      { name: 'Nightclub Experience', duration: 120, category: 'Club Nightlife', time: '22:00' },
      { name: 'Live Music Venue', duration: 150, category: 'Bar/Drinks', time: '21:00' },
      { name: 'Rooftop Bar with City View', duration: 100, category: 'Bar/Drinks', time: '19:30' },
      { name: 'Casino & Entertainment', duration: 180, category: 'Club Nightlife', time: '21:00' },
    ],
  };

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

  const itinerary: ItineraryItem[] = [];
  const usedActivities = new Set<string>();

  // For each day and time slot
  for (let day = 1; day <= days; day++) {
    const times = ['09:00', '13:00', '18:00'];

    for (let timeSlotIndex = 0; timeSlotIndex < 3; timeSlotIndex++) {
      const time = times[timeSlotIndex];

      // Rotate through activity categories based on day
      let categoryPool: ActivityTemplate[] = [];

      // Mix activities based on tag preferences and day rotation
      if (day % 4 === 1 || tags.some(t => t.toLowerCase().includes('cultura'))) {
        categoryPool = [...categoryPool, ...activityTemplates.cultural];
      }
      if (day % 4 === 2 || tags.some(t => t.toLowerCase().includes('natureza') || t.toLowerCase().includes('aventura'))) {
        categoryPool = [...categoryPool, ...activityTemplates.nature];
      }
      if (day % 4 === 3 || tags.some(t => t.toLowerCase().includes('gastronomia'))) {
        categoryPool = [...categoryPool, ...activityTemplates.foodie];
      }
      if (day % 4 === 0 || tags.some(t => t.toLowerCase().includes('compras'))) {
        categoryPool = [...categoryPool, ...activityTemplates.shopping, ...activityTemplates.nightlife];
      }

      // Always include wellness and adventure as options
      categoryPool = [...categoryPool, ...activityTemplates.wellness, ...activityTemplates.adventure];

      // Filter out already used activities
      const availableActivities = categoryPool.filter(
        (activity) => !usedActivities.has(activity.name)
      );

      if (availableActivities.length === 0) {
        // If all activities exhausted, cycle through again (should rarely happen)
        categoryPool = activityTemplates.cultural.concat(
          activityTemplates.nature,
          activityTemplates.foodie,
          activityTemplates.shopping
        );
      }

      // Pick random activity from available
      const selectedActivity =
        availableActivities[Math.floor(Math.random() * availableActivities.length)] ||
        categoryPool[Math.floor(Math.random() * categoryPool.length)];

      // Avoid duplicate times on same day
      let finalTime = time;
      if (timeSlotIndex === 1) {
        finalTime = `${12 + Math.floor(Math.random() * 3)}:${Math.random() > 0.5 ? '30' : '00'}`;
      } else if (timeSlotIndex === 2) {
        finalTime = `${17 + Math.floor(Math.random() * 5)}:${Math.random() > 0.5 ? '30' : '00'}`;
      }

      usedActivities.add(selectedActivity.name);

      // Add slight random offset for coordinates
      const lat = baseCoords[0] + (Math.random() - 0.5) * 0.1;
      const lng = baseCoords[1] + (Math.random() - 0.5) * 0.1;

      itinerary.push({
        day,
        time: finalTime,
        name: selectedActivity.name,
        duration: selectedActivity.duration,
        reason: `Experience this ${selectedActivity.category.toLowerCase()} in ${destination}`,
        tip: getBudgetAppropriateTips(budget)[Math.floor(Math.random() * 3)],
        category: selectedActivity.category,
        location: {
          lat,
          lng,
        },
      });
    }
  }

  return itinerary;
};

/**
 * Get tips based on budget
 */
const getBudgetAppropriateTips = (budget: string): string[] => {
  const tipsByBudget: Record<string, string[]> = {
    'ultra-economico': [
      'Look for free walking tours',
      'Eat where locals eat',
      'Use public transport passes',
      'Book activities in advance for discounts',
      'Visit museums on free days',
    ],
    'economico': [
      'Check for student or group discounts',
      'Eat at local neighborhood restaurants',
      'Use metro or public transport',
      'Visit attractions early or late',
      'Book combo tickets when available',
    ],
    'medio': [
      'Book skip-the-line tickets online',
      'Try mid-range restaurants',
      'Use app-based transportation',
      'Join group tours for better prices',
      'Explore different neighborhoods',
    ],
    'premium': [
      'Consider private tours',
      'Book reservations at top restaurants',
      'Use rideshare for convenience',
      'Purchase VIP access when available',
      'Enjoy fine dining experiences',
    ],
    'luxo': [
      'Book private guides',
      'Dine at Michelin-starred restaurants',
      'Use premium car services',
      'Purchase exclusive experiences',
      'Enjoy luxury accommodations',
    ],
  };

  return tipsByBudget[budget] || tipsByBudget['medio'];
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
          temperature: 0.8,
          maxOutputTokens: 4096,
          topP: 0.9,
          topK: 50,
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

    // Validate itinerary for repetitions
    console.log('🔍 VALIDATING ITINERARY FOR REPETITIONS...');
    const validation = validateAndFixItinerary(itineraryItems);
    
    if (!validation.valid) {
      console.warn('⚠️ Itinerary has repetitions. Consider retrying with different parameters.');
    }

    return {
      destination,
      days,
      itinerary: itineraryItems,
      tips: jsonData.tips || ['Check local weather', 'Learn basic local phrases'],
    };
  } catch (error) {
    console.error('❌ Error generating itinerary with Gemini:', error);
    console.warn('⚠️ Using enhanced fallback itinerary instead...');
    
    // Generate a well-structured, diversified fallback
    const fallbackActivities = generateDiversifiedFallbackItinerary(
      destination,
      days,
      tags,
      budget
    );

    // Validate fallback itinerary
    console.log('🔍 VALIDATING FALLBACK ITINERARY...');
    const validation = validateAndFixItinerary(fallbackActivities);
    
    if (!validation.valid) {
      console.warn('⚠️ Fallback itinerary has repetitions:');
      validation.issues.forEach((issue) => console.warn(`   - ${issue}`));
    } else {
      console.log('✅ FALLBACK ITINERARY VALIDATION PASSED!');
    }

    const fallbackItinerary: GeneratedItinerary = {
      destination,
      days,
      itinerary: fallbackActivities,
      tips: getBudgetAppropriateTips(budget),
    };
    
    console.log('📋 Using enhanced fallback itinerary with', fallbackActivities.length, 'diversified activities');
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
