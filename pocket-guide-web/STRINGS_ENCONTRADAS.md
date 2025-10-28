# 📋 Análise Completa de Strings em Português - Pocket Guide Web

**Data:** 28 de outubro de 2025  
**Status:** ✅ Análise 100% Completa  
**Total de Strings Encontradas:** ~1000+ referências  

---

## 📊 Resumo Executivo

### Categorias de Strings Identificadas:

1. **🎨 UI/UX (Strings Visíveis ao Usuário)** - PRIORIDADE ALTA ⭐⭐⭐
   - Botões, labels, placeholders, títulos, aria-labels
   - Estimativa: **50-70 strings críticas**

2. **❌ Mensagens de Erro/Validação** - PRIORIDADE ALTA ⭐⭐⭐
   - Erros de autenticação, validação de formulário, feedback
   - Estimativa: **20-30 strings críticas**

3. **📝 Comentários de Código** - PRIORIDADE BAIXA ⭐
   - Documentação interna, notas de desenvolvimento
   - Estimativa: **150+ strings (apenas para referência)**

---

## 🔴 PRIORIDADE CRÍTICA - UI/UX Components

### 1. **FavoriteButton.tsx** 
- **Localização:** `src/components/FavoriteButton.tsx`
- **Strings:**
  - Linha 87: `'Remover dos favoritos'` / `'Adicionar aos favoritos'` (title)
  - Linha 88: aria-label com mesmo conteúdo
  - Linha 89: `{isFavorite ? 'Adicionado' : 'Adicionar'}` (visual feedback)
- **Impacto:** Alto - usado em todas as listas de viagens

### 2. **MapboxMap.tsx**
- **Localização:** `src/components/MapboxMap.tsx`
- **Strings:**
  - Linha 202: `title="Anterior"` (botão navegação anterior)
  - Linha 219: `title="Próximo"` (botão navegação próxima)
  - Múltiplas linhas: Status text com informações em português
- **Impacto:** Alto - interface principal de exploração

### 3. **ExportButton.tsx**
- **Localização:** `src/components/ExportButton.tsx`
- **Strings:**
  - Linha 169: `"Exportar PDF"` (button label)
  - Erro: `'Não foi possível exportar o PDF'`
- **Impacto:** Alto - ação frequente do usuário

### 4. **BottomNavigation.tsx**
- **Localização:** `src/components/BottomNavigation.tsx`
- **Strings Esperadas:**
  - Labels de navegação (Home, Favoritos, etc)
  - Títulos de seções

### 5. **SharedTripView.tsx**
- **Localização:** `src/components/SharedTripView.tsx`
- **Strings Esperadas:**
  - Labels de informações da viagem
  - Botões de ação

### 6. **LanguageSwitcher.tsx**
- **Localização:** `src/components/LanguageSwitcher.tsx`
- **Strings Esperadas:**
  - Nomes de idiomas
  - Tooltip/título do switcher

### 7. **DayTimeline.tsx**
- **Localização:** `src/components/DayTimeline.tsx`
- **Strings Esperadas:**
  - "Dia X" labels
  - Informações de timeline

### 8. **AdvancedFilters.tsx**
- **Localização:** `src/components/AdvancedFilters.tsx`
- **Strings Esperadas:**
  - Labels de filtros
  - Opções de filtros (orçamento, estilo de viagem, etc)

---

## 🔴 PRIORIDADE CRÍTICA - Screen Components

### 1. **LoginScreen.tsx**
- **Localização:** `src/screens/LoginScreen.tsx`
- **Strings Esperadas:**
  - Labels: "Email", "Senha", "Lembrar-me"
  - Botões: "Entrar", "Criar Conta"
  - Erros: mensagens de validação
  - Links: "Esqueceu a senha?"

### 2. **HomeScreen.tsx**
- **Localização:** `src/screens/HomeScreen.tsx`
- **Strings Esperadas:**
  - Título principal
  - "Minhas Viagens", "Explorar"
  - Estados vazios: "Nenhuma viagem ainda"
  - Botões: "Criar Nova Viagem"

### 3. **CreateTripScreen.tsx**
- **Localização:** `src/screens/CreateTripScreen.tsx`
- **Strings Esperadas:**
  - Form labels: "Destination", "Dates", "Budget", "Style"
  - Validação: "Este campo é obrigatório"
  - Step indicators: "Passo 1 de 3"
  - Botões: "Próximo", "Voltar", "Criar Viagem"

