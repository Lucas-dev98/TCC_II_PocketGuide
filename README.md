# 🌍 Pocket Guide - AI-Powered Travel Itinerary Generator# 🎒 Pocket Guide - Project Structure



> **Status:** MVP 95% Complete - Ready for Vercel Deployment  ## Overview

> **Tech:** React Web (Vite) + Firebase + Gemini AI  

> **Build:** ✅ Production ready (0 TypeScript errors)**Pocket Guide v1 (MVP)** is an AI-powered travel itinerary app built with React Native and TypeScript. It allows users to create personalized travel plans in under 3 minutes, with full offline functionality.



---## 📁 Directory Structure



## 📖 Quick Links```

src/

| Document | Purpose |├── components/           # Reusable UI components

|----------|---------|│   ├── TripCard.tsx             # Displays a trip card (used in HomeScreen)

| **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** | 📊 Decision makers - Why React Web is better |│   ├── AttractionCard.tsx       # Displays an attraction/activity card

| **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** | 📈 Full technical migration report |│   └── LoadingSpinner.tsx       # Loading indicator component

| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | 🚀 Step-by-step deployment to Vercel |│

| **[PROGRESS_SESSION_3.md](./PROGRESS_SESSION_3.md)** | 📝 Build fixes and final polish |├── screens/              # Navigation screens

│   ├── LoginScreen.tsx          # Google Sign-In screen

---│   ├── OnboardingQuiz.tsx       # 3-question preference quiz

│   ├── HomeScreen.tsx           # List of user's trips

## 🚀 Launch in 3 Steps│   ├── CreateTripScreen.tsx     # Create new trip (destination + dates)

│   ├── TripDetailScreen.tsx     # Editable itinerary with drag & drop

### 1️⃣ Get Credentials│   └── MapDayScreen.tsx         # Map view of attractions for a day

- Firebase: https://console.firebase.google.com│

- Gemini API: https://ai.google.dev/├── services/             # API integration and external services

- Google Maps: https://cloud.google.com/maps-platform│   ├── firebase.ts              # Firebase Auth + Firestore setup

│   ├── gemini.ts                # Google Gemini API for itinerary generation

### 2️⃣ Add to Vercel│   └── googleMaps.ts            # Google Places + Directions APIs

```bash│

cd pocket-guide-web├── hooks/                # Custom React hooks

vercel│   └── useAuth.ts               # Authentication state and methods

# Follow prompts, add environment variables│

```├── store/                # State management (Zustand)

│   └── tripStore.ts             # Trip and attraction state management

### 3️⃣ Done! 🎉│

Your app is live at `your-project.vercel.app`├── types/                # TypeScript type definitions

│   ├── index.ts                 # Main app types (User, Trip, Attraction, etc.)

---│   └── firestore.ts             # Firestore-specific types (with Timestamps)

│

## ✨ Features├── utils/                # Helper functions

│   └── formatDate.ts            # Date formatting utilities

### User Features│

- 🔐 **Sign in with Google** - One-click authentication via Firebase└── App.tsx               # Root component with navigation setup

- 📍 **Create Trips** - 3-step wizard for trip planning```

- 🤖 **AI Itinerary** - Gemini generates day-by-day itineraries

- 🗺️ **View Details** - Trip details with itinerary breakdown## 🔧 Technology Stack

- 🌙 **Dark Mode** - Beautiful dark theme (persistent)

- 📱 **Mobile First** - Responsive design on any device| Layer | Technology |

- 💾 **Offline Support** - PWA service worker caching|-------|-----------|

| **Frontend** | React Native + TypeScript |

### Technical Features| **State Management** | Zustand (with AsyncStorage persistence) |

- ⚡ **Fast Build** - Vite (12 seconds vs 5+ minutes)| **Authentication** | Firebase Authentication + Google Sign-In |

- 🔒 **Type Safe** - 100% TypeScript (0 compilation errors)| **Backend** | Firestore (NoSQL) |

- 🧩 **Component Library** - Reusable components| **AI** | Google Gemini API |

- 🎯 **Protected Routes** - React Router v6| **Maps** | Google Maps SDK + Places API + Directions API |

- 🗄️ **Real-time DB** - Firestore sync| **Offline** | AsyncStorage + Google Maps cache |

- 🚀 **PWA Ready** - Installable app| **Navigation** | React Navigation (native-stack) |

- 📊 **Analytics Ready** - Logging configured

## 📋 Component Details

---

### Components (`src/components/`)

## 📁 Project Structure

#### **TripCard.tsx**

```- Displays trip information: destination, dates, duration, attraction count

pocket-guide-web/- Used in `HomeScreen` to list saved trips

├── src/- Tap to navigate to trip details

│   ├── screens/           # 4 main screens (1,614 lines)

│   │   ├── LoginScreen.tsx        # Google Sign-In#### **AttractionCard.tsx**

│   │   ├── HomeScreen.tsx         # Trip management- Shows attraction details: time, name, reason, tip, duration

