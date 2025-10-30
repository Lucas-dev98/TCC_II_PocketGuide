# 📝 NEXT STEPS - PHASE 1 CONTINUATION

**Current Status**: ✅ 50% Complete (5/10 tasks)
**Target**: 100% Phase 1 by November 5, 2025
**Remaining Effort**: ~14 hours (2-3 days)

---

## 🚀 Immediate Next Tasks

### Priority 1: Implement Mapbox API Proxy (4 hours)

**File**: `backend/src/routes/mapbox.ts`
**Current State**: Stub (12 lines)
**Required**: Full implementation

**Implementation Checklist:**

```typescript
// 1. Create Mapbox route handler
POST /api/mapbox/search

// 2. Request schema (Zod validation)
{
  query: string (1-100 chars)
  longitude?: number
  latitude?: number
  proximity?: "ipaddress" | boolean
  limit?: number (1-5, default: 1)
}

// 3. Response structure
{
  features: [
    {
      id: string
      type: 'Feature'
      geometry: {
        type: 'Point'
        coordinates: [longitude, latitude]
      }
      properties: {
        name: string
        address: string
        country: string
        context: { ... }
      }
    }
  ]
}

// 4. Error handling
- 400: Invalid input (Zod validation failed)
- 401: Unauthorized (Firebase token invalid)
- 429: Rate limited
- 503: Mapbox API error

// 5. Features
- Zod schema validation (matching backend validators)
- Mapbox API integration (using axios)
- Error handling with ApiError class
- Logging with Pino
- Rate limiting applied (via middleware)
```

**Example Implementation Structure:**
```typescript
// backend/src/routes/mapbox.ts

import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const MapboxSearchSchema = z.object({
  query: z.string().min(1).max(100),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  limit: z.number().min(1).max(5).default(1),
});

router.post('/search', async (req, res, next) => {
  try {
    const parsed = MapboxSearchSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input');
    }

    const { query, longitude, latitude, limit } = parsed.data;
    
    // Build Mapbox API request
    const params = new URLSearchParams({
      access_token: process.env.MAPBOX_TOKEN!,
      limit: limit.toString(),
    });

    if (longitude && latitude) {
      params.append('proximity', `${longitude},${latitude}`);
    }

    // Call Mapbox API
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params}`,
      { timeout: 30000 }
    );

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/mapbox/search \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Paris, France"}'
```

---

### Priority 2: Implement Unsplash API Proxy (4 hours)

**File**: `backend/src/routes/unsplash.ts`
**Current State**: Stub (12 lines)
**Required**: Full implementation

**Implementation Checklist:**

```typescript
// 1. Create Unsplash route handler
GET /api/unsplash/search

// 2. Query parameters (Zod validation)
{
  query: string (required, 1-100 chars)
  page?: number (1+, default: 1)
  per_page?: number (1-50, default: 12)
  order_by?: 'relevant' | 'latest' (default: 'relevant')
}

// 3. Response structure
{
  results: [
    {
      id: string
      urls: {
        thumb: string
        small: string
        regular: string
        full: string
      }
      description: string
      alt_description: string
      user: {
        name: string
        links: { html: string }
      }
    }
  ]
  total: number
  total_pages: number
}

// 4. Error handling
- 400: Invalid input (Zod validation failed)
- 401: Unauthorized (Firebase token invalid)
- 429: Rate limited
- 503: Unsplash API error

// 5. Features
- Zod schema validation
- Unsplash API integration
- Error handling with ApiError class
- Logging with Pino
- Rate limiting applied
```

**Example Implementation Structure:**
```typescript
// backend/src/routes/unsplash.ts

import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const UnsplashSearchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().min(1).default(1),
  per_page: z.number().min(1).max(50).default(12),
  order_by: z.enum(['relevant', 'latest']).default('relevant'),
});

router.get('/search', async (req, res, next) => {
  try {
    const parsed = UnsplashSearchSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, 'Invalid input');
    }

    const { query, page, per_page, order_by } = parsed.data;

    // Call Unsplash API
    const response = await axios.get(
      'https://api.unsplash.com/search/photos',
      {
        params: {
          query,
          page,
          per_page,
          order_by,
        },
        headers: {
          'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
        },
        timeout: 30000,
      }
    );

    res.json(response.data);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Testing:**
```bash
curl -X GET 'http://localhost:3000/api/unsplash/search?query=paris' \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

### Priority 3: Frontend Integration (6 hours)

**Files to Update:**
1. `pocket-guide-web/src/services/geminiService.ts`
2. `pocket-guide-web/src/services/mapboxService.ts`
3. `pocket-guide-web/src/services/unsplashService.ts`

**Changes Required:**

#### 3.1 Update geminiService

```typescript
// BEFORE: Direct Gemini API call
const response = await fetch('https://generativelanguage.googleapis.com/...', {
  headers: { 'x-goog-api-key': VITE_GEMINI_API_KEY }
});

// AFTER: Backend proxy call
const response = await fetch('/api/gemini/generate-itinerary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    destination,
    days,
    interests,
    language
  })
});
```

#### 3.2 Update mapboxService

```typescript
// BEFORE: Direct Mapbox API call
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${VITE_MAPBOX_API_KEY}`
);

// AFTER: Backend proxy call
const response = await fetch('/api/mapbox/search', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query, limit: 1 })
});
```

