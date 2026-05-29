package handlers

import (
	"log/slog"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/repository"
	"pocket-guide-backend/internal/services"
)

type HandlerSet struct {
	Config           config.Config
	Logger           *slog.Logger
	AuthService      services.AuthVerifier
	LocalAuthService *services.LocalAuthService
	UserRepository   repository.UserRepository
	TripRepository   repository.TripRepository
	ItineraryService *services.ItineraryService
	JobStatusStore   services.JobStatusStore
	Cache            services.Cache
}

func NewHandlerSet(
	cfg config.Config,
	logger *slog.Logger,
	authService *services.LocalAuthService,
	userRepository repository.UserRepository,
	tripRepository repository.TripRepository,
	itineraryService *services.ItineraryService,
	jobStatusStore services.JobStatusStore,
	cache services.Cache,
) *HandlerSet {
	return &HandlerSet{
		Config:           cfg,
		Logger:           logger,
		AuthService:      authService,
		LocalAuthService: authService,
		UserRepository:   userRepository,
		TripRepository:   tripRepository,
		ItineraryService: itineraryService,
		JobStatusStore:   jobStatusStore,
		Cache:            cache,
	}
}