│   │   ├── CreateTripScreen.tsx   # 3-step wizard- Has drag handle for reordering

│   │   └── TripDetailScreen.tsx   # Trip details + itinerary- Long press to edit/delete

│   ├── components/        # 6 reusable components- Blue left border to distinguish from other elements

│   │   ├── Button.tsx

│   │   ├── Input.tsx#### **LoadingSpinner.tsx**

│   │   ├── Card.tsx- Reusable loading indicator with optional message

│   │   ├── Badge.tsx- Supports `fullScreen` prop to center on entire screen

│   │   ├── LoadingSpinner.tsx- Customizable size (small/large)

│   │   └── ProtectedRoute.tsx

│   ├── contexts/         # Auth, Theme### Screens (`src/screens/`)

│   ├── store/            # Zustand + Firestore

│   ├── services/         # Firebase, Gemini, Logger#### **LoginScreen.tsx**

│   ├── types/            # TypeScript definitions- Initial app screen

│   ├── utils/            # Helpers- Google Sign-In button

│   ├── hooks/            # Custom hooks- Shows features and benefits

│   └── App.tsx           # Routing- Routes to `OnboardingQuiz` on successful login

├── dist/                 # Production build

├── .env.example         # Environment template#### **OnboardingQuiz.tsx**

├── vercel.json         # Deployment config- 3 quick questions to create user profile:

└── package.json        # Dependencies  1. Travel style (Adventure/Relax/Culture/Gastronomy)

```  2. Budget (Budget/Mid-range/Luxury)

  3. Travel companion (Solo/Partner/Family/Friends)

---- Progress bar showing question progress

- Answers saved as tags in user profile

## 🛠️ Development Commands

#### **HomeScreen.tsx**

```bash- Displays all user's trips in a list

# Start development server- Shows trip destination, dates, and number of attractions

npm run dev              # http://localhost:5173- FAB button to create new trip

- Empty state with call-to-action

# Build for production

npm run build            # Outputs to dist/#### **CreateTripScreen.tsx**

- Form to create a new trip:

# Preview production build locally  - Destination (with Google Places autocomplete)

npm run preview          # http://localhost:4173  - Start and end dates (date picker)

- "Generate Itinerary" button calls Gemini API

# Type checking- Info section explaining how it works

npm run type-check       # Check TypeScript

#### **TripDetailScreen.tsx**

# Linting- Shows itinerary for selected trip

npm run lint            # ESLint checks- Day selector to view attractions by day

- Displays attractions with time, name, reason, tip

# Testing- "Add Attraction" button to add custom activities

npm run test            # Vitest- "View on Map" button to see route

npm run test:coverage   # Coverage report

```#### **MapDayScreen.tsx**

- Map view of attractions for a specific day

---- Shows optimized route between locations

- Numbered list of attractions with times

## 📊 Project Stats- "Get Directions" button to open navigation



| Metric | Value |## 🗄️ Data Types (`src/types/`)

|--------|-------|

| **Build Time** | 12.09 seconds |### **User**

| **TypeScript Errors** | 0 |```typescript

| **CSS Size** | 30.39 kB (gzip: 5.99 kB) |{

| **JS Size** | 732 kB (gzip: 192 kB) |  uid: string;

| **PWA Precache** | 745.65 KiB |  name: string;

| **Modules Transformed** | 1,425 |  email: string;

| **Component Count** | 6 + 4 screens |  photoURL?: string;

| **Lines of Code** | ~1,900 |  tags: string[];  // ["gastronomia", "médio", "casal"]

| **NPM Packages** | 1,179 |  createdAt: Date;

| **Development Time** | 9 hours |}

```

---

### **Trip**

## 🎯 What's New vs React Native```typescript

{

### ✅ Improvements  id: string;

- **25x faster builds** (12s vs 5+ min)  userId: string;

- **Web-native** - Full browser APIs  destination: string;

- **Instant deployment** - No App Store approval  startDate: Date;

- **Better DX** - Vite hot reload (<100ms)  endDate: Date;

- **Simpler** - No cross-platform complexity  attractions: Attraction[];

- **Same features** - All functionality working  createdAt: Date;

  updatedAt: Date;

---  isSyncedToFirestore: boolean;  // for offline support

}

## 🔒 Environment Variables```



Copy `.env.example` to `.env.local` and fill in:### **Attraction**

