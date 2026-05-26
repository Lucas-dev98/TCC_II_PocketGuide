package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"pocket-guide-backend/internal/models"
)

type JobStatusStore interface {
	NewID() string
	Set(ctx context.Context, status models.ItineraryJobStatusResponse) error
	Get(ctx context.Context, jobID string) (*models.ItineraryJobStatusResponse, error)
}

type MemoryJobStatusStore struct {
	mu    sync.RWMutex
	store map[string]models.ItineraryJobStatusResponse
}

func NewMemoryJobStatusStore() *MemoryJobStatusStore {
	return &MemoryJobStatusStore{store: map[string]models.ItineraryJobStatusResponse{}}
}

func (s *MemoryJobStatusStore) NewID() string {
	buf := make([]byte, 12)
	_, _ = rand.Read(buf)
	return hex.EncodeToString(buf)
}

func (s *MemoryJobStatusStore) Set(_ context.Context, status models.ItineraryJobStatusResponse) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if status.UpdatedAt.IsZero() {
		status.UpdatedAt = time.Now().UTC()
	}
	s.store[status.JobID] = status
	return nil
}

func (s *MemoryJobStatusStore) Get(_ context.Context, jobID string) (*models.ItineraryJobStatusResponse, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	status, ok := s.store[jobID]
	if !ok {
		return nil, fmt.Errorf("job not found")
	}
	copy := status
	return &copy, nil
}

type CachedJobStatusStore struct {
	cache    Cache
	fallback *MemoryJobStatusStore
}

func NewCachedJobStatusStore(cache Cache) JobStatusStore {
	return &CachedJobStatusStore{cache: cache, fallback: NewMemoryJobStatusStore()}
}

func (s *CachedJobStatusStore) NewID() string {
	return s.fallback.NewID()
}

func (s *CachedJobStatusStore) Set(ctx context.Context, status models.ItineraryJobStatusResponse) error {
	_ = s.fallback.Set(ctx, status)

	if s.cache == nil || !s.cache.Available() {
		return nil
	}

	payload, err := json.Marshal(status)
	if err != nil {
		return err
	}
	return s.cache.Set(ctx, "job-status:"+status.JobID, string(payload), 24*time.Hour)
}

func (s *CachedJobStatusStore) Get(ctx context.Context, jobID string) (*models.ItineraryJobStatusResponse, error) {
	if s.cache != nil && s.cache.Available() {
		value, err := s.cache.Get(ctx, "job-status:"+jobID)
		if err == nil && value != "" {
			var status models.ItineraryJobStatusResponse
			if unmarshalErr := json.Unmarshal([]byte(value), &status); unmarshalErr == nil {
				return &status, nil
			}
		}
	}

	return s.fallback.Get(ctx, jobID)
}
