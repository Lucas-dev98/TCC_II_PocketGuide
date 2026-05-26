package services

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/models"
)

const itineraryQueueKey = "queue:itinerary:generate"

type ItineraryJob struct {
	JobID   string                  `json:"jobId"`
	UserID  string                  `json:"userId"`
	Request models.ItineraryRequest `json:"request"`
}

type TaskQueue interface {
	EnqueueItinerary(ctx context.Context, job ItineraryJob) error
	DequeueItinerary(ctx context.Context, timeout time.Duration) (*ItineraryJob, error)
	Available() bool
}

type RedisQueueService struct {
	client    *redis.Client
	available bool
}

type NoopQueueService struct{}

func NewQueueService(ctx context.Context, cfg config.Config, logger *slog.Logger) TaskQueue {
	if !cfg.RedisEnabled {
		logger.Warn("redis disabled; queue running in noop mode")
		return &NoopQueueService{}
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Error("redis unavailable; queue fallback to noop", "error", err)
		return &NoopQueueService{}
	}

	return &RedisQueueService{client: client, available: true}
}

func (s *RedisQueueService) EnqueueItinerary(ctx context.Context, job ItineraryJob) error {
	payload, err := json.Marshal(job)
	if err != nil {
		return err
	}
	return s.client.RPush(ctx, itineraryQueueKey, payload).Err()
}

func (s *RedisQueueService) DequeueItinerary(ctx context.Context, timeout time.Duration) (*ItineraryJob, error) {
	values, err := s.client.BLPop(ctx, timeout, itineraryQueueKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, nil
		}
		return nil, err
	}
	if len(values) < 2 {
		return nil, nil
	}

	var job ItineraryJob
	if err := json.Unmarshal([]byte(values[1]), &job); err != nil {
		return nil, err
	}

	return &job, nil
}

func (s *RedisQueueService) Available() bool {
	return s.available
}

func (s *NoopQueueService) EnqueueItinerary(_ context.Context, _ ItineraryJob) error {
	return nil
}

func (s *NoopQueueService) DequeueItinerary(_ context.Context, _ time.Duration) (*ItineraryJob, error) {
	return nil, nil
}

func (s *NoopQueueService) Available() bool {
	return false
}
