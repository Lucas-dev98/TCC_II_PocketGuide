# 🔍 Guia de Debug - Season vs Destination Recommendations

## Problema Identificado

Ao selecionar:
- 📅 **Datas:** 08/11/2025 a 29/11/2025 
- 🌸 **Estação:** Primavera
- 🧘 **Interesse:** Yoga

A IA está recomendando destinos do **Hemisfério Norte** (Vietnam, Nepal, Indonesia) que estão em **OUTONO** em novembro, não Primavera!

## Como Debugar

### 1️⃣ **Verificar Console do Browser (F12)**

Abra o DevTools (`F12`) e procure pelos logs:

```
📊 Destination Recommendations Parameters: {
  season: "primavera",
  language: "pt-BR",
  startDate: "2025-11-08",
  endDate: "2025-11-29",
  tripTypes: "relaxamento",
  interests: "yoga"
}
```

**✅ Se aparecer:** Season está sendo passado corretamente
**❌ Se for undefined:** Season não está chegando no DestinationSelector

---

### 2️⃣ **Verificar Prompt Enviado à IA**

Procure pelo log:

```
🎯 Final Destination Recommendation Prompt: {
  season: "primavera",
  language: "pt-BR",
  prompt: "Recommend destinations based on these preferences:\n\n..."
}
```

**✅ Se o prompt incluir:**
```
3. IMPORTANT: Match the ACTUAL season in the destination's hemisphere during the travel dates:
   - If user wants "primavera" (Spring): Recommend destinations in SOUTHERN hemisphere...
   - For Nov dates, prioritize SOUTHERN hemisphere destinations!
```

**✅ E se tiver:**
```
4. For November specifically:
   - Southern Hemisphere = PRIMAVERA (Spring) - use: Brazil (South), Argentina, Chile, New Zealand, Australia, Uruguay
```

Então a IA recebeu as instruções corretas!

---

## Possíveis Problemas e Soluções

### Cenário A: Season é `undefined`

**Sintomas:**
- Log mostra: `season: undefined`
- Recomendações ignoram estação

**Causa Provável:**
- `formData.season` não está sendo atualizado em CreateTripScreen
- Callback `onSeasonChange` não está funcionando

**Solução:**
1. Verifique Step 3 (DurationAndBudgetSelector) em CreateTripScreen
2. Confirme que `onSeasonChange` está sendo chamado ao clicar em um botão de estação
3. Adicione log em `setFormData((prev) => ({ ...prev, season }))`

---

### Cenário B: Season está correto, mas IA ignora

**Sintomas:**
- Log mostra: `season: "primavera"`
- Prompt tem instruções corretas
- Mas IA recomenda: Vietnam, Nepal, Indonesia

**Causa Provável:**
- Gemini não está seguindo as instruções complexas
- AI está usando cached response ou behavior padrão

**Solução:**
1. Aumente "pressure" do prompt (adicione "CRITICAL INSTRUCTION - DO NOT IGNORE!")
2. Reformule de forma mais imperative
3. Considerar usar prompt engineering mais agressivo

---

### Cenário C: Language está `en-US` quando deveria ser `pt-BR`

**Sintomas:**
- Log mostra: `language: "en-US"`
- Mesmo que interface esteja em português

**Causa Provável:**
- `i18n?.language` é undefined em DestinationSelector
- Default `'en-US'` está sendo usado
- `getHemisphere('en-US')` retorna `'north'` ❌

**Solução:**
1. Procure por `i18n?.language || 'en-US'`
2. Adicione fallback melhor: `i18n?.language || localStorage.getItem('language') || 'pt-BR'`
3. Certifique-se que i18n context está disponível em DestinationSelector

---

## Checklist de Verificação

Abra a página de debug executando estes comandos no console:

```javascript
// 1. Verifique se i18n está disponível
console.log('i18n:', window.i18n);

// 2. Verifique localStorage de language
console.log('Stored language:', localStorage.getItem('language'));

// 3. Verifique browser language
console.log('Browser language:', navigator.language);
```

---

## Próximos Passos

1. ✅ **Rode o app** e teste com: Datas 08/11-29/11 + Primavera + Yoga
2. ✅ **Abra DevTools (F12)** e procure pelos logs
3. ✅ **Screenshot dos logs** e compartilhe
4. ✅ **Confirme:**
   - Season é "primavera"?
   - Language é "pt-BR"?
   - Prompt tem instruções sobre hemisférios?

Com essa informação, podemos identificar exatamente onde o problema está! 🔍

---

## Comandos Úteis

```bash
# Para ver todos os commits recentes
git log --oneline -10

# Para ver as mudanças feitas
git diff HEAD~3

# Para testar especificamente a lógica de season
npm run test -- destinationRecommendationService
```

---

## Referência Rápida

**Hemisférios em Novembro:**
| Estação | Hemisfério | Destinos |
|---------|-----------|----------|
| Primavera | **Sul** ✅ | Brasil, Argentina, Chile, Austrália, NZ |
| Outono | **Norte** ✅ | Japão, Coreia, Europa, EUA |
| Verão | **Sul** (transição) | Menos comum em Nov |
| Inverno | **Norte** (transição) | Menos comum em Nov |

