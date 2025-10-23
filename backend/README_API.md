# 🔐 Pocket Guide Backend API

> Backend seguro para gerenciar APIs sensíveis (Gemini, GraphHopper)

## 🚀 Iniciar Servidor

```bash
# Development
npm run dev

# Production
npm run start

# Build
npm run build
```

Servidor roda em `http://localhost:3000`

---

## 📚 Endpoints

### 1. POST `/api/generate-itinerary`

Gera um itinerário usando Gemini AI

**Request:**
```json
{
  "destination": "Rio de Janeiro",
  "days": 5,
  "tags": ["adventure", "beach", "food"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "title": "5 Days in Rio de Janeiro",
    "description": "Adventure and beach-focused itinerary",
    "days": [
      {
        "day": 1,
        "attractions": [
          {
            "name": "Copacabana Beach",
            "description": "Famous beach in Rio",
            "duration": "2 hours",
            "lat": -22.9749,
            "lng": -43.1826,
            "category": "nature"
          }
        ]
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "error": "Validation failed",
  "details": ["destination: String must contain at least 2 character(s)"]
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `429` - Rate limited
- `500` - Server error

---

### 2. POST `/api/get-route`

Obter rota entre dois pontos usando GraphHopper

**Request:**
```json
{
  "startLat": -22.9068,
  "startLng": -43.1729,
  "endLat": -22.9451,
  "endLng": -43.2043,
  "vehicle": "car"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "distance": 12500,
    "time": 1200000,
    "points": [
      [-22.9068, -43.1729],
      [-22.9200, -43.1800],
      [-22.9451, -43.2043]
    ],
    "bbox": [-43.2043, -22.9451, -43.1729, -22.9068]
  }
}
```

**Vehicles Supported:**
- `car` (default)
- `bike`
- `foot`

---

### 3. GET `/api/health`

Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T14:30:45.123Z"
}
```

---

## 🔒 Security Features

### Rate Limiting
- **Window**: 15 minutes (configurável via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests**: 100 per window (configurável via `RATE_LIMIT_MAX_REQUESTS`)
- **Response**: `429 Too Many Requests`

```json
{
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

### CORS
Apenas origins configurados em `CORS_ORIGIN` podem acessar:
```
http://localhost:8082
http://localhost:19006
```

### Input Validation
Todas as requisições são validadas com Zod:
- ✅ Destination: 2-100 caracteres
- ✅ Days: 1-365
- ✅ Tags: 1-5 items
- ✅ Coordinates: lat -90 a 90, lng -180 a 180

---

## 🔑 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000

# APIs (SEGURAS - nunca expostas)
GEMINI_API_KEY=your_key_here
GRAPHHOPPER_API_KEY=your_key_here

# CORS
CORS_ORIGIN=http://localhost:8082,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📊 Request/Response Flow

```
Frontend (React Native)
   ↓
POST /api/generate-itinerary
   ↓
Backend (Express + TypeScript)
   ├─ Validate input (Zod)
   ├─ Rate limit check
   ├─ Call Gemini API (secure)
   └─ Return response
   ↓
Frontend receives itinerary
```

---

## 🧪 Teste com cURL

```bash
# Gerar itinerário
curl -X POST http://localhost:3000/api/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris",
    "days": 3,
    "tags": ["culture", "food"]
  }'

# Obter rota
curl -X POST http://localhost:3000/api/get-route \
  -H "Content-Type: application/json" \
  -d '{
    "startLat": 48.8566,
    "startLng": 2.3522,
    "endLat": 48.8645,
    "endLng": 2.3485,
    "vehicle": "car"
  }'

# Health check
curl http://localhost:3000/api/health
```

---

## 🐛 Troubleshooting

### "Rate limited"
- Aguarde 15 minutos
- Ou aumentar `RATE_LIMIT_MAX_REQUESTS`

### "Validation failed"
- Verificar formato JSON
- Verificar types do request

### "Internal server error"
- Verificar .env (API keys)
- Ver logs no console
- Verificar CORS origin

---

## 📝 Logs

Backend usa logs estruturados:
```
[2025-10-22T14:30:45.123Z] POST /api/generate-itinerary
[2025-10-22T14:30:46.234Z] Generating itinerary for: Paris, 3 days, tags: culture,food
[2025-10-22T14:30:50.456Z] Success
```

---

**Status**: ✅ Production Ready  
**Last Update**: 22 de outubro de 2025
