# 🔌 Frontend Integration Guide - Using Backend Proxies

**Status**: ✅ Backend proxy services created
**Files Created**: 
- `src/services/geminiBackendProxy.ts` (Gemini API proxy client)
- `src/services/mapboxBackendProxy.ts` (Mapbox API proxy client)  
- `src/services/unsplashBackendProxy.ts` (Unsplash API proxy client)

---

## 📋 Integration Checklist

### 1. Update CreateTrip Form (uses Gemini)

**File**: `pocket-guide-web/src/screens/CreateTrip/CreateTrip.tsx` (or similar)

**Change from:**
```typescript
import { generateItineraryWithGemini } from "../../services/geminiItinerary";

// In component:
const itinerary = await generateItineraryWithGemini(
  destination,
  days,
  tags
);
```

**Change to:**
```typescript
import { generateItineraryWithBackend } from "../../services/geminiBackendProxy";

// In component:
const itinerary = await generateItineraryWithBackend(
  destination,
  days,
  tags
);
```

---

### 2. Update Map/Location Components (uses Mapbox)

**Files that likely use Mapbox:**
- Any component that shows location search
- Map components
- Trip detail views showing locations

**Change from:**
```typescript
import { geocodeLocation } from "../../services/mapboxGeocoding";

// In component:
const results = await geocodeLocation("Paris, France");
```

**Change to:**
```typescript
import { geocodeLocation } from "../../services/mapboxBackendProxy";

// In component:
const results = await geocodeLocation("Paris, France");
// API signature is the same - just uses backend now!
```

---

### 3. Update Photo Search Components (uses Unsplash)

**Files that likely use Unsplash:**
- Trip photo gallery
- Destination image selection
- Photo picker components

**Change from:**
```typescript
import { searchPhotos } from "../../services/photoService";

// In component:
const photos = await searchPhotos("mountains", { per_page: 12 });
```

**Change to:**
```typescript
import { searchPhotos } from "../../services/unsplashBackendProxy";

// In component:
const photos = await searchPhotos("mountains", { per_page: 12 });
// Same API signature - just uses backend now!
```

---

## 🔑 Environment Setup

### Frontend (.env.local)

```bash
# NEW: Add backend URL
VITE_BACKEND_URL=http://localhost:3000  # For development
# In production: VITE_BACKEND_URL=https://api.pocket-guide.com

# KEEP these but they're no longer used for API calls
# They can be removed in a future cleanup
VITE_GEMINI_API_KEY=xxx      # Not used by proxy
VITE_MAPBOX_API_KEY=xxx      # Not used by proxy
VITE_UNSPLASH_KEY=xxx        # Not used by proxy
```

### Backend (.env)

```bash
# Required for backend proxies to work
GEMINI_API_KEY=your_gemini_key
MAPBOX_TOKEN=your_mapbox_token
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

---

## 🧪 Testing the Proxies

### 1. Start Backend Server

```bash
cd backend
npm install  # If not done yet
npm run dev

# Should output something like:
# Server running on http://localhost:3000
# ✅ Connected to Firebase
```

### 2. Test Health Check

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"healthy"}
```

### 3. Test with Frontend

**In browser console** (when logged in):

```javascript
// Test Gemini proxy
const { generateItineraryWithBackend } = await import('./services/geminiBackendProxy.ts');
await generateItineraryWithBackend('Paris', 3, ['art', 'food']);

// Test Mapbox proxy
const { geocodeLocation } = await import('./services/mapboxBackendProxy.ts');
await geocodeLocation('Paris, France');

// Test Unsplash proxy
const { searchPhotos } = await import('./services/unsplashBackendProxy.ts');
await searchPhotos('Eiffel Tower');
```

---

## 🎯 Verification Steps

### Check API Keys are NOT in Frontend

```bash
cd pocket-guide-web
npm run build

# Verify keys are not in built files
grep -r "sk-" dist/  # Should return nothing
grep "VITE_GEMINI_API_KEY=" dist/  # Should return nothing
grep "VITE_MAPBOX_API_KEY=" dist/  # Should return nothing
```

### Check Network Requests

