# 🤖 Gemini AI Destination Recommendations

This document explains how the Gemini AI integration works for intelligent destination recommendations.

## ✨ Features

The destination recommendation system now uses **Gemini 2.0 Flash API** to generate highly personalized recommendations based on:

- **Travel Type**: Culture, adventure, relaxation, exploration, fun, romantic
- **Interests**: Specific activities and preferences (beach, mountain, history, gastronomy, nightlife, etc.)
- **Group Composition**: Solo, couple, family, friends group, or large group
- **Budget**: Ultra-economical, economical, mid-range, premium, or luxury
- **Travel Dates**: Specific dates or month preference for seasonal considerations

## 🚀 How It Works

### Process Flow

```
User fills preferences in Destination Selector
         ↓
DestinationSelector fetches Gemini recommendations
         ↓
Gemini analyzes all user context (travel type, interests, group, budget, dates)
         ↓
Gemini generates 4-5 personalized destination recommendations with scores & reasons
         ↓
Display recommendations with loading indicator
         ↓
If Gemini fails or no API key → Fallback to rule-based matching (instant)
```

### Gemini Prompt Structure

The service sends a comprehensive prompt that includes:

1. **System Prompt**: Instructs Gemini to act as a travel expert and return structured JSON
2. **User Context**: Formatted list of all preferences
3. **Expected Output**: Exact JSON format for recommendations

```json
{
  "recommendations": [
    {
      "name": "Destination Name",
      "country": "Country",
      "emoji": "🏖️",
      "score": 95,
      "reasons": [
        "Specific reason 1",
        "Specific reason 2"
      ]
    }
  ]
}
```

## ⚙️ Configuration

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key for the project
4. Copy the key

### Step 2: Configure Environment

Add to `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

### Step 3: Test

1. Start the dev server: `npm run dev`
2. Navigate to the trip creation flow
3. Fill in preferences up to the destination selector
4. Watch the AI recommendations load
5. Should show "🤖 Analisando preferências..." while loading

## 📊 Scoring Algorithm

Gemini evaluates each destination using:

1. **Interest Alignment**: Does the destination match user interests?
2. **Budget Appropriateness**: Is it within the user's budget range?
3. **Group Suitability**: Is it suitable for the group composition?
4. **Seasonal Relevance**: Is it a good season to visit?
5. **Travel Type Match**: Does it align with the travel type?

## ⚡ Performance Characteristics

| Aspect | Details |
|--------|---------|
| **Response Time** | 2-3 seconds typical (network dependent) |
| **Cost per Call** | ~$0.00004 (< $0.01 for 1000 recommendations) |
| **Availability** | If Gemini is unavailable, fallback is instant rule-based matching |
| **Latency Impact** | Async operation - doesn't block navigation |

## 🔄 Fallback Behavior

If the Gemini API is unavailable or not configured:

1. System falls back to **rule-based matching** automatically
2. Still produces 4-5 quality recommendations instantly
3. Uses the same weighting factors (type, budget, season, etc.)
4. No user-visible error - experience remains seamless

```typescript
// Hybrid approach: Try Gemini first, fallback to rule-based
const recommendations = await getHybridDestinationRecommendations(
  tripTypes,
  interests,
  groupType,
  numPeople,
  numChildren,
  budget,
  startDate,
  endDate,
  month,
  () => matchDestinations(...), // Fallback function
  language
);
```

## 🌍 Supported Languages

The Gemini prompts are available in:
- 🇧🇷 **Portuguese (pt-BR)**
- 🇺🇸 **English (en-US)**
- 🇪🇸 **Spanish (es-ES)**

The language automatically follows the user's i18n preference.

## 🛡️ Security & Privacy

### Data Sent to Gemini

✅ **Safe to share**:
- Travel type (cultura, aventura, etc.)
- Interests (beach, mountain, history, etc.)
- Group type (solo, casal, familia, etc.)
- Budget level (economico, premium, etc.)
- Travel dates (start/end dates)
- Destination names (not personal data)

❌ **Never sent**:
- User authentication info
- Personal user data
- User locations or IP
- Any sensitive information

### API Key Security

⚠️ **Important**: The API key is exposed in the browser (by Gemini's design):
- Use a restricted API key (restrict to Generative Language API only)
- Monitor API usage in Google Cloud Console
- Set quotas to prevent abuse

## 🧪 Testing

### With Gemini API

```bash
# Set a valid API key
export VITE_GEMINI_API_KEY=your_real_key

# Start dev server
npm run dev

# Navigate to trip creation → destination selector
# Should see loading spinner → recommendations appear
```

### Without Gemini API

```bash
# Don't set VITE_GEMINI_API_KEY or set it to empty

# Start dev server
npm run dev

# Navigate to trip creation → destination selector
# Should instantly show rule-based recommendations
# No error message - seamless fallback
```

### Test Different Scenarios

1. **Happy Path**: Valid API key, good connection
   - Expected: Gemini recommendations load in 2-3 seconds
   
2. **No API Key**: VITE_GEMINI_API_KEY not set
   - Expected: Instant rule-based recommendations
   
3. **Invalid API Key**: Bad/expired key
   - Expected: Error logged, fallback to rule-based
   
4. **Network Error**: Gemini unavailable
   - Expected: Error logged, fallback to rule-based

## 📝 Code Example

```typescript
// Using the service
import { getHybridDestinationRecommendations } from '../services/destinationRecommendationService';

const recommendations = await getHybridDestinationRecommendations(
  ['aventura', 'cultura'], // Trip types
  ['beach', 'history'],    // Interests
  'casal',                 // Group type
  2,                       // Number of people
  0,                       // Number of children
  'medio',                 // Budget
  '2025-12-20',           // Start date
  '2025-12-27',           // End date
  12,                      // Month
  () => matchDestinations(...), // Fallback function
  'pt-BR'                  // Language
);

// Returns array of DestinationScore objects
// Each has: name, country, emoji, score, matchPercentage, reasons
```

## 🔍 Debugging

### Enable Console Logs

The logger automatically shows Gemini interactions:

```
✅ Gemini recommendations generated: 5 destinations
📊 Using fallback rule-based matching (if Gemini unavailable)
❌ Gemini API error: 401 (wrong API key)
⚠️ VITE_GEMINI_API_KEY not configured
```

### Check Network Tab

In browser DevTools → Network:
- Look for requests to `generativelanguage.googleapis.com`
- Check response status (should be 200)
- Verify API key is being sent

### Check Logs

View system logs:
```typescript
logger.getLogs('ERROR'); // Get all error logs
logger.getLogs('INFO');  // Get all info logs
```

## 🚦 Next Steps

- [ ] Monitor Gemini API usage and costs
- [ ] Collect user feedback on recommendation quality
- [ ] Fine-tune prompts based on actual recommendations
- [ ] Add destination details API integration
- [ ] Track recommendation acceptance rates
- [ ] A/B test Gemini vs rule-based recommendations

## 📞 Support

If recommendations are not working:

1. ✅ Check that `VITE_GEMINI_API_KEY` is set in `.env.local`
2. ✅ Verify the API key is valid in Google Cloud Console
3. ✅ Check that Generative Language API is enabled
4. ✅ Look at browser console for error messages
5. ✅ Test without API key to verify fallback works

If all else fails, the app will gracefully fall back to rule-based recommendations.