#### 3.3 Update unsplashService

```typescript
// BEFORE: Direct Unsplash API call
const response = await fetch(
  `https://api.unsplash.com/search/photos?query=${query}&per_page=${limit}`,
  { headers: { 'Authorization': `Client-ID ${VITE_UNSPLASH_KEY}` } }
);

// AFTER: Backend proxy call
const response = await fetch(
  `/api/unsplash/search?query=${query}&per_page=${limit}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

**Environment Variables:**

```bash
# REMOVE from pocket-guide-web/.env.local
VITE_GEMINI_API_KEY=xxx     # ❌ No longer needed
VITE_MAPBOX_API_KEY=xxx     # ❌ No longer needed
VITE_UNSPLASH_KEY=xxx       # ❌ No longer needed

# ADD (or update if exists)
VITE_BACKEND_URL=http://localhost:3000  # For development
# In production: VITE_BACKEND_URL=https://api.pocket-guide.com
```

**UPDATE backend/.env with:**

```bash
# Backend configuration
PORT=3000
NODE_ENV=development

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# API Keys (protected in backend)
GEMINI_API_KEY=xxx
MAPBOX_TOKEN=xxx
UNSPLASH_ACCESS_KEY=xxx

# Optional
REDIS_URL=redis://localhost:6379  # For production rate limiting
LOG_LEVEL=debug  # For development
```

---

## 📋 Testing Checklist

### Backend Testing

- [ ] Start backend server: `cd backend && npm install && npm run dev`
- [ ] Test health check: `curl http://localhost:3000/api/health`
- [ ] Test Gemini proxy (with Firebase token)
- [ ] Test Mapbox proxy (with Firebase token)
- [ ] Test Unsplash proxy (with Firebase token)
- [ ] Test rate limiting (send 101+ requests, expect 429)
- [ ] Test authentication (without token, expect 401)
- [ ] Check logs for errors/warnings

### Frontend Testing

- [ ] Update services to use `/api/*` endpoints
- [ ] Update environment variables
- [ ] Test CreateTrip form (uses Gemini)
- [ ] Test location search (uses Mapbox)
- [ ] Test photo search (uses Unsplash)
- [ ] Verify no direct API calls in DevTools Network tab
- [ ] Check that API keys are NOT exposed in frontend

### End-to-End Testing

- [ ] Create a test trip with all features
- [ ] Verify destination search works
- [ ] Verify photo search works
- [ ] Verify itinerary generation works
- [ ] Check no CORS errors
- [ ] Verify rate limiting works
- [ ] Check activity log in Firestore

---

## 🔍 Verification Commands

### 1. Check Backend is Running
```bash
curl -v http://localhost:3000/api/health
# Expected: 200 OK with {"status": "healthy"}
```

### 2. Check API Keys NOT in Frontend Bundle
```bash
cd pocket-guide-web
npm run build
grep -r "VITE_GEMINI_API_KEY" dist/
# Expected: No matches (key should not appear)
```

### 3. Verify Backend Proxies Work
```bash
# Get Firebase token first
TOKEN=$(firebase auth:export --format=json | jq -r '.users[0].customClaims.token')

# Test Gemini proxy
curl -X POST http://localhost:3000/api/gemini/generate-itinerary \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination": "Paris", "days": 3, "interests": ["art", "food"], "language": "en"}'

# Test Mapbox proxy
curl -X POST http://localhost:3000/api/mapbox/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "Eiffel Tower"}'

# Test Unsplash proxy
curl http://localhost:3000/api/unsplash/search?query=paris \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📅 Timeline

**Today**: 
- [ ] Complete Mapbox proxy (4 hours)
- [ ] Complete Unsplash proxy (4 hours)

**Tomorrow**:
- [ ] Frontend integration (6 hours)
- [ ] End-to-end testing (2 hours)
- [ ] Deploy to staging

**This Week**:
- [ ] Phase 1 100% complete
- [ ] Begin Phase 2 (Testing setup)

---

## 🎯 Phase 1 Completion Criteria

✅ Backend API proxy infrastructure
✅ Security headers configuration
✅ Input validation schemas
✅ Firebase security rules
✅ Gemini proxy implementation
- [ ] Mapbox proxy implementation
- [ ] Unsplash proxy implementation
- [ ] Frontend integration complete
- [ ] End-to-end testing passed
- [ ] No API keys exposed in frontend

**Phase 1 DONE when**: All 10 items are checked ✅

---

## 🚀 Ready to Continue?

**Start with**: `npm install && npm run dev` in the backend directory

All files are ready. Just implement the proxy endpoints following the patterns already established in `backend/src/routes/gemini.ts`.

---

**Good luck! 🎉**
