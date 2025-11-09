# 🧪 Testing Guide - Itinerary & Budget Fixes

## Overview

Este guia testa TODAS as correções realizadas:

1. ✅ **Budget Display Fix** - TripDetailScreen mostrando orçamento correto
2. ✅ **Itinerary Diversification** - Atividades variadas por dia
3. ✅ **Season Parameter** - Destinos corretos por estação
4. ✅ **Hemisphere Matching** - Hemisfério correto para estação

---

## 🧪 Test Case 1: Budget Display on Trip Details

### Setup
1. Abra a aplicação: `http://localhost:5173`
2. Abra **F12 Console** (importante!)
3. Navegue para **Criar Nova Viagem**

### Steps
```
1. Step 1 (Travel Type & Interests):
   - Selecione: Relaxamento
   - Interesses: Yoga

2. Step 2 (Group & Budget):
   - Grupo: Solo
   - Budget: ⭐⭐ Ultra Econômico (MUITO IMPORTANTE!)

3. Step 3 (Duration & Season):
   - Selecione: 22 dias
   - Mês: Novembro
   - Clique Next (a estação deve aparecer: Primavera)

4. Step 4 (Dates & Season):
   - Selecione as datas
   - Confirme estação: Primavera

5. Step 5 (Destination):
   - Aguarde recomendações
   - Selecione Rio de Janeiro

6. Step 6 (Preview):
   - **VERIFIQUE NO CONSOLE** por logs como:
     ✅ "🎯 TripPreview received - trip.budgetPerDay: ultra-economico"
     ✅ "🎯 getBudgetLabel - Input budget: ultra-economico | Output label: Ultra Econômico"
   - Verifique se mostra "Ultra Econômico" ✅

7. Step 7 (Success):
   - Clique "Criar Minha Viagem"
   - Aguarde salvar
```

### Verification
Após a viagem ser criada:
1. Clique no card da viagem
2. **Compare os orçamentos**:
   - No resumo (Step 6/Preview): Deve mostrar "Ultra Econômico"
   - Na página de detalhes: **AGORA DEVE MOSTRAR "Ultra Econômico"** (antes mostrava "Luxo" ❌)

### Expected Results
```
✅ Step 6 (Preview): Ultra Econômico
✅ Trip Details Page: Ultra Econômico (FIXED!)
✅ Console logs show correct budget at each step
```

### Console Logs to Check
```
✅ "🎯 CreateTripScreen - formData.budgetPerDay: ultra-economico"
✅ "🎯 getBudgetLabel - Input budget: ultra-economico | Output label: Ultra Econômico"
✅ "🎯 TripPreview received - trip.budgetPerDay: ultra-economico"
✅ "🎯 TripPreview Step 2 Display: { tripBudgetPerDay: 'ultra-economico' ... }"
```

---

## 🧪 Test Case 2: Itinerary Diversification

### Setup
1. Mesma viagem do Test 1 (ou criar uma nova)
2. Abra a viagem criada
3. Abra **F12 Console**

### Steps
```
1. Clique na viagem criada
2. Navegue até "Mapa da Viagem"
3. Verifique os primeiros 3 dias (pelo menos)
```

### Verification - VERY IMPORTANT! 🔴

**Antes (❌ ERRADO):**
```
Dia 1:
  ✗ 09:00 - Explore Rio de Janeiro - Morning Tour
  ✗ 12:00 - Local Lunch in Rio de Janeiro
  ✗ 15:00 - Cultural Site Visit
  ✗ 19:00 - Dinner and Evening Entertainment

Dia 2:
  ✗ 09:00 - Explore Rio de Janeiro - Morning Tour (REPETIDO!)
  ✗ 12:00 - Local Lunch in Rio de Janeiro (REPETIDO!)
  ✗ 15:00 - Cultural Site Visit (REPETIDO!)
  ✗ 19:00 - Dinner and Evening Entertainment (REPETIDO!)
```

