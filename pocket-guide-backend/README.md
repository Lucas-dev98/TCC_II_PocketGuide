# Pocket Guide Backend (Go)

Backend REST modular para suportar a aplicacao web com foco em performance, seguranca e escalabilidade.

## O que esta implementado

- Arquitetura modular em Go (handlers, services, repository, middleware)
- Autenticacao Firebase no backend com validacao de ID token
- Endpoints base de viagens
- Geracao de itinerario no servidor
- Agregacao de contexto externo (estrutura pronta para provedores reais)
- Cache com Redis (fallback noop quando desabilitado)
- Rate limiting por IP
- Fila leve com Redis para geracao assincrona de itinerarios
- Persistencia real com Postgres (com fallback para memoria)
- Integracao Gemini no servidor com timeout, retry e fallback

## Estrutura

- cmd/api/main.go: bootstrap da aplicacao
- internal/config: leitura de ambiente
- internal/http: handlers, middlewares, router
- internal/services: auth firebase, cache redis, queue redis, itinerary, worker
- internal/repository: persistencia (in-memory inicial)
- internal/models: modelos de dominio e payloads
- pkg/response: helper para respostas JSON

## Variaveis de ambiente

Copie .env.example para seu ambiente e ajuste os valores.

Principais:

- PORT: porta HTTP
- AUTH_BYPASS: true para desenvolvimento sem token real
- FIREBASE_PROJECT_ID: id do projeto Firebase
- GOOGLE_APPLICATION_CREDENTIALS: caminho do JSON de credenciais (opcional se ADC configurado)
- REDIS_ENABLED: ativa cache e fila
- REDIS_ADDR, REDIS_PASSWORD, REDIS_DB
- USE_POSTGRES: ativa repositorio Postgres
- DATABASE_URL: string de conexao Postgres
- RATE_LIMIT_PER_MIN: requests por minuto por IP
- ENABLE_ITINERARY_WORKER: ativa consumidor da fila
- GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT_SEC, GEMINI_MAX_RETRIES

## Endpoints

Publico:

- GET /health

Privados (Bearer token Firebase ou AUTH_BYPASS=true):

- GET /api/v1/trips
- POST /api/v1/trips
- PUT /api/v1/trips/{tripId}
- PATCH /api/v1/trips/{tripId}
- DELETE /api/v1/trips/{tripId}
- POST /api/v1/itineraries/generate
- GET /api/v1/itineraries/jobs/{jobId}

Exemplo de payload para geracao:

{
  "destination": "Lisboa",
  "days": 3,
  "tags": ["cultura", "gastronomia"],
  "budget": "mid",
  "language": "pt-BR",
  "groupType": "couple",
  "season": "primavera",
  "tripScope": "internacional",
  "async": false
}

## Rodando localmente

1) Instale Go 1.23+
2) Entre na pasta pocket-guide-backend
3) go mod tidy
4) go run ./cmd/api

Servidor sobe em http://localhost:8080 por padrao.

## Proximos passos recomendados

- trocar repository in-memory por Postgres
- integrar provedores reais no agregador externo (weather/pricing/context)
- persistir jobs e status de processamento
- adicionar observabilidade (OpenTelemetry, metrics, tracing)
- adicionar testes unitarios e de integracao
