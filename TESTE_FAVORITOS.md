# 🧪 Teste do Sistema de Favoritos

## Como testar manualmente:

### 1. **Na tela HomeScreen**
- Criar uma viagem (ou usar viagens existentes)
- Clicar no **coração** (❤️) ao lado do botão "Deletar" em qualquer card de viagem
- Verificar se:
  - [ ] O coração **muda de cor** (fica vermelho)
  - [ ] O texto muda de "Adicionar" para "Adicionado"
  - [ ] A viagem **desaparece da lista após clicar de novo** (toggle)

### 2. **Na tela FavoritesScreen**
- Após marcar como favorito na HomeScreen
- Ir para a tela de **"Favoritos"** (ícone coração no menu)
- Verificar se:
  - [ ] A viagem aparece na lista de favoritos
  - [ ] O contador mostra **"+1"** favorito
  - [ ] A viagem **permanece visível**

### 3. **No TripDetailScreen**
- Abrir uma viagem em detalhes
- Clicar no **coração** no topo da página
- Verificar se:
  - [ ] Muda de cor (fica vermelho)
  - [ ] Aparece instantaneamente na tela de Favoritos

### 4. **Persistência (localStorage)**
- Clicar no coração para marcar como favorito
- **Recarregar a página** (F5 ou Ctrl+R)
- Verificar se:
  - [ ] O favorito **foi salvo** (coração ainda vermelho)
  - [ ] A viagem ainda aparece em "Favoritos"

### 5. **Debug Console**
- Abrir o **DevTools** do navegador (F12)
- Ir para a aba **"Console"**
- Marcar como favorito e ver os logs:
  - `⭐ Added favorite: {tripId}`
  - `💔 Removed favorite: {tripId}`

### 6. **localStorage Inspection**
- Abrir **DevTools** (F12)
- Ir para aba **"Application" > "Storage" > "Local Storage"**
- Buscar por chave `favorites-storage`
- Verificar se contém um array com IDs das viagens favoritas:
  ```json
  {
    "favorites": ["trip-id-1", "trip-id-2"],
    "lastUpdated": "2025-10-26T..."
  }
  ```

## ❌ Se não está funcionando:

### Verificar no Console:
```javascript
// Executar no console do DevTools:
localStorage.getItem('favorites-storage')
```

Se retornar `null`, o localStorage não está sendo setado.

### Verificar a Store:
```javascript
// Executar no console:
useFavoritesStore.getState()
```

Deve retornar um objeto com `favorites` como Array.

## ✅ Esperado:

- Clicar no coração = **muda de cor imediatamente**
- Viagem aparece em "Favoritos" = **instantaneamente**
- Recarrega a página = **favorito persiste**
- localStorage = **contém os IDs das viagens favoritas**

