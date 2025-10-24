/**
 * Google Maps Service
 * Handles places autocomplete, directions, and map operations
 */

import { PlacePrediction, DirectionRoute } from "../types";

/**
 * Get place predictions from Google Places API
 */
export const getPlacePredictions = async (
  _input: string
): Promise<PlacePrediction[]> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Google Places API request failed");
    }

    const data = await response.json();

    return data.predictions.map((prediction: any) => ({
      main_text: prediction.main_text,
      secondary_text: prediction.description,
      place_id: prediction.place_id,
    }));
  } catch (error) {
    console.error("Error fetching place predictions:", error);
    throw error;
  }
};

/**
 * Get place details including coordinates
 */
export const getPlaceDetails = async (
  placeId: string
): Promise<{ lat: number; lng: number; address: string }> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Google Places Details API request failed");
    }

    const data = await response.json();
    const location = data.result.geometry.location;
    const address = data.result.formatted_address;

    return {
      lat: location.lat,
      lng: location.lng,
      address,
    };
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
};

/**
 * Get optimized route between attractions
 */
export const getOptimizedRoute = async (
  origins: { lat: number; lng: number }[],
  destination: { lat: number; lng: number }
): Promise<DirectionRoute> => {
  try {
    // Use Google Directions API
    const waypoints = origins.slice(0, -1);
    const waypointsParam = waypoints
      .map((w) => `${w.lat},${w.lng}`)
      .join("|");
    const originParam = `${origins[0].lat},${origins[0].lng}`;
    const destinationParam = `${destination.lat},${destination.lng}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originParam}&destination=${destinationParam}&waypoints=${waypointsParam}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Google Directions API request failed");
    }

    const data = await response.json();
    const route = data.routes[0];

    return {
      distance: route.legs.reduce((sum: number, leg: any) => {
        const distance = leg.distance.value; // in meters
        return sum + distance;
      }, 0) + "m",
      duration: route.legs.reduce((sum: number, leg: any) => {
        const duration = leg.duration.value; // in seconds
        return sum + duration;
      }, 0) + "s",
      polyline: route.overview_polyline.points,
    };
  } catch (error) {
    console.error("Error fetching optimized route:", error);
    throw error;
  }
};
