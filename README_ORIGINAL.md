# 🎒 Pocket Guide - Project Structure

## Overview

**Pocket Guide v1 (MVP)** is an AI-powered travel itinerary app built with React Native and TypeScript. It allows users to create personalized travel plans in under 3 minutes, with full offline functionality.

## 📁 Directory Structure

```
src/
├── components/           # Reusable UI components
│   ├── TripCard.tsx             # Displays a trip card (used in HomeScreen)
│   ├── AttractionCard.tsx       # Displays an attraction/activity card
│   └── LoadingSpinner.tsx       # Loading indicator component
│
├── screens/              # Navigation screens
│   ├── LoginScreen.tsx          # Google Sign-In screen
│   ├── OnboardingQuiz.tsx       # 3-question preference quiz
│   ├── HomeScreen.tsx           # List of user's trips
│   ├── CreateTripScreen.tsx     # Create new trip (destination + dates)
│   ├── TripDetailScreen.tsx     # Editable itinerary with drag & drop
│   └── MapDayScreen.tsx         # Map view of attractions for a day
│
├── services/             # API integration and external services
│   ├── firebase.ts              # Firebase Auth + Firestore setup
│   ├── gemini.ts                # Google Gemini API for itinerary generation
│   └── googleMaps.ts            # Google Places + Directions APIs
│
├── hooks/                # Custom React hooks
│   └── useAuth.ts               # Authentication state and methods
│
├── store/                # State management (Zustand)
│   └── tripStore.ts             # Trip and attraction state management
│
├── types/                # TypeScript type definitions
│   ├── index.ts                 # Main app types (User, Trip, Attraction, etc.)
│   └── firestore.ts             # Firestore-specific types (with Timestamps)
│
├── utils/                # Helper functions
│   └── formatDate.ts            # Date formatting utilities
│
└── App.tsx               # Root component with navigation setup
```

## 🔧 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native + TypeScript |
| **State Management** | Zustand (with AsyncStorage persistence) |
| **Authentication** | Firebase Authentication + Google Sign-In |
| **Backend** | Firestore (NoSQL) |
| **AI** | Google Gemini API |
| **Maps** | Google Maps SDK + Places API + Directions API |
| **Offline** | AsyncStorage + Google Maps cache |
| **Navigation** | React Navigation (native-stack) |

## 📋 Component Details

### Components (`src/components/`)

#### **TripCard.tsx**
- Displays trip information: destination, dates, duration, attraction count
- Used in `HomeScreen` to list saved trips
- Tap to navigate to trip details

#### **AttractionCard.tsx**
- Shows attraction details: time, name, reason, tip, duration
- Has drag handle for reordering
- Long press to edit/delete
- Blue left border to distinguish from other elements

#### **LoadingSpinner.tsx**
- Reusable loading indicator with optional message
- Supports `fullScreen` prop to center on entire screen
- Customizable size (small/large)

### Screens (`src/screens/`)

#### **LoginScreen.tsx**
- Initial app screen
- Google Sign-In button
- Shows features and benefits
- Routes to `OnboardingQuiz` on successful login

#### **OnboardingQuiz.tsx**
- 3 quick questions to create user profile:
  1. Travel style (Adventure/Relax/Culture/Gastronomy)
  2. Budget (Budget/Mid-range/Luxury)
  3. Travel companion (Solo/Partner/Family/Friends)
- Progress bar showing question progress
- Answers saved as tags in user profile

#### **HomeScreen.tsx**
- Displays all user's trips in a list
- Shows trip destination, dates, and number of attractions
- FAB button to create new trip
- Empty state with call-to-action

#### **CreateTripScreen.tsx**
- Form to create a new trip:
  - Destination (with Google Places autocomplete)
  - Start and end dates (date picker)
- "Generate Itinerary" button calls Gemini API
- Info section explaining how it works

#### **TripDetailScreen.tsx**
- Shows itinerary for selected trip
- Day selector to view attractions by day
- Displays attractions with time, name, reason, tip
- "Add Attraction" button to add custom activities
- "View on Map" button to see route

#### **MapDayScreen.tsx**
- Map view of attractions for a specific day
- Shows optimized route between locations
- Numbered list of attractions with times
- "Get Directions" button to open navigation

