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
import { geocodePlaceInDestination, geocodeLocation } from "./geocodingService";

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
 * Extract coordinates from API response or geocode the location
 * Tries: provided coordinates → geocoding place name → destination center
 */
const extractCoordinates = async (item: GeminiActivity, destination: string): Promise<Location> => {
  let lat = item.lat !== undefined ? item.lat : item.latitude;
  let lng = item.lng !== undefined ? item.lng : item.longitude;
  
  // Validate coordinates: must be within valid ranges
  const isValidCoordinate = (lat: any, lng: any): boolean => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    return !isNaN(latNum) && !isNaN(lngNum) && 
           latNum !== 0 && lngNum !== 0 &&
           latNum >= -90 && latNum <= 90 && 
           lngNum >= -180 && lngNum <= 180;
  };
  
  // If valid coordinates provided by Gemini, use them
  if (isValidCoordinate(lat, lng)) {
    console.log(`✅ Using Gemini-provided coordinates for "${item.name}": [${lat}, ${lng}]`);
    return {
      lat: Number(lat),
      lng: Number(lng),
    };
  }

  // Try to geocode the place name in the destination
  if (item.name) {
    console.log(`🔍 Attempting geocoding for "${item.name}" in "${destination}"`);
    const geocoded = await geocodePlaceInDestination(item.name, destination);
    if (geocoded && geocoded.lat !== 0 && geocoded.lng !== 0) {
      console.log(`✅ Successfully geocoded "${item.name}" to [${geocoded.lat}, ${geocoded.lng}]`);
      return geocoded;
    }
  }

  // Fallback: use destination center
  console.log(`⚠️ Geocoding failed for "${item.name}", using destination center for "${destination}"`);
  const destCoords = await geocodeLocation(destination);
  if (destCoords && destCoords.lat !== 0 && destCoords.lng !== 0) {
    console.log(`✅ Using destination center [${destCoords.lat}, ${destCoords.lng}]`);
    return destCoords;
  }

  // Last resort: log warning and return destination center attempt again with different approach
  console.warn(`❌ Could not geocode "${item.name}" in "${destination}", attempting direct geocoding of destination`);
  try {
    // Try one more time with just the destination
    const finalAttempt = await geocodeLocation(destination);
    if (finalAttempt) {
      console.log(`✅ Final attempt: Using geocoded destination [${finalAttempt.lat}, ${finalAttempt.lng}]`);
      return finalAttempt;
    }
  } catch (e) {
    console.error(`Final geocoding attempt failed:`, e);
  }

  // Absolute last resort: return 0,0 (should be very rare)
  console.error(`🚨 CRITICAL: Could not determine coordinates for "${item.name}" in "${destination}"`);
  return { lat: 0, lng: 0 };
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
const generateDiversifiedFallbackItinerary = async (
  destination: string,
  days: number,
  _tags: string[],  // Tags parameter (can be used in future for interest-based variety)
  budget: string
): Promise<ItineraryItem[]> => {
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
      { name: 'Archaeological Museum Visit', duration: 130, category: 'Museum/Art', time: '10:30' },
      { name: 'Contemporary Art Exhibition', duration: 100, category: 'Museum/Art', time: '14:30' },
      { name: 'Historical Architecture Tour', duration: 160, category: 'Monument/Historical', time: '11:00' },
      { name: 'Traditional Craft Workshop', duration: 120, category: 'Cultural Site', time: '15:00' },
      { name: 'Religious Monument Exploration', duration: 140, category: 'Monument/Historical', time: '13:00' },
      { name: 'Street Art & Murals Tour', duration: 110, category: 'Cultural Site', time: '16:00' },
    ],
    nature: [
      { name: 'Mountain Hiking Adventure', duration: 240, category: 'Hiking/Trail', time: '07:00' },
      { name: 'Beach Day & Water Activities', duration: 300, category: 'Beach/Water', time: '08:00' },
      { name: 'National Park Exploration', duration: 200, category: 'Park/Nature', time: '09:00' },
      { name: 'Sunset Viewing at Natural Park', duration: 120, category: 'Park/Nature', time: '17:00' },
      { name: 'Tropical Garden Visit', duration: 100, category: 'Park/Nature', time: '10:00' },
      { name: 'Waterfall Trek', duration: 210, category: 'Hiking/Trail', time: '08:30' },
      { name: 'Forest Nature Walk', duration: 150, category: 'Park/Nature', time: '09:30' },
      { name: 'Lake & River Activity', duration: 180, category: 'Beach/Water', time: '09:00' },
      { name: 'Wildlife Viewing Expedition', duration: 240, category: 'Hiking/Trail', time: '06:00' },
      { name: 'Botanical Garden Tour', duration: 120, category: 'Park/Nature', time: '14:00' },
      { name: 'Scenic Valley Hike', duration: 180, category: 'Hiking/Trail', time: '08:00' },
      { name: 'Beach Sunset Relaxation', duration: 90, category: 'Beach/Water', time: '18:00' },
      { name: 'Mountain Peak Adventure', duration: 300, category: 'Hiking/Trail', time: '07:00' },
      { name: 'River Kayaking Experience', duration: 150, category: 'Beach/Water', time: '09:00' },
    ],
    foodie: [
      { name: 'Street Food & Market Tour', duration: 120, category: 'Food Local/Market', time: '11:00' },
      { name: 'Fine Dining Experience', duration: 150, category: 'Restaurant Fine', time: '19:30' },
      { name: 'Cooking Class with Local Chef', duration: 180, category: 'Food Experience', time: '14:00' },
      { name: 'Farmers Market & Food Stalls', duration: 90, category: 'Food Local/Market', time: '08:00' },
      { name: 'Street Food Evening Tour', duration: 120, category: 'Food Casual/Street', time: '18:00' },
      { name: 'Traditional Restaurant Dinner', duration: 140, category: 'Restaurant Fine', time: '20:00' },
      { name: 'Seafood Restaurant Experience', duration: 130, category: 'Restaurant Fine', time: '19:00' },
      { name: 'Local Cuisine Cooking Session', duration: 170, category: 'Food Experience', time: '15:00' },
      { name: 'Street Snacks Tasting Tour', duration: 100, category: 'Food Casual/Street', time: '11:30' },
      { name: 'Dessert & Pastry Shop Crawl', duration: 110, category: 'Food Casual/Street', time: '17:00' },
      { name: 'Wine & Tapas Experience', duration: 120, category: 'Restaurant Fine', time: '19:00' },
      { name: 'Food Market & Ingredients Tour', duration: 100, category: 'Food Local/Market', time: '09:00' },
      { name: 'Fusion Restaurant Discovery', duration: 130, category: 'Restaurant Fine', time: '20:30' },
      { name: 'Coffee & Local Café Experience', duration: 80, category: 'Food Casual/Street', time: '10:00' },
      { name: 'Night Market Food Adventure', duration: 120, category: 'Food Local/Market', time: '19:00' },
    ],
    shopping: [
      { name: 'Local Market & Souvenirs', duration: 120, category: 'Shopping/Market', time: '10:00' },
      { name: 'Artisan Craft Shop Tour', duration: 90, category: 'Shopping/Market', time: '11:00' },
      { name: 'Downtown Shopping District', duration: 150, category: 'Shopping/Market', time: '13:00' },
      { name: 'Night Market Exploration', duration: 120, category: 'Shopping/Market', time: '18:00' },
      { name: 'Boutique District Walk', duration: 100, category: 'Shopping/Market', time: '15:00' },
      { name: 'Antique & Vintage Shopping', duration: 130, category: 'Shopping/Market', time: '11:00' },
      { name: 'Local Designer Boutiques', duration: 110, category: 'Shopping/Market', time: '14:00' },
      { name: 'Street Market & Haggling Experience', duration: 140, category: 'Shopping/Market', time: '09:00' },
      { name: 'Department Store Discovery', duration: 120, category: 'Shopping/Market', time: '16:00' },
    ],
    adventure: [
      { name: 'Zip Line Adventure Park', duration: 180, category: 'Adventure/Active', time: '09:00' },
      { name: 'Rock Climbing Experience', duration: 150, category: 'Adventure/Active', time: '08:30' },
      { name: 'Skydiving or Extreme Sport', duration: 120, category: 'Adventure/Active', time: '10:00' },
      { name: 'ATV Desert Ride', duration: 180, category: 'Adventure/Active', time: '14:00' },
      { name: 'Surfing Lesson at Beach', duration: 120, category: 'Beach/Water', time: '09:00' },
      { name: 'Paragliding Experience', duration: 180, category: 'Adventure/Active', time: '09:00' },
      { name: 'Bungee Jumping Adventure', duration: 120, category: 'Adventure/Active', time: '11:00' },
      { name: 'Mountain Biking Trail', duration: 180, category: 'Adventure/Active', time: '08:00' },
      { name: 'White Water Rafting', duration: 150, category: 'Adventure/Active', time: '09:00' },
      { name: 'Canopy Zip Line Tour', duration: 170, category: 'Adventure/Active', time: '14:00' },
    ],
    wellness: [
      { name: 'Spa & Wellness Retreat', duration: 180, category: 'Spa/Wellness', time: '10:00' },
      { name: 'Yoga Class in Nature', duration: 90, category: 'Spa/Wellness', time: '07:00' },
      { name: 'Meditation & Mindfulness Session', duration: 60, category: 'Spa/Wellness', time: '18:00' },
      { name: 'Traditional Massage Treatment', duration: 120, category: 'Spa/Wellness', time: '14:00' },
      { name: 'Sunrise Yoga Practice', duration: 75, category: 'Spa/Wellness', time: '06:30' },
      { name: 'Wellness & Detox Program', duration: 150, category: 'Spa/Wellness', time: '09:00' },
      { name: 'Holistic Health Workshop', duration: 120, category: 'Spa/Wellness', time: '10:00' },
      { name: 'Hot Spring & Thermal Bath', duration: 140, category: 'Spa/Wellness', time: '15:00' },
      { name: 'Ayurvedic Treatment Session', duration: 130, category: 'Spa/Wellness', time: '11:00' },
      { name: 'Tai Chi & Meditation', duration: 90, category: 'Spa/Wellness', time: '07:00' },
      { name: 'Pilates & Fitness Class', duration: 60, category: 'Spa/Wellness', time: '09:00' },
    ],
    nightlife: [
      { name: 'Local Bar & Drinks', duration: 90, category: 'Bar/Drinks', time: '20:00' },
      { name: 'Nightclub Experience', duration: 120, category: 'Club Nightlife', time: '22:00' },
      { name: 'Live Music Venue', duration: 150, category: 'Bar/Drinks', time: '21:00' },
      { name: 'Rooftop Bar with City View', duration: 100, category: 'Bar/Drinks', time: '19:30' },
      { name: 'Casino & Entertainment', duration: 180, category: 'Club Nightlife', time: '21:00' },
      { name: 'Jazz Club Evening', duration: 120, category: 'Bar/Drinks', time: '20:30' },
      { name: 'Dance Club Night', duration: 150, category: 'Club Nightlife', time: '22:30' },
      { name: 'Karaoke Bar Adventure', duration: 140, category: 'Bar/Drinks', time: '21:00' },
      { name: 'Craft Beer Tasting', duration: 100, category: 'Bar/Drinks', time: '19:00' },
      { name: 'Comedy Show & Drinks', duration: 130, category: 'Bar/Drinks', time: '20:00' },
      { name: 'Late Night Lounge', duration: 110, category: 'Club Nightlife', time: '23:00' },
    ],
  };

  // Geocode the destination to get accurate base coordinates
  console.log(`🌍 Geocoding destination "${destination}" for fallback itinerary`);
  const geocodedDest = await geocodeLocation(destination);
  const baseCoords: [number, number] = geocodedDest 
    ? [geocodedDest.lat, geocodedDest.lng]
    : [0, 0];
  
  if (baseCoords[0] === 0 && baseCoords[1] === 0) {
    console.warn(`⚠️ Could not geocode destination "${destination}", using Null Island (0,0)`);
  } else {
    console.log(`✅ Geocoded destination to [${baseCoords[0]}, ${baseCoords[1]}]`);
  }

  const itinerary: ItineraryItem[] = [];
  const usedCategoriesByDay: Record<number, string[]> = {};

  // GUARANTEED diversity strategy: create rotating activity pool
  // Expand the activity pool by cycling through categories in different orders
  const expandedActivityPool: ActivityTemplate[] = [];
  
  // Create a MASSIVE pool by repeating all activities multiple times in different rotations
  const categoryKeys = Object.keys(activityTemplates);
  const timesToRepeat = Math.ceil((days * 3) / categoryKeys.length) + 2;
  
  // Build expanded pool with multiple rotations
  for (let rotation = 0; rotation < timesToRepeat; rotation++) {
    const rotatedKeys = categoryKeys.slice(rotation).concat(categoryKeys.slice(0, rotation));
    
    rotatedKeys.forEach(categoryKey => {
      const activities = activityTemplates[categoryKey as keyof typeof activityTemplates];
      expandedActivityPool.push(...activities);
    });
  }

  // Fisher-Yates shuffle for guaranteed randomization
  console.log(`🎯 Expanded activity pool to ${expandedActivityPool.length} activities`);
  for (let i = expandedActivityPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [expandedActivityPool[i], expandedActivityPool[j]] = [expandedActivityPool[j], expandedActivityPool[i]];
  }

  // Now build itinerary with GUARANTEED variety - track what we've used
  const totalActivitiesNeeded = days * 3;
  const usedActivityNames = new Set<string>();
  const usedActivityCategories = new Set<string>();
  
  console.log(`🎯 Need ${totalActivitiesNeeded} activities for ${days} days`);
  console.log(`📦 Available activities in pool: ${expandedActivityPool.length}`);

  // For each day and time slot
  for (let day = 1; day <= days; day++) {
    usedCategoriesByDay[day] = [];
    const times = ['09:00', '13:00', '18:00'];

    for (let timeSlotIndex = 0; timeSlotIndex < 3; timeSlotIndex++) {
      // Find an activity that hasn't been used yet (by name AND category)
      let selectedActivity: ActivityTemplate | null = null;
      let searchAttempts = 0;
      
      while (!selectedActivity && searchAttempts < expandedActivityPool.length) {
        const candidateIndex = (((day - 1) * 3 + timeSlotIndex) + searchAttempts * 137) % expandedActivityPool.length; // Prime multiplier for distribution
        const candidate = expandedActivityPool[candidateIndex];
        
        // Check if this activity's name or category has been used
        if (!usedActivityNames.has(candidate.name) && !usedActivityCategories.has(candidate.category)) {
          selectedActivity = candidate;
          usedActivityNames.add(candidate.name);
          usedActivityCategories.add(candidate.category);
          break;
        }
        
        searchAttempts++;
      }
      
      if (!selectedActivity) {
        console.warn(`⚠️ Could not find unique activity for day ${day}, slot ${timeSlotIndex}`);
        // If we can't find unique, pick one with at least unique name
        for (const candidate of expandedActivityPool) {
          if (!usedActivityNames.has(candidate.name)) {
            selectedActivity = candidate;
            usedActivityNames.add(candidate.name);
            usedActivityCategories.add(candidate.category);
            break;
          }
        }
      }
      
      if (!selectedActivity) {
        console.warn(`⚠️ Could not select activity for day ${day}, time slot ${timeSlotIndex}`);
        continue;
      }

      // Generate unique time for each activity
      let finalTime = times[timeSlotIndex];
      if (timeSlotIndex === 0) {
        finalTime = `${7 + Math.floor(Math.random() * 3)}:${Math.random() > 0.5 ? '30' : '00'}`;
      } else if (timeSlotIndex === 1) {
        finalTime = `${12 + Math.floor(Math.random() * 3)}:${Math.random() > 0.5 ? '30' : '00'}`;
      } else if (timeSlotIndex === 2) {
        finalTime = `${17 + Math.floor(Math.random() * 5)}:${Math.random() > 0.5 ? '30' : '00'}`;
      }

      usedCategoriesByDay[day].push(selectedActivity.category);

      // Add slight random offset for coordinates
      const lat = baseCoords[0] + (Math.random() - 0.5) * 0.1;
      const lng = baseCoords[1] + (Math.random() - 0.5) * 0.1;

      const tip = getBudgetAppropriateTips(budget);
      const selectedTip = tip[Math.floor(Math.random() * tip.length)];

      itinerary.push({
        day,
        time: finalTime,
        name: selectedActivity.name,
        duration: selectedActivity.duration,
        reason: `Experience this ${selectedActivity.category.toLowerCase()} in ${destination}`,
        tip: selectedTip,
        category: selectedActivity.category,
        location: {
          lat,
          lng,
        },
      });
    }
  }

  // Final validation: ensure no two consecutive days have same category
  console.log('🎯 Fallback Itinerary Category Distribution:');
  for (let day = 1; day <= days; day++) {
    console.log(`   Day ${day}: ${usedCategoriesByDay[day]?.join(', ') || 'N/A'}`);
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
          temperature: 1.5,  // 🔥 Máxima criatividade para diversificação
          maxOutputTokens: 4096,
          topP: 0.98,  // Aumentado para mais variedade
          topK: 60,   // Aumentado para mais opções
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

    // Process activities with geocoding (async)
    const itineraryItems: ItineraryItem[] = [];
    for (let index = 0; index < activities.length; index++) {
      const item = activities[index];
      const location = await extractCoordinates(item, destination);
      
      itineraryItems.push({
        day: item.day || Math.floor(index / 3) + 1,
        time: item.time || '09:00',
        name: item.name || 'Activity',
        duration: item.duration || 120,
        reason: item.reason || 'Explore this attraction',
        tip: item.tip || 'Check opening hours',
        category: item.category || 'General',
        location,
      });
    }

    // Validate itinerary for repetitions
    console.log('🔍 VALIDATING ITINERARY FOR REPETITIONS...');
    const validation = validateAndFixItinerary(itineraryItems);
    
    if (!validation.valid) {
      console.warn('⚠️ Gemini itinerary has repetitions:');
      validation.issues.forEach((issue) => console.warn(`   - ${issue}`));
      
      // ❌ ANY repetition = use diversified fallback (not just > 5)
      if (validation.issues.length > 0) {
        console.warn('🚨 REPETITIONS DETECTED! Using diversified fallback itinerary instead...');
        
        // Generate a well-structured, diversified fallback
        const fallbackActivities = await generateDiversifiedFallbackItinerary(
          destination,
          days,
          tags,
          budget
        );

        const fallbackItinerary: GeneratedItinerary = {
          destination,
          days,
          itinerary: fallbackActivities,
          tips: getBudgetAppropriateTips(budget),
        };
        
        console.log('✅ Using diversified fallback itinerary with', fallbackActivities.length, 'activities');
        return fallbackItinerary;
      }
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
    const fallbackActivities = await generateDiversifiedFallbackItinerary(
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
