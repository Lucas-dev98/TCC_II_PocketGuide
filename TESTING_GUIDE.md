# 🧪 Testing & Deployment Guide - Opção A Smart Dates

## Quick Start Testing

### 1. Local Development Testing (No API Key)

**What works without Gemini API:**
- ✅ All UI navigation
- ✅ All validation
- ✅ Fallback suggestions appear
- ✅ Complete flow works

**Steps:**
```bash
cd pocket-guide-web

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# In another terminal, run tests
npm run test -- --run
```

**Expected Results:**
```
✓ npm run dev starts on http://localhost:5173
✓ All 247 tests pass
✓ No TypeScript errors
✓ App loads and navigation works
```

**Test Flow (Without API):**
1. Login to app
2. Click "Create Trip"
3. Select trip type + interests → Next
4. Select destination (e.g., "Paris") → Next
5. ⚠️ See Step 2.5: "Analisando melhor época..."
6. 💡 Fallback suggestions appear (3 default dates)
7. Accept one → dates pre-fill in Step 3
8. Complete remaining steps normally
9. ✅ Trip created successfully!

---

### 2. Testing with Gemini API Key

**Setup:**

Create `.env.local` file in `pocket-guide-web/`:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Get API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy and paste into `.env.local`
4. Save file

**Start app:**
```bash
npm run dev
```

**Expected Results:**
```
✅ Step 2.5 loads with actual Gemini suggestions
✅ 3 real date recommendations appear
✅ Each with climate, crowds, budget, events details
✅ Accept/reject buttons work
✅ No errors in browser console
```

**Test Flow (With API):**

1. **Login & Create Trip**
   ```
   Path: Home → Create Trip
   Expected: Step 1 loads
   ```

2. **Select Trip Type + Interests**
   ```
   Select: solo + natureza + aventura
   Click: Next
   Expected: Step 2 loads (Destination selector)
   ```

3. **Select Destination**
   ```
   Search: "Patagonia"
   Select: "Patagonia, Argentina"
   Click: Next
   Expected: Step 2.5 loads with spinner
   ```

4. **Watch AI Process**
   ```
   Status: "Analisando melhor época..."
   Spinner: Yellow animated sparkles
   Time: ~3-5 seconds
   Expected: 3 suggestions appear with scores
   ```

5. **Review Suggestions**
   ```
   Suggestion 1: 🌞 "Melhor Clima" (Spring: Nov-Dec)
   Suggestion 2: ✨ "Menos Turistas" (Autumn: Mar-Apr)
   Suggestion 3: 🎭 "Aventura Intensa" (Summer: Dec-Jan)
   
   Click cards to expand:
   - Climate details
   - Crowd levels
   - Budget range
   - Events/activities
   ```

6. **Accept Suggestion**
   ```
   Click: "Escolher esta data" on Suggestion 1
   Expected: 
     - Dates auto-fill
     - Step 3 loads
     - startDate = "2024-11-15"
     - endDate = "2024-12-15"
   ```

7. **Complete Trip Creation**
   ```
   Step 3: Confirm/edit dates and budget
   Step 4: Select group type
   Step 5: Review trip
   Step 6: Success!
   ```

---

## Test Scenarios

### Scenario 1: Happy Path (Accept AI Suggestion)
```
✅ User accepts first AI suggestion
Expected result: Trip created with AI-recommended dates
Timeline: 4-5 minutes total
```

**Test Steps:**
```
1. Create trip
2. Select type + interests
3. Select destination
4. Accept first suggestion
5. Fill remaining required fields
6. Confirm creation
```

**Validation:**
- Dates match suggestion
- Budget matches user selection
- Trip appears in home feed
- Itinerary generated

---

### Scenario 2: Reject AI Suggestion (Manual Selection)
```
❌ User rejects AI suggestion and selects manually
Expected result: Trip created with user-selected dates
Timeline: 5-6 minutes total
```

**Test Steps:**
```
1. Create trip
2. Select type + interests
3. Select destination
4. Click "Prefiro escolher manualmente"
5. Manually select dates
6. Complete remaining steps
```

**Validation:**
- Manual dates used (not AI suggested)
- Dates appear in trip details
- No errors during manual selection

---

### Scenario 3: API Failure (Fallback Handling)
```
⚠️ Simulate Gemini API failure
Expected result: Fallback suggestions shown instead
Timeline: Same as success
```