## 🗄️ Data Types (`src/types/`)

### **User**
```typescript
{
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  tags: string[];  // ["gastronomia", "médio", "casal"]
  createdAt: Date;
}
```

### **Trip**
```typescript
{
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  attractions: Attraction[];
  createdAt: Date;
  updatedAt: Date;
  isSyncedToFirestore: boolean;  // for offline support
}
```

### **Attraction**
```typescript
{
  id: string;
  day: number;
  time: string;  // "09:00"
  name: string;
  duration: number;  // in minutes
  reason: string;
  tip?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  order?: number;  // for drag & drop
}
```

## 🔄 State Management (Zustand)

The `tripStore.ts` uses Zustand for centralized state with AsyncStorage persistence:

**State:**
- `trips[]` - All user trips
- `currentTrip` - Currently viewed trip
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `setTrips()` / `addTrip()` / `updateTrip()` / `deleteTrip()`
- `addAttraction()` / `updateAttraction()` / `deleteAttraction()` / `reorderAttractions()`
- `markForSync()` / `markSynced()` - Offline sync management
- `getSyncPendingTrips()` - Get trips to sync

## 🔐 Authentication Flow

1. User opens app → `LoginScreen`
2. Clicks "Sign in with Google" → Firebase Auth
3. Successful login → `OnboardingQuiz`
4. Completes quiz → answers saved as tags
5. Redirects to `HomeScreen`

## 🤖 AI Integration (Gemini)

The app uses Google Gemini API to generate personalized itineraries:

**Input:**
- Destination
- Travel dates
- User preferences (tags)

**Output:** JSON array of attractions with:
- Day number
- Time
- Name
- Duration
- Reason (why it matches preferences)
- Tip
- Coordinates (lat/lng)

## 🗺️ Google Maps Integration

1. **Places API** - Destination autocomplete
2. **Directions API** - Optimized routes between attractions
3. **Map SDK** - Display attractions and routes
4. **Cache** - Offline map tiles

## 📱 Offline Support

- All data cached in `AsyncStorage`
- Edits saved locally
- Maps tiles cached for offline viewing
- On reconnect: `markForSync()` → sync pending trips to Firestore

## 🚀 User Flow (3 Minutes)

1. **Login (10s)** - Sign in with Google
2. **Quiz (30s)** - Answer 3 preference questions
3. **Create Trip (30s)** - Select destination and dates
4. **Generate (30s)** - AI creates itinerary
5. **Edit (30s)** - Drag/reorder, add/remove attractions
6. **View Map (10s)** - See route on map
7. **Go Offline (10s)** - Turn off Wi-Fi, still works

**Total: ~3 minutes ⏱️**

## 📦 Dependencies

Install with:
```bash
npm install
# or
yarn install
```

### Required packages:
```json
{
  "react-native": "^0.73.0",
  "typescript": "^5.0.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/native-stack": "^6.9.0",
  "zustand": "^4.4.0",
  "firebase": "^10.0.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "@react-native-maps/maps": "^1.7.0",
  "react-native-draggable-flatlist": "^4.0.0"
}
```

## ⚙️ Environment Variables

Create `.env` file:
```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx

REACT_APP_GEMINI_API_KEY=xxx
REACT_APP_GOOGLE_MAPS_API_KEY=xxx
```

## 🎨 Design System

**Colors:**
- Primary: `#3B82F6` (Blue)
- Text Primary: `#1F2937` (Dark Gray)
- Text Secondary: `#6B7280` (Gray)
- Background: `#FFFFFF` (White)
- Borders: `#E5E7EB` (Light Gray)

**Typography:**
- Headings: Bold, 24-28px
- Body: Regular, 14-16px
- Small: Regular, 12-13px

## 📝 Next Steps

1. **Install dependencies** - Run `npm install`
2. **Set up Firebase** - Create Firestore project and add credentials
3. **Get API keys** - Gemini API and Google Maps API
4. **Implement TODO items** - Search for `TODO` comments in code
5. **Test offline** - Use AsyncStorage for offline mode
6. **Build for iOS/Android** - Follow React Native build guides

## 📄 License

MIT

---

**Created:** October 21, 2025  
**Version:** 1.0 (MVP)  
**Platform:** iOS & Android (React Native)
