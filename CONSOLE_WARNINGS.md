# ⚠️ Resolver Warnings do Navegador

## 1. Shadow Props Warning

```
"shadow*" style props are deprecated. Use "boxShadow".
```

**Causa:** React Native Web usa `shadow` props que não existem em web CSS.

**Solução:** Procurar por componentes com `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` e substituir por `boxShadow`.

Procure em arquivo de estilos:

```javascript
// ❌ ERRADO (React Native)
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3,
}

// ✅ CORRETO (React Native Web)
{
  boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.25)',
}
```

---

## 2. pointerEvents Warning

```
props.pointerEvents is deprecated. Use style.pointerEvents
```

**Causa:** `pointerEvents` como prop direto é deprecated.

**Solução:** Mover para `style`:

```javascript
// ❌ ERRADO
<View pointerEvents="none" />

// ✅ CORRETO
<View style={{ pointerEvents: 'none' }} />
```

---

## 3. Cross-Origin-Opener-Policy (COOP)

```
Cross-Origin-Opener-Policy policy would block the window.closed call.
```

**Causa:** Firebase abre popup OAuth mas COOP policy bloqueia acesso ao `window.closed`.

**Este é um warning esperado** - Firebase lida com isso automaticamente. Não precisa corrigir, mas você pode suprimir:

Na sua config do servidor (se usar custom):

```javascript
// Não precisa fazer nada - Firebase já trata isso
// O app vai funcionar normalmente
```

---

## 4. Firestore Error 400

```
Failed to load resource: the server responded with a status of 400
```

**Veja:** `FIRESTORE_RULES_ERROR.md` para solução completa.

**Resumo:** Atualizar regras Firestore para permitir leitura/escrita autenticada.

---

## 📋 Prioridades

| Warning | Severidade | Ação | Arquivo |
|---------|-----------|------|---------|
| Shadow props | 🟡 Baixa | Procurar e substituir | LoginScreen, HomeScreen |
| pointerEvents | 🟡 Baixa | Procurar e substituir | Qualquer View |
| COOP | 🟢 Nenhuma | Ignorar | Firebase SDK |
| Firestore 400 | 🔴 Alta | Atualizar regras | Firebase Console |

---

## 🚀 Próximos Passos

1. **URGENTE:** Atualizar Firestore Rules
2. Recarregar http://localhost:8081
3. Testar login com Google
4. Depois, corrigir warnings visuais (shadow, pointerEvents)

---

**Nota:** Warnings visuais não impactam funcionalidade. Corrija depois. Foco agora é no Firestore!
