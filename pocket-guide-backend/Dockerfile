FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/pocket-guide-backend ./cmd/api

FROM alpine:3.20

RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /home/app

COPY --from=builder /bin/pocket-guide-backend /usr/local/bin/pocket-guide-backend

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/pocket-guide-backend"]