1. Open browser DevTools → Network tab
2. Create a trip / search for location / search for photos
3. You should see:
   - ✅ Requests to `/api/gemini`, `/api/mapbox`, `/api/unsplash` (YOUR backend)
   - ❌ NO requests to `generativelanguage.googleapis.com`
   - ❌ NO requests to `api.mapbox.com`
   - ❌ NO requests to `api.unsplash.com`

If you still see direct API calls, you haven't updated the import statements.

---

## 🔐 Security Verification

### Before Integration (UNSAFE)
```
Frontend → Has API Keys → Calls external APIs directly
Risk: Keys exposed in browser, no rate limiting, quota abuse possible
```

### After Integration (SECURE)
```
Frontend → No API Keys → Calls Backend Proxy → Backend calls external APIs
         ↓ (Firebase token)
       Backend validates token + rate limits
Risk: Mitigated - keys only on backend, access controlled
```

---

## 📚 Service Signatures (Same API, Different Backend)

### Gemini Service

```typescript
// Both have same signature:
async generateItineraryWithBackend(
  destination: string,
  days: number,
  tags: string[],
  budget?: string,
  groupType?: string,
  language?: LanguageCode
): Promise<GeneratedItinerary | null>
```

### Mapbox Service

```typescript
// Geocoding (address → coordinates)
async geocodeLocation(
  query: string,
  latitude?: number,    // Optional: for proximity
  longitude?: number,   // Optional: for proximity
  limit?: number        // How many results (1-10)
): Promise<GeocodeResult[]>

// Reverse geocoding (coordinates → address)
async reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  limit?: number
): Promise<GeocodeResult[]>
```

### Unsplash Service

```typescript
// Search photos
async searchPhotos(
  query: string,
  options?: {
    page?: number;
    per_page?: number;
    order_by?: 'relevant' | 'latest';
    color?: string;
    orientation?: 'landscape' | 'portrait' | 'squarish';
  }
): Promise<UnsplashPhoto[]>

// Get random photos
async getRandomPhotos(count?: number): Promise<UnsplashPhoto[]>

// Convenience: destination photos
async getDestinationPhotos(
  destination: string,
  count?: number
): Promise<UnsplashPhoto[]>
```

---

## 🐛 Troubleshooting

### Issue: "Not authenticated - cannot call backend"

**Solution**: Make sure user is logged in with Firebase

```typescript
// Check auth status
import { auth } from './services/firebase';
console.log(auth.currentUser);  // Should not be null
```

### Issue: "Backend server not responding"

**Solution**: Start backend server and check it's accessible

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Check it's running
curl http://localhost:3000/api/health

# If not working:
# - Check backend is running (no errors in Terminal 1)
# - Check port 3000 is not in use
# - Check VITE_BACKEND_URL is correct in frontend .env
```

### Issue: "Rate limit exceeded"

**Solution**: You've made too many requests (100 per 15 minutes per user)

**Development**: Wait 15 minutes or restart backend
**Production**: Users need to wait or upgrade tier

### Issue: Request failing with 401

**Solution**: Firebase token expired or invalid

```typescript
// Force token refresh
const newToken = await auth.currentUser?.getIdToken(true);
// Then retry request
```

---

## ✅ Integration Checklist

- [ ] Backend server running (`npm run dev` in backend/)
- [ ] VITE_BACKEND_URL set in .env.local
- [ ] Updated imports in CreateTrip component
- [ ] Updated imports in map/location components
- [ ] Updated imports in photo components
- [ ] Tested CreateTrip flow end-to-end
- [ ] Tested location search end-to-end
- [ ] Tested photo search end-to-end
- [ ] Verified no direct API calls in Network tab
- [ ] Verified API keys not in built frontend files
- [ ] Deploy backend to production
- [ ] Update VITE_BACKEND_URL to production URL

---

## 📈 Next Steps

1. **Today**: Integrate the 3 proxy services into components
2. **End-to-end testing**: Test full trip creation flow
3. **Production deployment**: Deploy backend to production
4. **Cleanup**: Remove unused API keys from frontend .env
5. **Monitoring**: Set up alerts for backend errors

---

**Status**: Integration services ready for use ✅
**Next**: Update components to use backend proxies
