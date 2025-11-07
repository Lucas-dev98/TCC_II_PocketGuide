# 🧪 GUIA DE TESTE - Verificar se Tudo Está Funcionando

## 🎬 Passo-a-Passo Completo

### **Pré-requisitos:**
- Browser aberto com localhost:5173
- Console do Navegador aberto (F12 → Console aba)
- Limpar logs anteriores (Ctrl+L ou clique no botão de limpar)

---

## **TESTE 1: Primavera em Novembro (Hemisfério Sul)**

### **Step 1: Tipo de Viagem + Interesses**
1. Clique em **🧘 Relaxamento**
2. Clique em **🧘 Yoga**
3. Clique **Next**
4. Console: Deve mostrar `"tripTypes": ["relaxamento"]` e `"interests": ["yoga"]`

### **Step 2: Grupo + Orçamento**
1. Selecione **Solo** (para simplificar)
2. Selecione **Médio** (€60-€150/dia)
3. Clique **Next**
4. Console: Deve mostrar `"groupType": "solo"` e `"budgetPerDay": "medio"`

### **Step 3: Datas + Estação** ⭐ CRÍTICO
1. **Data de Ida**: Clique no calendário, selecione **08/11/2025**
2. **Data de Volta**: Clique no calendário, selecione **29/11/2025**
3. **Estação**: Clique em **🌸 Primavera** (deve ficar roxo)
4. Console deve mostrar:
   ```
   ✅ season: "primavera"
   ✅ startDate: "2025-11-08"
   ✅ endDate: "2025-11-29"
   ```
5. Clique **Next**

### **Step 4: Seleção de Destino** ⭐ CRÍTICO
1. **ABRA O CONSOLE AGORA** (não feche!)
2. Aguarde as recomendações carregarem
3. Procure por este log (a coisa mais importante):

```
🎯 DestinationSelector - Parameters for AI: {
  tripTypes: [ 'relaxamento' ],
  interests: [ 'yoga' ],
  groupType: 'solo',
  numPeople: undefined,
  numChildren: undefined,
  budget: 'medio',
  startDate: '2025-11-08',
  endDate: '2025-11-29',
  season: 'primavera',           ← ✅ PROCURE ESTE!
  selectedMonth: 11,
  language: 'pt-BR'
}
```

4. Rolar para baixo no console e procure:

```
════════════════════════════════════════════════════════
🎯 DESTINATION RECOMMENDATION PARAMETERS:
════════════════════════════════════════════════════════
📍 Trip Types: relaxamento
⭐ Interests: yoga
👥 Group Type: solo | People: undefined | Children: undefined
💰 Budget: medio
📅 Dates: 11/8/2025 to 11/29/2025
🌍 Season: primavera           ← ✅ PROCURE ESTE!
🗓️ Month: 11
🌐 Language: pt-BR
════════════════════════════════════════════════════════
📝 FULL PROMPT TO GEMINI:
════════════════════════════════════════════════════════
[Prompt aparece aqui]
════════════════════════════════════════════════════════
```

### **Verificação Visual - Destinos Recomendados:**

**✅ ESPERADO (Hemisfério Sul - Primavera em Nov):**
- 🇧🇷 **Gramado, Brazil** - "mild weather, spring flowers"
- 🇦🇷 **Bariloche, Argentina** - "spring season, outdoor activities"
- 🇦🇺 **Melbourne, Australia** - "spring weather, blooming gardens"
- 🇳🇿 **Queenstown, New Zealand** - "spring activities, hiking"
- 🇺🇾 **Punta del Este, Uruguay** - "spring weather, relaxation"

**❌ NÃO ESPERADO (Hemisfério Norte - Outono em Nov):**
- ❌ Índia, Nepal, Vietnã
- ❌ Tailândia, Indonésia
- ❌ Japão, Coreia

---

## **TESTE 2: Outono em Novembro (Hemisfério Norte)**

### **Steps 1-2:** Mesmo do Teste 1

### **Step 3: Datas + Estação**
1. **Data de Ida**: 08/11/2025
2. **Data de Volta**: 29/11/2025
3. **Estação**: Clique em **🍂 Outono** (deve ficar roxo)
4. Console deve mostrar: `season: "outono"`
5. Clique **Next**