**Test Methods:**

**Method A: Network Simulation**
```
1. Open DevTools (F12)
2. Network tab
3. Throttle to "offline"
4. Create trip through Step 2.5
5. Expected: Fallback suggestions appear
```

**Method B: Invalid API Key**
```
1. Set VITE_GEMINI_API_KEY=invalid_key_xyz
2. Create trip
3. Expected: Fallback suggestions after ~5sec timeout
```

**Method C: No API Key**
```
1. Remove VITE_GEMINI_API_KEY from .env
2. Create trip
3. Expected: Fallback suggestions immediately
```

---

### Scenario 4: Multi-Language Testing

**Portuguese (pt-BR):**
```
Expected:
- UI in Portuguese
- AI prompts in Portuguese
- Suggestions with Portuguese labels
- Month names in Portuguese
```

**English (en-US):**
```
Expected:
- UI in English
- AI prompts in English
- Suggestions with English labels
```

**Spanish (es-ES):**
```
Expected:
- UI in Spanish
- AI prompts in Spanish
- Suggestions with Spanish labels
```

**Test:**
```
1. Settings → Language → Change
2. Create new trip
3. Verify all text translated
4. Verify AI suggestions translated
```

---

### Scenario 5: Different Destinations

**Test with various destinations:**

```
Destination 1: Paris (Urban/Culture)
Expected: Suggestions focus on:
  - Museum season
  - Weather (spring/fall)
  - Crowds (avoid summer)

Destination 2: Machu Picchu (Mountain/Nature)
Expected: Suggestions focus on:
  - Dry season (May-Sep)
  - Altitude considerations
  - Trekking conditions

Destination 3: Maldives (Beach/Relax)
Expected: Suggestions focus on:
  - Monsoon season
  - Diving conditions
  - Resort availability

Destination 4: Tokyo (City/Modern)
Expected: Suggestions focus on:
  - Cherry blossom season
  - Festival seasons
  - Weather patterns
```

---

### Scenario 6: Different Trip Types

Test AI response for each trip type:

```
Trip Type: Solo Travel
Expected: Suggestions mention:
  - Safety considerations
  - Budget-friendly options
  - Solo activities

Trip Type: Couple
Expected: Suggestions mention:
  - Romantic periods
  - Honeymoon seasons
  - Couple activities

Trip Type: Family
Expected: Suggestions mention:
  - School holidays (if applicable)
  - Child-friendly weather
  - Family attractions

Trip Type: Friends
Expected: Suggestions mention:
  - Group activity seasons
  - Party/festival timing
  - Budget for groups
```

---

### Scenario 7: Accessibility Testing

**Keyboard Navigation:**
```
1. Tab through Step 2.5
2. Focus should hit:
   - Suggestion cards
   - Accept buttons
   - Reject button
3. Press Enter/Space to activate
4. Expected: Suggestion accepted/rejected
```

**Screen Reader Testing:**
```
1. Enable screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate to Step 2.5
3. Should hear:
   - "Step 2.5: AI Recommendations"
   - Each card with score and emoji
   - Details when expanded
4. Should be able to use keyboard only
```

**High Contrast Testing:**
```
1. Settings → Display → High Contrast
2. Load Step 2.5
3. Verify:
   - Colors meet WCAG AA standards
   - Buttons clearly visible
   - Score indicators visible
```

---

## Browser Compatibility Testing

Test on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

**Expected Results:**
```
All browsers:
- ✅ Full functionality
- ✅ Responsive layout
- ✅ No console errors
- ✅ Proper styling
```

---

## Performance Testing

### Load Time Measurement

**Without API:**
```
Step 2.5 load time: < 100ms (instant)
Fallback suggestions: Immediate
```

**With API:**
```
Step 2.5 initial: < 100ms (shows spinner)
API call: 2-5 seconds (typical)
Suggestions render: < 500ms
Total time: 2.5-5.5 seconds
```

**Test:**
```
1. Open DevTools → Performance tab
2. Create trip to Step 2.5
3. Record performance
4. Expected: No jank, smooth animations
```

### Bundle Size Check

```
Current: 631.62 KB (CreateTripScreen)
Expected: No significant increase
Δ: < 1% increase acceptable
```

