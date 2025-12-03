# 🧪 Test Suite Guide

## Overview

Este projeto utiliza **Vitest** como test runner com **React Testing Library** para testar componentes React.

## Estrutura de Testes

```
src/__tests__/
├── setup.ts              # Configuração global dos testes
├── components/           # Testes de componentes
│   ├── ExportButton.test.tsx
│   ├── FavoriteButton.test.tsx
│   └── ...
└── services/            # Testes de serviços
    └── pdfService.test.ts
```

## Rodando Testes

### Todos os testes
```bash
cd pocket-guide-web
npm run test
```

### Modo watch (reexecuta ao salvar)
```bash
cd pocket-guide-web
npm run test -- --watch
```

### Testes de um arquivo específico
```bash
npm run test -- ExportButton.test.tsx
```

### Testes com cobertura
```bash
cd pocket-guide-web
npm run test:coverage
```

A cobertura será gerada em `coverage/` e pode ser visualizada abrindo `coverage/index.html`.

## Estrutura de Um Teste

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Component } from '../components/Component'

vi.mock('../services/service', () => ({
  service: { method: vi.fn() }
}))

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })

  it('should handle click', () => {
    const { getByRole } = render(<Component />)
    fireEvent.click(getByRole('button'))
    expect(vi.fn()).toHaveBeenCalled()
  })
})
```

## Testes Existentes

### 1. **ExportButton.test.tsx**
- ✅ Renderização de variantes (icon, filled)
- ✅ Comportamento responsivo (hidden sm:block)
- ✅ Tamanhos (sm, md, lg)
- ✅ Funcionalidade de exportação PDF
- ✅ Tratamento de erros
- ✅ Acessibilidade (aria-labels)

### 2. **FavoriteButton.test.tsx**
- ✅ Renderização de variantes
- ✅ Comportamento responsivo
- ✅ Toggle de favorito (favorited/unfavorited)
- ✅ Transições de estado
- ✅ Tamanhos
- ✅ Acessibilidade
- ✅ Manipulação de eventos

### 3. **pdfService.test.ts**
- ✅ Geração de PDF
- ✅ Conteúdo da capa (cover page)
- ✅ Páginas de dia (day pages)
- ✅ Organização de atrações
- ✅ Ordenação por hora
- ✅ Tratamento de dados duplicados (itinerary.itinerary)
- ✅ Tratamento de campos opcionais
- ✅ Erro handling

## Mocking

### Componentes com Hooks
```typescript
vi.mock('../../hooks/useHook', () => ({
  useHook: vi.fn(() => ({
    data: 'value',
    method: vi.fn()
  }))
}))
```

### Serviços
```typescript
vi.mock('../../services/service', () => ({
  service: {
    method: vi.fn(() => Promise.resolve({ status: 'ok' }))
  }
}))
```

### Bibliotecas Externas
```typescript
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockPDF)
}))
```

## GitHub Actions Workflow

O workflow CI/CD atualizado faz:

1. **Setup**: Node.js 20 + dependências
2. **Type Check**: `npm run type-check` - Verifica tipos TypeScript
3. **Lint**: `npm run lint` - Valida estilo de código
4. **Tests**: `npm run test` - Executa todos os testes
5. **Coverage**: `npm run test:coverage` - Gera relatório de cobertura
6. **Build**: `npm run build` - Faz build da aplicação
7. **Codecov**: Envia cobertura para Codecov

### Arquivo do Workflow
`.github/workflows/test.yml`

## Configuração do Vitest

Arquivo: `vitest.config.ts`

### Recursos Configurados:
- ✅ `globals: true` - Não precisa importar describe, it, etc.
- ✅ `environment: 'jsdom'` - Para componentes React
- ✅ `setupFiles` - Setup global para testes
- ✅ Coverage com V8
- ✅ Suporte a TypeScript

## Cobertura de Testes

### Meta de Cobertura
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Visualizar Cobertura
```bash
npm run test:coverage
# Abrir coverage/index.html no navegador
```

## Boas Práticas

✅ **DO:**
- Use `screen.getByRole()` para acessibilidade
- Teste comportamento, não implementação
- Use beforeEach para limpar mocks
- Agrupe testes relacionados com describe
- Teste casos de erro

❌ **DON'T:**
- Acesse implementação interna com `__proto__` ou `_private`
- Use `fireEvent` para tudo (prefira `userEvent`)
- Deixe mocks vazios (sempre configure)
- Testes que dependem de ordem

## Troubleshooting

### "Cannot find module"
Verifique o caminho de import e aliases no `vitest.config.ts`

### Testes falhando no CI mas passando localmente
Limpe `node_modules` e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### ESM imports não funcionando
Adicione `"type": "module"` ao `package.json` (já configurado)

### Testes lentos
Use `--no-coverage` para testes rápidos durante desenvolvimento:
```bash
npm run test -- --no-coverage --watch
```

## Próximos Passos

1. ✅ Testes para ExportButton, FavoriteButton, pdfService
2. ⏳ Adicionar testes para outros componentes
3. ⏳ Testes de integração para fluxos críticos
4. ⏳ E2E tests com Playwright/Cypress

## Links Úteis

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
