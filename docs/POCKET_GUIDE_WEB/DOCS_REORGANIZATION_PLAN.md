# 📚 REORGANIZAÇÃO DE DOCUMENTAÇÃO - POCKET GUIDE WEB

## 📍 Contexto

Existe uma pasta `docs/` na raiz do projeto com documentação centralizada.
Os arquivos .md na raiz de `pocket-guide-web/` precisam ser reorganizados.

---

## ✅ ARQUIVOS PARA MANTER NA RAIZ de `pocket-guide-web/`

**README.md** - Deve ficar aqui (não existe ainda)
- Introdução ao sub-projeto web
- Setup rápido
- Como rodar localmente

---

## 🔁 ARQUIVOS PARA MOVER para `docs/POCKET_GUIDE_WEB/`

### Atuais (30/10/2025) - PRIORIDADE ALTA
```
✨ AUTOCOMPLETE_FIXED.md → docs/POCKET_GUIDE_WEB/
✨ DATE_VALIDATION_IMPLEMENTATION.md → docs/POCKET_GUIDE_WEB/
✨ MAPBOX_API_FIX.md → docs/POCKET_GUIDE_WEB/
✨ MAPBOX_SOLUTION_SUMMARY.md → docs/POCKET_GUIDE_WEB/
```

### Histórico - PRIORIDADE NORMAL
```
📚 BUGFIX_TRIP_CREATION.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 FINAL_SUMMARY.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 DEBUG_ITINERARY.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 GEOCODING_COMPLETE.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 GEOCODING_FLOW.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 GEOCODING_IMPROVEMENTS.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 I18N_IMPLEMENTATION_SUMMARY.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 I18N_INTEGRATION_SUMMARY.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 I18N_PROGRESS.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 DEPLOYMENT_SUCCESS.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 REVERT_STATUS.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 SESSION_COMPLETE.md → docs/POCKET_GUIDE_WEB/HISTORY/
📚 DATE_VALIDATION_ANALYSIS.md → docs/POCKET_GUIDE_WEB/HISTORY/
```

---

## ❌ ARQUIVOS PARA REMOVER

```
🗑️ STRINGS_ENCONTRADAS.md - Não tem propósito (dump de debug)
🗑️ TEST_MAPS.js - Arquivo de teste (não deve estar em src/)
🗑️ UNSPLASH_SETUP.md - Setup antigo (supercedido por docs/UNSPLASH_QUICK_START.md)
🗑️ DOCS_ORGANIZATION_ANALYSIS.md - Este arquivo de análise (após uso)
```

---

## 📋 Estrutura Final

### Raiz de `pocket-guide-web/`
```
✅ README.md (NOVO)
✅ package.json
✅ vite.config.ts
✅ src/
✅ public/
✅ dist/
✅ ...
```

### Em `docs/POCKET_GUIDE_WEB/`
```
✨ AUTOCOMPLETE_FIXED.md
✨ DATE_VALIDATION_IMPLEMENTATION.md
✨ MAPBOX_API_FIX.md
✨ MAPBOX_SOLUTION_SUMMARY.md

📚 HISTORY/
   ├── BUGFIX_TRIP_CREATION.md
   ├── FINAL_SUMMARY.md
   ├── DEBUG_ITINERARY.md
   ├── GEOCODING_COMPLETE.md
   ├── GEOCODING_FLOW.md
   ├── GEOCODING_IMPROVEMENTS.md
   ├── I18N_IMPLEMENTATION_SUMMARY.md
   ├── I18N_INTEGRATION_SUMMARY.md
   ├── I18N_PROGRESS.md
   ├── DEPLOYMENT_SUCCESS.md
   ├── REVERT_STATUS.md
   ├── SESSION_COMPLETE.md
   └── DATE_VALIDATION_ANALYSIS.md
```

---

## 📊 Impacto

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Arquivos na raiz | 24 .md files (bagunçado) | 1 README.md (limpo) |
| Documentação centralizada | Espalhada | ✅ Em docs/ |
| Fácil de encontrar | ❌ Difícil | ✅ Fácil |
| Histórico preservado | ❌ Perde | ✅ Mantém em HISTORY/ |

---

## 🎯 Próximas Ações

1. ✅ Criar `docs/POCKET_GUIDE_WEB/` e `docs/POCKET_GUIDE_WEB/HISTORY/`
2. ✅ Mover 4 arquivos atuais para `docs/POCKET_GUIDE_WEB/`
3. ✅ Mover 13 arquivos históricos para `docs/POCKET_GUIDE_WEB/HISTORY/`
4. ✅ Remover 4 arquivos desatualizados
5. ✅ Criar `README.md` na raiz de `pocket-guide-web/`
6. ✅ Atualizar `docs/INDEX.md` para referenciar a nova pasta

