// User Profile
export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  tags: string[]; // ["gastronomia", "médio", "casal"]
  createdAt: Date;
}

// Travel Trip
export interface Trip {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  attractions: Attraction[];
  createdAt: Date;
  updatedAt: Date;
  isSyncedToFirestore: boolean; // para controle offline
}

// Attraction in a trip
export interface Attraction {
  id: string;
  day: number; // 1, 2, 3...
  time: string; // "09:00"
  name: string;
  duration: number; // em minutos
  reason: string;
  tip?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  order?: number; // para controlar ordem de drag & drop
}

// Onboarding Quiz
export interface QuizAnswers {
  travelStyle: "aventura" | "relax" | "cultura" | "gastronomia";
  budget: "econômico" | "médio" | "luxo";
  travelWith: "sozinho" | "casal" | "família" | "amigos";
}

// Gemini API Response
export interface GeminiItinerary {
  day: number;
  time: string;
  name: string;
  duration: number;
  reason: string;
  tip: string;
  location: {
    lat: number;
    lng: number;
  };
}

// Google Places AutoComplete
export interface PlacePrediction {
  main_text: string;
  secondary_text: string;
  place_id: string;
}

// Google Maps Direction Response
export interface DirectionRoute {
  distance: string;
  duration: string;
  polyline: string;
}
