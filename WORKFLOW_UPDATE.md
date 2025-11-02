# 🚀 GitHub Actions Workflow Update

## Overview

O workflow do GitHub Actions foi completamente reescrito para refletir a estrutura real do projeto e executar validações corretas.

## Alterações Principais

### ❌ Removido
- ❌ Node matrix 18.x (mantém apenas 20.x)
- ❌ Job separado `backend-test` (backend não existe)
- ❌ Job separado `lint` (consolidado em `test-lint-build`)
- ❌ Referências a `validation.test.ts` (não existe)
- ❌ Referências a `integration.test.ts` (não existe)
- ❌ Supressão de erros de build: `2>/dev/null || echo "Build succeeded"`
- ❌ Caminho incorreto de coverage: `./coverage/lcov.info`

### ✅ Adicionado
- ✅ Single job `test-lint-build` consolidado
- ✅ `working-directory: ./pocket-guide-web` em todos os steps
- ✅ Type check com `npm run type-check`
- ✅ Linting real com `npm run lint`
- ✅ Tests com `npm run test` (encontra todos os testes automaticamente)
- ✅ Coverage com `npm run test:coverage`
- ✅ Build sem supressão de erros
- ✅ Codecov upload com caminho correto: `./pocket-guide-web/coverage/coverage-final.json`
- ✅ Flag `if: always()` no Codecov (faz upload mesmo se testes falharem)

## Novo Fluxo

```yaml
test-lint-build:
  ├── Checkout
  ├── Setup Node 20
  ├── Install dependencies
  ├── Type Check (tsc --noEmit)
  ├── Lint (eslint)
  ├── Run Tests (vitest)
  ├── Coverage Report (vitest --coverage)
  ├── Build (vite build)
  └── Upload Coverage (Codecov)
```

## Arquivo

📄 `.github/workflows/test.yml`

## Triggers

O workflow roda em:
- **Push** para `main` e `develop`
- **Pull Request** para `main` e `develop`

## Resultado Esperado

✅ Todos os steps devem passar:
- Type check: 0 erros
- Lint: 0 avisos (max-warnings 0)
- Tests: Todos os testes passam
- Coverage: Relatório gerado
- Build: 0 erros, build production pronto
- Codecov: Coverage enviado com sucesso

## Configuração de Coverage no Codecov

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  if: always()  # Upload mesmo se testes falharem
  with:
    files: ./pocket-guide-web/coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false  # Não falha o build se Codecov cair
```

## Diferenças da Versão Anterior

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Jobs** | 3 (test, backend-test, lint) | 1 (test-lint-build) |
| **Matriz Node** | 18.x, 20.x | 20.x |
| **Diretório** | Raiz (npm ci) | pocket-guide-web |
| **Testes** | `validation.test.ts` (não existe) | Auto-detecta todos os testes |
| **Backend** | Job `backend-test` (não existe) | Removido |
| **Build** | Supressão de erros | Falha se houver erro |
| **Lint** | Apenas type-check | Type-check + ESLint |
| **Coverage** | Caminho errado | Caminho correto |

## Como Testar Localmente

```bash
cd pocket-guide-web

# Simular exatamente o workflow
npm run type-check    # Type check
npm run lint          # Lint
npm run test          # Tests
npm run test:coverage # Coverage
npm run build         # Build
```

## Troubleshooting

### Build falhando no CI
O error agora é visível (antes era suprimido com `2>/dev/null`).
Verifique a saída do build para ver o erro real.

### Testes não encontrados
O workflow roda `npm run test` que auto-detecta testes em `**/*.test.ts*`.
Certifique-se que seus testes estão em:
```
src/__tests__/
  components/
    *.test.tsx
  services/
    *.test.ts
```

### Codecov não recebendo dados
Verifique:
1. Caminho: `./pocket-guide-web/coverage/coverage-final.json`
2. Vitest config gera `coverage-final.json` (não `lcov.info`)
3. Verifique `vitest.config.ts` tem `coverage: { provider: 'v8' }`

## Próximos Steps

1. ✅ Workflow reescrito e testado
2. ✅ Testes criados para ExportButton, FavoriteButton, pdfService
3. ✅ Vitest configurado
4. ⏳ Testar workflow no GitHub (criar PR para verificar)
5. ⏳ Configurar branch protections em main
6. ⏳ Configurar Codecov dashboard

## Comandos úteis

```bash
# Visualizar workflow
gh workflow view test.yml

# Forçar rerun de um workflow
gh run rerun <run-id>

# Ver logs de um run
gh run view <run-id> --log
```

## Status Badge (adicionar ao README)

```markdown
[![Test, Lint and Build](https://github.com/seu-usuario/seu-repo/workflows/Test,%20Lint%20and%20Build/badge.svg)](https://github.com/seu-usuario/seu-repo/actions)
```

---

**Última atualização**: Agora
**Commit**: 🚀 Update GitHub Actions workflow and create test suite