**Depois (✅ CORRETO):**
```
Dia 1:
  ✅ 09:00 - Visit Historic Museum (Cultura)
  ✅ 13:15 - Street Food & Market Tour (Comida)
  ✅ 18:30 - Local Bar & Drinks (Vida Noturna)

Dia 2:
  ✅ 08:00 - Mountain Hiking Adventure (Natureza) ← DIFERENTE!
  ✅ 12:45 - Fine Dining Experience (Comida) ← DIFERENTE!
  ✅ 21:00 - Live Music Venue (Entretenimento) ← DIFERENTE!

Dia 3:
  ✅ 07:00 - Yoga Class in Nature (Wellness) ← DIFERENTE!
  ✅ 13:30 - Farmers Market & Food Stalls (Comida) ← DIFERENTE!
  ✅ 19:30 - Rooftop Bar with City View (Bar) ← DIFERENTE!
```

### Console Check
Procure por logs como:
```
✅ "✅ ITINERARY VALIDATION PASSED - All activities are unique!"

OU se houver problemas:

⚠️ "⚠️ ITINERARY VALIDATION ISSUES:"
   "   - Day 1: Repeated category "Food""
   "   - Repeated activity "Local Lunch" across different days"
```

### Expected Results
- ✅ Cada dia tem **ATIVIDADES DIFERENTES**
- ✅ Atividades variam entre: Cultura, Natureza, Comida, Wellness, Nightlife, Shopping, Adventure
- ✅ Horários diferentes em cada dia
- ✅ Sem mensagem de validação alertando repetições

---

## 🧪 Test Case 3: Season Correctness (November = Spring in Southern Hemisphere)

### Setup
```
1. Criar nova viagem com:
   - Tipo: Relaxamento + Yoga
   - Grupo: Solo
   - Budget: Econômico
   - Duração: 5 dias
   - Mês: Novembro (deve ser PRIMAVERA - Southern Hemisphere)
```

### Steps
1. Abra **F12 Console**
2. Complete Steps 1-4
3. No Step 5 (Destination), aguarde as recomendações

### Verification
Procure nos logs:
```
✅ "🌍 SEASON (CRITICAL): PRIMAVERA"
✅ "🌎 HEMISPHERE DETECTION: Hemisfério Sul"
✅ Destinos recomendados devem incluir: 
   - Brasil (Rio, São Paulo, Florianópolis)
   - Argentina (Bariloche, Mendoza)
   - Austrália/Nova Zelândia
   
❌ NÃO devem aparecer:
   - Tailândia (Outono em Nov)
   - Vietnã (Outono em Nov)
   - Índia (Primavera em Nov, mas Hemisfério Norte)
```

### Expected Results
- ✅ Destinos são do Hemisfério Sul
- ✅ Estação "Primavera" está sendo usada
- ✅ Sem destinos de Outono (Hemisfério Norte)

---

## 🧪 Test Case 4: Full Journey Test

### Complete User Journey (All Fixes Together)

```
✅ Step 1-2: Select Travel Type + Budget
   ├─ Budget: "Ultra Econômico" (or any)
   └─ [Console Log]: formData.budgetPerDay = "ultra-economico"

✅ Step 3-4: Duration + Season
   ├─ Duration: 10 dias
   ├─ Season detected: Primavera/Verão/Outono/Inverno
   └─ [Console Log]: season parameter being passed

✅ Step 5: Destination Recommendations
   ├─ Recommendations match season/hemisphere
   ├─ [Console Log]: Shows Gemini prompt with season requirements
   └─ Select a destination

✅ Step 6: Trip Preview
   ├─ Budget shows correctly: "Ultra Econômico"
   ├─ Season shows: "Primavera" (or selected season)
   ├─ Itinerary shows in preview
   └─ [Console Log]: getBudgetLabel output correct

✅ Step 7: Save Trip
   ├─ Viagem salva com sucesso
   └─ Redirecionado para Trip Details

✅ Trip Details Page
   ├─ Destination name correct
   ├─ Budget displays: "Ultra Econômico" ← FIX #1
   ├─ Itinerary shows varied activities ← FIX #2
   ├─ Season reflected in activities ← FIX #3
   └─ [Console Log]: No errors, all values correct
```

