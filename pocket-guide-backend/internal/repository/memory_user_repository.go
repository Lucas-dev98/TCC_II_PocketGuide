package repository

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"pocket-guide-backend/internal/models"
)

type MemoryUserRepository struct {
	mu    sync.RWMutex
	store map[string]models.User
}

func NewMemoryUserRepository() *MemoryUserRepository {
	return &MemoryUserRepository{store: map[string]models.User{}}
}

func (r *MemoryUserRepository) Create(_ context.Context, req models.RegisterRequest, passwordHash string) (models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	email := strings.ToLower(strings.TrimSpace(req.Email))
	for _, existing := range r.store {
		if strings.EqualFold(existing.Email, email) {
			return models.User{}, fmt.Errorf("email already registered")
		}
	}

	now := time.Now().UTC()
	user := models.User{
		ID:           generateID(),
		Email:        email,
		Name:         strings.TrimSpace(req.Name),
		PasswordHash: passwordHash,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	r.store[user.ID] = user
	return user, nil
}

func (r *MemoryUserRepository) GetByID(_ context.Context, userID string) (models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.store[userID]
	if !ok {
		return models.User{}, fmt.Errorf("user not found")
	}
	return user, nil
}

func (r *MemoryUserRepository) GetByEmail(_ context.Context, email string) (models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.store {
		if strings.EqualFold(user.Email, strings.TrimSpace(email)) {
			return user, nil
		}
	}

	return models.User{}, fmt.Errorf("invalid credentials")
}

func (r *MemoryUserRepository) Update(_ context.Context, userID string, req models.UpdateUserRequest, passwordHash *string) (models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	user, ok := r.store[userID]
	if !ok {
		return models.User{}, fmt.Errorf("user not found")
	}

	if strings.TrimSpace(req.Name) != "" {
		user.Name = strings.TrimSpace(req.Name)
	}
	if strings.TrimSpace(req.Email) != "" {
		targetEmail := strings.ToLower(strings.TrimSpace(req.Email))
		for id, existing := range r.store {
			if id != userID && strings.EqualFold(existing.Email, targetEmail) {
				return models.User{}, fmt.Errorf("email already registered")
			}
		}
		user.Email = targetEmail
	}
	if passwordHash != nil {
		user.PasswordHash = *passwordHash
	}
	user.UpdatedAt = time.Now().UTC()

	r.store[userID] = user
	return user, nil
}

func (r *MemoryUserRepository) Delete(_ context.Context, userID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.store[userID]; !ok {
		return fmt.Errorf("user not found")
	}
	delete(r.store, userID)
	return nil
}
