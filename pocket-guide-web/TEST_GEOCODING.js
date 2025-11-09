/**
 * Test script for geocoding service
 * Run in browser console to test geocoding
 */

// Copy and paste this into the browser console to test:

(async () => {
  // Import the geocoding functions
  const { geocodeLocation, geocodePlaceInDestination } = await import('/src/services/geocodingService.ts');
  
  console.log('🧪 Testing Geocoding Service...\n');
  
  // Test 1: Simple location
  console.log('Test 1: Geocoding "Goa"');
  const goa = await geocodeLocation('Goa');
  console.log('Result:', goa);
  console.log('');
  
  // Test 2: Place in destination
  console.log('Test 2: Geocoding "Eiffel Tower, Paris"');
  const eiffel = await geocodePlaceInDestination('Eiffel Tower', 'Paris');
  console.log('Result:', eiffel);
  console.log('');
  
  // Test 3: Brazilian location
  console.log('Test 3: Geocoding "Christ the Redeemer, Rio de Janeiro"');
  const christRedeemer = await geocodePlaceInDestination('Christ the Redeemer', 'Rio de Janeiro');
  console.log('Result:', christRedeemer);
})();
