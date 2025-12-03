# 🗺️ Route Navigation Feature - Documentation

## Overview

The Route Navigation feature enables users to calculate and visualize optimized routes between attractions in their daily itinerary using the Mapbox Directions API v5.

## Architecture

### Components

#### 1. **DirectionsService** (`src/services/directionsService.ts`)
- Encapsulates all Mapbox Directions API v5 calls
- Supports 4 routing profiles:
  - `driving` - Fastest driving route
  - `driving-traffic` - Driving with live traffic consideration
  - `walking` - Pedestrian-optimized routes
  - `cycling` - Bicycle-friendly routes

**Key Methods:**
- `getDirections(coordinates, profile, options)` - Get route between 2-25 waypoints
- `getQuickRoute(origin, destination, profile)` - Simplified 2-point route
- `formatDistance(route)` - Convert meters to km
- `formatDuration(route)` - Format seconds to readable time
- `extractCoordinatesFromGeometry(geometry)` - Parse GeoJSON LineString
- `validateCoordinates(coords)` - Validate lat/lng bounds

**Response Format:**
```typescript
{
  code: "Ok",
  routes: [{
    distance: 1234.5,  // meters
    duration: 567.8,   // seconds
    geometry: GeoJSON.LineString,
    legs: [{
      distance: number,
      duration: number,
      steps: [{
        distance: number,
        duration: number,
        name: string,
        maneuver: { type, modifier, instruction }
      }]
    }]
  }],
  waypoints: []
}
```

#### 2. **NavigateButton** (`src/components/NavigateButton.tsx`)
- Reusable button component for triggering navigation
- Features:
  - Disabled state for invalid coordinates
  - Loading spinner during calculation
  - Icon + label with dark mode support
  - Full i18n translations (PT, EN, ES)
  - Aria labels for accessibility

**Props:**
```typescript
{
  attraction: Attraction,
  onNavigate: (attraction) => void,
  isLoading?: boolean,
  disabled?: boolean
}
```

#### 3. **RouteSummary** (`src/components/RouteSummary.tsx`)
- Displays calculated route details
- Features:
  - Distance (km) and duration display
  - Collapsible turn-by-turn instructions
  - Origin and destination display
  - Per-leg breakdown
  - Close button to clear
  - Full dark mode styling

**Props:**
```typescript
{
  route: DirectionRoute | null,
  origin?: string,
  destination?: string,
  isLoading?: boolean,
  onClose: () => void
}
```

#### 4. **MapboxMap** (`src/components/MapboxMap.tsx` - Enhanced)
- Added route rendering capability
- Features:
  - Displays route as indigo-colored LineString
  - Green marker for origin (departure)
  - Red marker for destination (arrival)
  - Automatic fit-bounds to route
  - Cleanup on unmount

**New Props:**
```typescript
{
  route?: DirectionRoute | null,
  routeOrigin?: Location | null,
  routeDestination?: Location | null
}
```

#### 5. **DayTimeline** (`src/components/DayTimeline.tsx` - Enhanced)
- Added NavigateButton to each attraction card
- Callback handling for navigation trigger
- Route loading state indication
- Automatic RouteSummary visibility management

### State Management

#### **RouteStore** (`src/store/routeStore.ts`)
Zustand store managing navigation state:

```typescript
{
  currentRoute: DirectionRoute | null,
  currentOrigin: Attraction | null,
  currentDestination: Attraction | null,
  routingProfile: 'driving' | 'walking' | 'cycling' | 'driving-traffic',
  isLoadingRoute: boolean,
  routeError: string | null,
  isRouteSummaryOpen: boolean,
  
  // Methods
  setCurrentRoute(route),
  setOriginAndDestination(origin, dest),
  setRoutingProfile(profile),
  setLoadingRoute(loading),
  setRouteError(error),
  setRouteSummaryOpen(open),
  clearRoute()
}
```

### Hooks

#### **useNavigation** (`src/hooks/useNavigation.ts`)
High-level hook for route calculation and management:

```typescript
const {
  calculateRoute: (origin, dest, profile?) => Promise<void>,
  clearRoute: () => void,
  currentRoute: DirectionRoute | null,
  isLoadingRoute: boolean,
  routeError: string | null,
  currentOrigin: Attraction | null,
  currentDestination: Attraction | null,
  routingProfile: string
} = useNavigation();
```

**Features:**
- Validates origin/destination coordinates
- Calls DirectionsService
- Updates route store
- Auto-opens RouteSummary on success
- Error handling and logging
- Supports all routing profiles

## Integration

### DayDetailScreen Workflow

1. **Setup:**
   ```tsx
   const { calculateRoute, clearRoute, currentRoute, currentOrigin, currentDestination, isLoadingRoute } = useNavigation();
   ```

2. **DayTimeline Props:**
   ```tsx
   <DayTimeline
     attractions={attractions}
     onNavigate={(destination) => {
       const originAttraction = attractions[currentIndex - 1];
       if (originAttraction) {
         calculateRoute(originAttraction, destination, 'driving');
       }
     }}
   />
   ```

3. **RouteSummary Display:**
   ```tsx
   {currentRoute && currentOrigin && currentDestination && (
     <RouteSummary
       route={currentRoute}
       origin={currentOrigin.name}
       destination={currentDestination.name}
       isLoading={isLoadingRoute}
       onClose={clearRoute}
     />
   )}
   ```