### **Step 4: Verificação**
1. Procure no console por:
   ```
   season: "outono"  ← ✅ DEVE ESTAR "outono", NÃO "primavera"
   ```

### **Verificação Visual - Destinos Recomendados:**

**✅ ESPERADO (Hemisfério Norte - Outono em Nov):**
- 🇯🇵 **Quioto, Japan** - "fall foliage, koyo season"
- 🇰🇷 **Seul, Korea** - "autumn leaves, cool weather"
- 🇺🇸 **Boston, USA** - "fall colors, autumn festival"
- 🇵🇱 **Praga, Czech Republic** - "autumn weather, fall colors"
- 🇹🇭 **Chiang Mai, Thailand** - "cool season starting"

---

## 🔴 Se o Teste Falhar

### **Cenário 1: Console NÃO mostra `season: "primavera"`**

**Problema**: Season não está sendo passado
**Solução**:
1. Verifique se `CreateTripScreen.tsx` linha ~397 tem `season={formData.season}`
2. Verifique se em Step 3 você **realmente clicou** na estação
3. Abra DevTools → Application → LocalStorage → procure por `formData`

### **Cenário 2: Mostra `season` no log mas recomendações estão erradas**

**Problema**: IA não está entendendo o prompt
**Solução**:
1. Procure no console por "FULL PROMPT TO GEMINI"
2. Verifique se inclui linhas como:
   ```
   4. For November specifically:
      - Southern Hemisphere = PRIMAVERA (Spring) - use: Brazil (South), Argentina...
   ```
3. Se tiver, o problema é com a IA (raro)
4. Tente fazer logout e login novamente

### **Cenário 3: Console vazio ou não mostra os logs**

**Problema**: Logs não estão sendo executados
**Solução**:
1. Verifique se há erros em vermelho no console (Ctrl+Shift+K)
2. Se houver erro de network, verifique a API key do Gemini
3. Se not houver nenhum erro, o DestinationSelector pode não estar renderizando

---

## 📊 Checklist de Sucesso

Marque cada item à medida que verifica:

- [ ] Console mostra `season: "primavera"` após Step 3
- [ ] Console mostra `season: "primavera"` nos logs do DestinationSelector
- [ ] Console mostra `🌍 Season: primavera` no bloco de parâmetros
- [ ] Console mostra "FULL PROMPT TO GEMINI" com instruções sobre hemisfério
- [ ] Destinos recomendados são do Hemisfério Sul (Brazil, Argentina, Austrália, NZ)
- [ ] Quando troca para Outono, destinos muda para Hemisfério Norte (Japão, Coreia, etc)

---

## 🎯 Resultado Final

Após todas as correções, o sistema deve:

1. ✅ **Capturar** season em Step 3
2. ✅ **Passar** season para DestinationSelector
3. ✅ **Incluir** season no prompt para Gemini
4. ✅ **Recomendar** destinos corretos baseado em season + hemisfério
5. ✅ **Gerar** itinerário consistente com as seleções

---

## 📝 Logging Adicionado

### **Arquivo: DestinationSelector.tsx**
```typescript
console.log('🎯 DestinationSelector - Parameters for AI:', {
  tripTypes, interests, groupType, numPeople, numChildren,
  budget, startDate, endDate, season, selectedMonth, language
});
```

### **Arquivo: destinationRecommendationService.ts**
```typescript
console.log('════════════════════════════════════════════════════════');
console.log('🎯 DESTINATION RECOMMENDATION PARAMETERS:');
// ... mostra todos os parâmetros
console.log('📝 FULL PROMPT TO GEMINI:');
console.log(prompt);
console.log('════════════════════════════════════════════════════════');
```

---

## 🆘 Precisa de Ajuda?

Se após estes testes o problema persistir:

1. **Copie TODO o console** (Ctrl+A no console, Ctrl+C)
2. **Cole em um arquivo** `console_output.txt`
3. **Procure por**:
   - `season: "primavera"` ou `season: undefined`
   - Qualquer erro em vermelho
   - Timestamps das requisições

4. **Compartilhe** o arquivo com seu time

