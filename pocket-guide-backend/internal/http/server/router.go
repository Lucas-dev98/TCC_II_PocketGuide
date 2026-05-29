package server

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/http/handlers"
	appmiddleware "pocket-guide-backend/internal/http/middleware"
)

func NewRouter(cfg config.Config, logger *slog.Logger, h *handlers.HandlerSet) http.Handler {
	r := chi.NewRouter()

	allowedOrigins := []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:5174",
		"http://127.0.0.1:5174",
		"http://localhost:4173",
		"http://127.0.0.1:4173",
		"https://*",
	}

	if cfg.AppEnv == "development" {
		// During local development, allow LAN origins accessed via http://<local-ip>:<port>.
		allowedOrigins = append(allowedOrigins, "http://*")
	}

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(appmiddleware.RequestLogger(logger))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", h.Health)

	authMw := appmiddleware.BearerAuth(cfg, h.AuthService)
	rateLimiter := appmiddleware.NewRateLimiter(cfg.RateLimitPerMin)

	r.Route("/api/v1", func(api chi.Router) {
		api.Use(rateLimiter.Middleware)

		api.Post("/auth/register", h.Register)
		api.Post("/auth/login", h.Login)
		api.Post("/auth/forgot-password", h.ForgotPassword)
		api.Post("/auth/reset-password", h.ResetPassword)

		api.Group(func(private chi.Router) {
			private.Use(authMw)
			private.Get("/auth/me", h.Me)
			private.Get("/users/me", h.Me)
			private.Put("/users/me", h.UpdateMe)
			private.Patch("/users/me", h.UpdateMe)
			private.Delete("/users/me", h.DeleteMe)
			private.Get("/trips", h.ListTrips)
			private.Post("/trips", h.CreateTrip)
			private.Put("/trips/{tripId}", h.UpdateTrip)
			private.Patch("/trips/{tripId}", h.UpdateTrip)
			private.Delete("/trips/{tripId}", h.DeleteTrip)
			private.Post("/itineraries/generate", h.GenerateItinerary)
			private.Get("/itineraries/jobs/{jobId}", h.GetItineraryJobStatus)
		})
	})

	return r
}
