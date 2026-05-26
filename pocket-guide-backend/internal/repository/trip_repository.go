package repository

import (
	"context"
	"fmt"
	"sync"
	"time"

	"pocket-guide-backend/internal/models"
)

type TripRepository interface {
	ListByUser(ctx context.Context, userID string) ([]models.Trip, error)
	Create(ctx context.Context, userID string, req models.CreateTripRequest) (models.Trip, error)
	Update(ctx context.Context, userID string, tripID string, req models.UpdateTripRequest) (models.Trip, error)
	Delete(ctx context.Context, userID string, tripID string) error
}

type MemoryTripRepository struct {
	mu    sync.RWMutex
	store map[string][]models.Trip
}

func NewMemoryTripRepository() *MemoryTripRepository {
	return &MemoryTripRepository{store: map[string][]models.Trip{}}
}

func (r *MemoryTripRepository) ListByUser(_ context.Context, userID string) ([]models.Trip, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	list := r.store[userID]
	out := make([]models.Trip, len(list))
	copy(out, list)
	return out, nil
}

func (r *MemoryTripRepository) Create(_ context.Context, userID string, req models.CreateTripRequest) (models.Trip, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	trip := models.Trip{
		ID:           generateID(),
		UserID:       userID,
		Destination:  req.Destination,
		Country:      req.Country,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Budget:       req.Budget,
		BudgetPerDay: req.BudgetPerDay,
		Tags:         req.Tags,
		Interests:    req.Interests,
		GroupType:    req.GroupType,
		TripType:     req.TripType,
		TripScope:    req.TripScope,
		TravelMonth:  req.TravelMonth,
		Itinerary:    req.Itinerary,
		CreatedAt:    time.Now().UTC(),
	}

	r.store[userID] = append(r.store[userID], trip)
	return trip, nil
}

func generateID() string {
	return time.Now().UTC().Format("20060102150405.000000")
}

func (r *MemoryTripRepository) Delete(_ context.Context, userID string, tripID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	list := r.store[userID]
	filtered := make([]models.Trip, 0, len(list))
	for _, trip := range list {
		if trip.ID != tripID {
			filtered = append(filtered, trip)
		}
	}
	r.store[userID] = filtered
	return nil
}

func (r *MemoryTripRepository) Update(_ context.Context, userID string, tripID string, req models.UpdateTripRequest) (models.Trip, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	list := r.store[userID]
	for i := range list {
		if list[i].ID != tripID {
			continue
		}

		list[i].Destination = req.Destination
		list[i].Country = req.Country
		list[i].StartDate = req.StartDate
		list[i].EndDate = req.EndDate
		list[i].Budget = req.Budget
		list[i].BudgetPerDay = req.BudgetPerDay
		list[i].Tags = req.Tags
		list[i].Interests = req.Interests
		list[i].GroupType = req.GroupType
		list[i].TripType = req.TripType
		list[i].TripScope = req.TripScope
		list[i].TravelMonth = req.TravelMonth
		list[i].Itinerary = req.Itinerary

		r.store[userID][i] = list[i]
		return list[i], nil
	}

	return models.Trip{}, fmt.Errorf("trip not found")
}