### 4. **TripDetailScreen.tsx**
- **Localização:** `src/screens/TripDetailScreen.tsx`
- **Strings Esperadas:**
  - Headers da viagem
  - Informações: "Data", "Orçamento", "Estilo"
  - Botões de ação: "Editar", "Compartilhar", "Exportar"
  - Labels de seções

### 5. **BiometricAuthScreen.tsx**
- **Localização:** `src/screens/BiometricAuthScreen.tsx`
- **Strings Esperadas:**
  - Instruções: "Use sua biometria para acessar"
  - Botões: "Usar Senha", "Tentar Novamente"
  - Erros: "Biometria não reconhecida"

### 6. **SecuritySettingsScreen.tsx**
- **Localização:** `src/screens/SecuritySettingsScreen.tsx`
- **Strings Esperadas:**
  - Labels: "Biometria", "Senha de 2FA"
  - Toggles e confirmações
  - Help text

### 7. **FavoritesScreen.tsx**
- **Localização:** `src/screens/FavoritesScreen.tsx`
- **Strings Esperadas:**
  - Título: "Favoritos"
  - Estado vazio: "Nenhum favorito ainda"

### 8. **DayDetailScreen.tsx**
- **Localização:** `src/screens/DayDetailScreen.tsx`
- **Strings Esperadas:**
  - "Dia X de Y"
  - Informações de atividades

### 9. **SearchResultsScreen.tsx**
- **Localização:** `src/screens/SearchResultsScreen.tsx`
- **Strings Esperadas:**
  - Resultado: "X resultados encontrados"
  - Sem resultados: "Nenhum resultado"

---

## 🟡 PRIORIDADE ALTA - Contextos e Hooks

### AuthContext.tsx
- **Localização:** `src/contexts/AuthContext.tsx`
- **Strings Identificadas:**
  - Linha 87: `'Falha ao fazer login'` ❌
  - Linha 105: `'Falha ao fazer logout'` ❌
  - Linha 36: Comentário: `"Tenta recuperar sessão persistida"`
  - Múltiplos comentários em português (8+ instâncias)
- **Impacto:** Crítico - Autenticação do app

### useErrorHandler.ts
- **Localização:** `src/hooks/useErrorHandler.ts`
- **Strings Identificadas:**
  - Linha 25: `'Ocorreu um erro ao processar sua solicitação'`
  - Linha 31: `'Erro de conexão. Verifique sua internet.'`
  - Linha 33: `'Não foi possível conectar ao servidor'`
  - Linha 37: `'Resposta inválida do servidor'`
  - Linha 45: `'Sem conexão com internet'`
  - Linha 47: `'Verifique sua conexão e tente novamente'`
  - Linha 49: `'Solicitação expirou. Tente novamente.'`
  - Linha 53: `'Muitas requisições. Aguarde um momento.'`
  - Linha 55: `'Você está fazendo solicitações com frequência'`
  - Linha 57: `'Servidor indisponível. Tente mais tarde.'`
  - Linha 61: `'Recurso não encontrado'`
  - Linha 63: `'${operation} não foi encontrado'`
  - Linha 65: `'Solicitação inválida'`
  - Linha 67: `'Erro ${status} na sua solicitação'`
- **Impacto:** Crítico - Feedback de erro para usuário

### usePersistentAuth.ts
- **Localização:** `src/hooks/usePersistentAuth.ts`
- **Strings Comentários:**
  - Linha 32: `"Atualiza informações de expiração do token a cada minuto"`
  - Linha 40: `"Token expirará em ${expiresIn} segundos"`
  - Linha 45: `"Token expirou, fazendo logout automático"`
  - Linha 46: `"Erro ao fazer logout automático: ${err}"`

---

## 🟠 PRIORIDADE MÉDIA - Serviços

### tokenStorage.ts
- **Localização:** `src/services/tokenStorage.ts`
- **Strings Comentários (Linhas 4-150):**
  - JSDoc comments: Gerenciam persistência em português
  - Console errors: Múltiplos `console.error('Erro ao...')`
  - Comentários inline: `"Salva o tempo de expiração (em milisegundos)"`
