package services

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"

	"pocket-guide-backend/internal/config"
)

type Cache interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value string, ttl time.Duration) error
	Delete(ctx context.Context, key string) error
	Available() bool
}

type RedisCacheService struct {
	client    *redis.Client
	available bool
}

type NoopCacheService struct{}

func NewCacheService(ctx context.Context, cfg config.Config, logger *slog.Logger) Cache {
	if !cfg.RedisEnabled {
		logger.Warn("redis disabled; cache will run in noop mode")
		return &NoopCacheService{}
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Error("redis unavailable; cache fallback to noop", "error", err)
		return &NoopCacheService{}
	}

	logger.Info("redis cache connected", "addr", cfg.RedisAddr)
	return &RedisCacheService{client: client, available: true}
}

func (s *RedisCacheService) Get(ctx context.Context, key string) (string, error) {
	value, err := s.client.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", nil
	}
	return value, err
}

func (s *RedisCacheService) Set(ctx context.Context, key string, value string, ttl time.Duration) error {
	return s.client.Set(ctx, key, value, ttl).Err()
}

func (s *RedisCacheService) Delete(ctx context.Context, key string) error {
	return s.client.Del(ctx, key).Err()
}

func (s *RedisCacheService) Available() bool {
	return s.available
}

func (s *NoopCacheService) Get(_ context.Context, _ string) (string, error) {
	return "", nil
}

func (s *NoopCacheService) Set(_ context.Context, _ string, _ string, _ time.Duration) error {
	return nil
}

func (s *NoopCacheService) Delete(_ context.Context, _ string) error {
	return nil
}

func (s *NoopCacheService) Available() bool {
	return false
}