4. **MapboxMap Rendering:**
   ```tsx
   <MapboxMap
     attractions={attractions}
     route={currentRoute}
     routeOrigin={currentOrigin?.location}
     routeDestination={currentDestination?.location}
   />
   ```

## User Flow

```
1. User on DayDetailScreen viewing attractions
2. Clicks "Navegar" (Navigate) button on an attraction
3. App calculates route from previous attraction
4. Route displays on map with:
   - Green marker at origin
   - Red marker at destination
   - Indigo line for route geometry
   - Auto-fit bounds
5. RouteSummary shows above map with:
   - Total distance (km)
   - Total duration (time)
   - Collapsible turn-by-turn instructions
6. User can:
   - Close and recalculate with different attractions
   - View detailed instructions
   - Navigate multiple attractions in sequence

```

## Internationalization

### Supported Languages
- **Portuguese (PT-BR)**
- **English (US)**
- **Spanish (ES)**

### Translation Keys
```json
"navigation": {
  "navigate": "Navegar",
  "route": "Rota",
  "distance": "Distância",
  "duration": "Duração",
  "steps": "Instruções de Navegação",
  "departure": "Saída",
  "arrival": "Chegada",
  "noOriginPoint": "Nenhum ponto de partida disponível"
}
```

## Error Handling

### Common Errors

1. **Invalid Coordinates**
   - NavigateButton disabled automatically
   - Error message in RouteSummary if calculated

2. **No Departure Point**
   - Toast notification: "Nenhum ponto de partida disponível"
   - Only for first attraction (no previous one)

3. **Mapbox API Errors**
   - Network timeouts: 30s timeout
   - 401: Invalid credentials
   - 404: Location not found
   - 503: Service unavailable

4. **Route Calculation Failures**
   - Error logged to console
   - User notified via routeStore.routeError
   - Route display disabled until retry

## Testing Checklist

- [ ] Navigate between two attractions
  - [ ] Verify route displays on map
  - [ ] Check distance and duration accuracy
- [ ] Verify loading states
  - [ ] Button shows spinner during calculation
  - [ ] RouteSummary shows loading indicator
- [ ] Test error scenarios
  - [ ] Invalid coordinates disable button
  - [ ] Missing origin shows error toast
- [ ] Dark mode styling
  - [ ] RouteSummary displays correctly
  - [ ] Map route colors visible in dark mode
  - [ ] NavigateButton styling correct
- [ ] i18n translations
  - [ ] PT-BR strings display correctly
  - [ ] EN-US strings display correctly
  - [ ] ES-ES strings display correctly
- [ ] Responsive design
  - [ ] Mobile screen fit-bounds working
  - [ ] Card layout responsive

## Performance Considerations

1. **API Rate Limits**
   - Mapbox Directions: 300 requests/minute
   - Per-user limit: ~5 routes per minute

2. **Route Geometry**
   - GeoJSON format optimized for map rendering
   - Linestring feature type for efficient rendering

3. **State Management**
   - Zustand store minimizes re-renders
   - Components only update when relevant state changes

## Future Enhancements

1. **Alternative Routes**
   - Display multiple route options
   - User selection preference

2. **Traffic Consideration**
   - Use `driving-traffic` profile for real-time traffic
   - ETA calculation with current conditions

3. **Route Optimization**
   - Calculate optimal order for all attractions
   - Traveling Salesman Problem solver

4. **Favorites & Export**
   - Save favorite routes
   - Export as PDF with turn-by-turn instructions

5. **Real-time Navigation**
   - Integration with device GPS
   - Turn-by-turn voice guidance

## API Reference

### Mapbox Directions API v5

**Endpoint:**
```
GET https://api.mapbox.com/directions/v5/mapbox/{profile}/{coordinates}?access_token={token}
```

**Parameters:**
- `profile`: driving | driving-traffic | walking | cycling
- `coordinates`: lng,lat;lng,lat (semicolon-separated)
- `access_token`: VITE_MAPBOX_API_KEY from environment

**Query Parameters:**
- `overview`: full | simplified | false
- `geometries`: geojson | polyline | polyline6
- `steps`: true | false (for turn-by-turn instructions)
- `language`: pt | en | es | etc.
- `bannnerInstructions`: true | false
- `voiceInstructions`: true | false

**Response:**
```json
{
  "code": "Ok",
  "routes": [...],
  "waypoints": [...]
}
```

## Files Modified/Created

### Created
- `src/services/directionsService.ts` (150 lines)
- `src/components/NavigateButton.tsx` (60 lines)
- `src/components/RouteSummary.tsx` (150 lines)
- `src/store/routeStore.ts` (80 lines)
- `src/hooks/useNavigation.ts` (120 lines)

### Modified
- `src/components/DayTimeline.tsx` (+25 lines)
- `src/components/MapboxMap.tsx` (+90 lines)
- `src/screens/DayDetailScreen.tsx` (+40 lines)
- `src/locales/pt-BR.json` (+2 keys)
- `src/locales/en-US.json` (+2 keys)
- `src/locales/es-ES.json` (+2 keys)

## Git Commits

1. **c2fad69** - 🗺️ Add Mapbox Directions API Integration
   - Service, components, store, i18n keys

2. **5d9cbc1** - 🧭 Integrate Navigation Components with UI & Store
   - DayTimeline, MapboxMap, useNavigation hook integration

3. **1eff9f0** - 🗺️ Integrate Route Navigation into DayDetailScreen
   - Final screen integration with RouteSummary display