```typescript

```env{

# Firebase  id: string;

VITE_FIREBASE_PROJECT_ID=your_project_id  day: number;

VITE_FIREBASE_API_KEY=your_api_key  time: string;  // "09:00"

VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  name: string;

VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com  duration: number;  // in minutes

VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com  reason: string;

VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id  tip?: string;

VITE_FIREBASE_APP_ID=your_app_id  location: {

    lat: number;

# APIs    lng: number;

VITE_GEMINI_API_KEY=your_gemini_key    address?: string;

VITE_GOOGLE_MAPS_API_KEY=your_maps_key  };

```  order?: number;  // for drag & drop

}

**Never commit `.env.local` to Git!**```



---## 🔄 State Management (Zustand)



## 🚀 DeploymentThe `tripStore.ts` uses Zustand for centralized state with AsyncStorage persistence:



### Option 1: Vercel CLI (Recommended)**State:**

```bash- `trips[]` - All user trips

npm i -g vercel- `currentTrip` - Currently viewed trip

vercel- `loading` - Loading state

```- `error` - Error messages



### Option 2: Vercel Dashboard**Actions:**

1. Visit https://vercel.com- `setTrips()` / `addTrip()` / `updateTrip()` / `deleteTrip()`

2. Import GitHub repository- `addAttraction()` / `updateAttraction()` / `deleteAttraction()` / `reorderAttractions()`

3. Select `pocket-guide-web` as root- `markForSync()` / `markSynced()` - Offline sync management

4. Add environment variables- `getSyncPendingTrips()` - Get trips to sync

5. Click Deploy

## 🔐 Authentication Flow

### Option 3: GitHub Actions

Push to main branch - auto-deploys via GitHub Actions (if configured)1. User opens app → `LoginScreen`

2. Clicks "Sign in with Google" → Firebase Auth

---3. Successful login → `OnboardingQuiz`

4. Completes quiz → answers saved as tags

## 📞 Support5. Redirects to `HomeScreen`



### Common Issues## 🤖 AI Integration (Gemini)



**Firebase Auth not working?**The app uses Google Gemini API to generate personalized itineraries:

- Check domain in Firebase Console → Authentication

- Verify env variables exactly match Firebase project**Input:**

- Destination

**Build fails?**- Travel dates

- Ensure all env variables are set- User preferences (tags)

- Check Node.js version (v18+ recommended)

- Run `npm ci` to clean install**Output:** JSON array of attractions with:

- Day number

**PWA not installing?**- Time

- Service Worker requires HTTPS (Vercel provides this)- Name

- Check DevTools → Application → Manifest- Duration

- Reason (why it matches preferences)

---- Tip

- Coordinates (lat/lng)

## 🎓 Tech Stack

## 🗺️ Google Maps Integration

```

Frontend:1. **Places API** - Destination autocomplete

  • React 19 (latest)2. **Directions API** - Optimized routes between attractions

  • TypeScript (strict mode)3. **Map SDK** - Display attractions and routes

  • React Router v6 (routing)4. **Cache** - Offline map tiles

  • Tailwind CSS (mobile-first)

  • Vite (build tool)## 📱 Offline Support



State & Data:- All data cached in `AsyncStorage`

  • Zustand (state management)- Edits saved locally

  • Firebase/Firestore (database)- Maps tiles cached for offline viewing

  • React Context (theme, auth)- On reconnect: `markForSync()` → sync pending trips to Firestore



Backend/APIs:## 🚀 User Flow (3 Minutes)

  • Firebase Auth (authentication)

  • Firestore (real-time database)1. **Login (10s)** - Sign in with Google

  • Gemini API (AI itineraries)2. **Quiz (30s)** - Answer 3 preference questions

  • Google Maps (location display)3. **Create Trip (30s)** - Select destination and dates

4. **Generate (30s)** - AI creates itinerary

Deployment:5. **Edit (30s)** - Drag/reorder, add/remove attractions

  • Vercel (hosting)6. **View Map (10s)** - See route on map

  • PWA (installable app)7. **Go Offline (10s)** - Turn off Wi-Fi, still works

  • Service Worker (offline support)

```**Total: ~3 minutes ⏱️**



---## 📦 Dependencies



## 🎯 Next StepsInstall with:

```bash

1. **[Read EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - Understand the migrationnpm install

2. **[Read DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Vercel# or

3. **[Read MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - Full technical detailsyarn install

4. **Deploy and launch!** 🚀```



---### Required packages:

```json

## 📄 License{

  "react-native": "^0.73.0",

This project is part of TCC II (Trabalho de Conclusão de Curso).  "typescript": "^5.0.0",

  "@react-navigation/native": "^6.1.0",

---  "@react-navigation/native-stack": "^6.9.0",

  "zustand": "^4.4.0",

## 👨‍💻 Author  "firebase": "^10.0.0",

  "@react-native-async-storage/async-storage": "^1.21.0",

**Lucas Bastos**    "@react-native-maps/maps": "^1.7.0",

Repository: github.com/Lucas-dev98/TCC_II_PocketGuide  "react-native-draggable-flatlist": "^4.0.0"

}

---```



<div align="center">## ⚙️ Environment Variables



### ✨ React Native → React Web Migration ✨Create `.env` file:

```

**9 hours · 4 screens · 0 errors · Production ready**REACT_APP_FIREBASE_API_KEY=xxx

REACT_APP_FIREBASE_AUTH_DOMAIN=xxx

[🚀 Deploy Now](./DEPLOYMENT_GUIDE.md)REACT_APP_FIREBASE_PROJECT_ID=xxx

REACT_APP_FIREBASE_STORAGE_BUCKET=xxx

</div>REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx

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