**Test:**
```
npm run build
Check dist output
Verify: No warnings about bundle size
```

---

## Error Handling Tests

### Test 1: Network Error
```
Simulate: Network disconnection
Action: Reach Step 2.5
Expected: Fallback suggestions shown
```

### Test 2: API Timeout
```
Simulate: Slow API response (>30 sec)
Expected: Timeout gracefully, show fallback
```

### Test 3: Invalid Response
```
Simulate: Gemini returns invalid JSON
Expected: Error caught, fallback shown, no crash
```

### Test 4: Empty Results
```
Simulate: Gemini returns empty suggestions
Expected: Fallback used, user not blocked
```

### Test 5: Invalid Dates
```
Simulate: Gemini suggests past dates
Expected: Validation filters them out, fallback used
```

---

## Regression Testing

Ensure no existing features broken:

```
✓ Trip creation (Steps 1-5 still work)
✓ Trip editing
✓ Trip deletion
✓ Trip favorites
✓ Trip search
✓ Itinerary generation
✓ Map display
✓ Responsive design
✓ Dark mode toggle
✓ Language switching
✓ Authentication
```

**Run Tests:**
```bash
npm run test -- --run
# Expected: 247/247 pass
```

---

## User Acceptance Testing (UAT)

### Test Users
- 👤 Travel enthusiast
- 👤 First-time app user
- 👤 Mobile-only user
- 👤 Accessibility user

### UAT Checklist
- [ ] All users can create trip
- [ ] AI suggestions are helpful
- [ ] Interface is intuitive
- [ ] No confusing steps
- [ ] Error messages clear
- [ ] Help text sufficient
- [ ] Performance acceptable
- [ ] No accessibility issues

---

## Production Deployment Checklist

Before deploying:

### Code Review
- [ ] All code reviewed
- [ ] No console.logs in production code
- [ ] No hardcoded keys
- [ ] Error handling complete
- [ ] Logging in place

### Testing
- [ ] All 247 tests pass
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] No warnings
- [ ] Performance acceptable

### Environment
- [ ] VITE_GEMINI_API_KEY set
- [ ] API key has proper quotas
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring enabled
- [ ] Analytics configured

### Documentation
- [ ] README updated
- [ ] API documentation complete
- [ ] Deployment guide written
- [ ] Rollback plan prepared

### Monitoring
- [ ] Error rate < 1%
- [ ] API response time < 5s
- [ ] No spike in errors post-deploy
- [ ] User feedback collected

---

## Rollback Plan

If issues found post-deploy:

**Immediate Rollback:**
```bash
# Revert commit
git revert <commit_hash>
# OR deploy previous working build
npm run build
npm run deploy -- --version=previous
```

**Partial Rollback (Step 2.5 only):**
```typescript
// In CreateTripScreen.tsx
// Temporarily skip Step 2.5:
if (step === 2) {
  setStep(3) // Skip 2.5
}
```

---

## Monitoring Metrics

Post-deployment, track:

- 📊 Step 2.5 success rate (% users completing)
- ⏱️ Average time per step
- 🎯 AI suggestion acceptance rate
- 💥 Error rate at Step 2.5
- 📱 Mobile completion rate
- 🌍 Language distribution
- 🔄 Suggestion quality feedback

---

## Quick Reference - Command Cheatsheet

```bash
# Development
npm run dev              # Start dev server
npm run test -- --run   # Run tests once
npm run test            # Run tests in watch
npm run build           # Build for production
npm run lint            # Check code quality

# Specific test files
npm run test src/__tests__/screens/CreateTripScreen.test.tsx

# Debug in browser
# F12 → Console tab (for logger output)
# F12 → Network tab (for API calls)
# F12 → Application tab (for storage)
```

---

## Support & Troubleshooting

### Issue: Step 2.5 doesn't appear
**Solution:** Check API key, verify network, check browser console

### Issue: Suggestions look wrong
**Solution:** Verify destination spelling, check language setting, retry

### Issue: Dates don't auto-fill
**Solution:** Check browser console for errors, verify onAccept callback

### Issue: Performance slow
**Solution:** Check network, disable extensions, check API quota

### Issue: Mobile layout broken
**Solution:** Verify viewport meta tag, check responsive breakpoints

---

**Testing Complete! 🎉**

Ready for production deployment.