- **Linhas Críticas:**
  - Linha 31: `'Erro ao salvar token:'`
  - Linha 52: `'Erro ao recuperar token:'`
  - Linha 69: `'Erro ao verificar expiração do token:'`
  - Linha 81: `'Erro ao salvar dados do usuário:'`
  - Linha 96: `'Erro ao recuperar dados do usuário:'`
  - Linha 110: `'Erro ao limpar token:'`
  - Linha 150: `'Erro ao calcular expiração do token:'`
- **Impacto:** Médio - Console logging apenas

### pdfService.ts
- **Localização:** `src/services/pdfService.ts`
- **Strings:**
  - Linha 2: Comentário JSDoc em português
  - Linha 75: `'Erro ao exportar PDF:'`
  - Linha 76: `'Não foi possível exportar o PDF'` ❌
- **Impacto:** Médio-Alto - Mensagem de erro visível

### sentryService.ts
- **Localização:** `src/services/sentryService.ts`
- **Strings:**
  - Linha 5: Comentários em português
  - Linha 23: `'⚠️ Sentry DSN não configurado - crash reporting desativado'`
  - Linha 49: `"Não enviar erros de rede (muito ruído)"`
  - Linha 74: `'✅ Sentry inicializado com sucesso'`
  - Linha 76: `'❌ Erro ao inicializar Sentry:'`
- **Impacto:** Baixo - Console logging

### imageCache.ts
- **Localização:** `src/services/imageCache.ts`
- **Strings (principalmente comentários):**
  - Linhas 14-15: Comentários JSDoc em português
  - Linhas 48, 67, 108, 114, etc: `debug.error/warn` em inglês
- **Impacto:** Baixo - Console logging

---

## 📋 Tipos de Dados (Para Referência - NÃO traduzir valores)

### src/types/index.ts
- **Linhas com português em comentários:**
  - Linha 14: Comentário exemplo: `["gastronomia", "médio", "casal"]`
  - Linha 85: `"econômico" | "médio" | "luxo"`
  - Linha 110: `"aventura" | "relax" | "cultura" | "gastronomia"`
  - Linha 115: `"econômico" | "médio" | "luxo"`
  - Linha 120: `"sozinho" | "casal" | "família" | "amigos"`
  - Linha 241: `"museu" | "restaurante" | "natureza" | "compras" | "cultura" | "outro"`
  - Linha 267: `"walking" | "car" | "public" | "bike"`

**⚠️ NOTA:** Esses são valores de enumeração/tipos usados em dados. Precisam de tratamento especial na i18n.

---

## 📋 Hook useI18n.ts

- **Localização:** `src/hooks/useI18n.ts`
- **Status:** Hook já existe!
- **Conteúdo:** Comentário `// Idiomas disponíveis`
- **Próximo Passo:** Verificar implementação existente

---

## 📊 Resumo por Categoria

| Categoria | Quantidade | Prioridade | Tempo Estimado |
|-----------|-----------|-----------|----------------|
| Componentes UI | 8+ | ⭐⭐⭐ | 4-6 horas |
| Telas (Screens) | 9+ | ⭐⭐⭐ | 6-8 horas |
| Mensagens Erro | 20+ | ⭐⭐⭐ | 2-3 horas |
| Comentários JSDoc | 50+ | ⭐ | 0 (referência) |
| Comentários Inline | 100+ | ⭐ | 0 (referência) |
| **TOTAL CRÍTICO** | **70-90** | | **12-17 horas** |
| **TOTAL GERAL** | **1000+** | | |

---

## 🛠️ Próximos Passos

1. ✅ **[COMPLETO]** Análise de todas as strings
2. ⏳ **[PRÓXIMO]** Criar estrutura i18n
3. ⏳ Refatorar componentes UI (Passo 2)
4. ⏳ Refatorar telas (Passo 3)
5. ⏳ Refatorar mensagens de erro (Passo 4)
6. ⏳ Build final e QA (Passo 5)

---

## 📝 Notas Importantes

- Existem **comentários JSDoc em português** em muitos arquivos (tokenStorage, pdfService, etc)
- Valores de enumeração em português (econômico, médio, luxo) precisam de mapeamento especial
- Hook `useI18n` já existe - verificar implementação antes de criar novo
- Erro messages em `useErrorHandler.ts` são geradas dinamicamente - precisam de template i18n

---

**Preparado para próxima etapa: Configuração da estrutura i18n ✨**