---

## 🐛 Troubleshooting

### Problem: Budget still shows wrong value on Trip Details

**Check:**
1. Open F12 Console
2. Look for: `🎯 getBudgetLabel - Input budget:`
3. If shows `input budget: luxo` but should be `ultra-economico`:
   - Budget wasn't saved correctly
   - Check CreateTripScreen logs to see what was passed

**Solution:** Restart and try again, check console logs at each step

### Problem: Itinerary still shows repeated activities

**Check:**
1. Open F12 Console
2. Look for: `"⚠️ ITINERARY VALIDATION ISSUES:"`
3. Check which activities/categories are repeated

**Possible Causes:**
1. Using old cached data - Clear cache: `Ctrl+Shift+Delete`
2. Gemini API failing silently - Check error logs
3. Not using the latest build - Restart dev server

**Solution:** 
```bash
# Clear all caches and rebuild
npm run build
npm run dev
```

### Problem: Season not matching hemisphere

**Check:**
1. Open F12 Console
2. Look for: `🌎 HEMISPHERE DETECTION:`
3. Look for: `🌍 SEASON (CRITICAL):`

**Solution:**
- pt-BR users: Southern Hemisphere
- en-US/es-ES users: Northern Hemisphere
- Check if destination matches hemisphere

---

## 📋 Test Checklist

Use this checklist to validate all fixes:

```
[ ] Test 1: Budget Display
    [ ] Budget shows "Ultra Econômico" on Step 6 Preview
    [ ] Budget shows "Ultra Econômico" on Trip Details (FIXED!)
    [ ] Console logs show correct budget at each step
    [ ] No console errors

[ ] Test 2: Itinerary Diversification
    [ ] Day 1 has different activities than Day 2
    [ ] Day 2 has different activities than Day 3
    [ ] Each day has 3 different activities (not repeated)
    [ ] Activities match user interests/tags
    [ ] Console shows "✅ ITINERARY VALIDATION PASSED"
    [ ] No "⚠️ ITINERARY VALIDATION ISSUES" warnings

[ ] Test 3: Season Correctness
    [ ] November shows "Primavera" (not Outono)
    [ ] Destinations match hemisphere/season
    [ ] Console shows correct hemisphere detection
    [ ] No recommendations for wrong hemisphere

[ ] Test 4: Full Journey
    [ ] All steps complete without errors
    [ ] Budget, Season, and Itinerary all correct
    [ ] No console errors
    [ ] Trip details load correctly
    [ ] Itinerary shows on map with varied activities

[ ] Final Verification
    [ ] Create 2-3 test trips with different parameters
    [ ] All show correct budget on Trip Details
    [ ] All show diversified itineraries
    [ ] All season/destination recommendations correct
```

---

## 🎯 Success Criteria

✅ **All tests pass when:**
1. Budget displays correctly on Trip Details (was showing "Luxo", now shows selected budget)
2. Itineraries have **different activities for each day** (not repetitive)
3. Season/destination recommendations match hemisphere correctly
4. No console errors or warnings
5. All user preferences (budget, interests, season) are reflected in the trip

---

## 📞 If Issues Persist

1. **Collect console logs** - Screenshot F12 console output
2. **Check git log** - Verify latest commits are applied
3. **Clear cache** - Hard refresh (Ctrl+Shift+R)
4. **Restart dev server** - Kill and restart npm run dev
5. **Check Gemini API** - Verify VITE_GEMINI_API_KEY is set

---

## Commit Reference

```
cd914f3 - fix: implement diversified fallback itinerary with validation
42103c8 - debug: add detailed budget logging in TripPreview
4013c42 - docs: add comprehensive debugging guides
3988a1e - fix: pass season parameter to DestinationSelector
e72d9bf - debug: add season to useEffect dependencies
f127cad - fix: explicit season-hemisphere matching
```

All fixes are in `main` branch - pull latest to get all corrections!
