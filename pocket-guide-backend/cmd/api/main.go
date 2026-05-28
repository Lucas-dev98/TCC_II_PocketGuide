package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/http/handlers"
	"pocket-guide-backend/internal/http/server"
	"pocket-guide-backend/internal/repository"
	"pocket-guide-backend/internal/services"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	ctx := context.Background()

	authService := services.NewFirebaseAuthService(ctx, cfg, logger)
	cacheService := services.NewCacheService(ctx, cfg, logger)
	jobStatusStore := services.NewCachedJobStatusStore(cacheService)
	queueService := services.NewQueueService(ctx, cfg, logger)
	aggregator := services.NewExternalAggregator(logger)
	geminiClient := services.NewGeminiClient(cfg, logger)
	itineraryService := services.NewItineraryService(cacheService, queueService, jobStatusStore, aggregator, geminiClient, logger)

	var tripRepo repository.TripRepository
	if !cfg.UsePostgres || cfg.DatabaseURL == "" {
		logger.Error("postgres is required; set USE_POSTGRES=true and DATABASE_URL")
		os.Exit(1)
	}

	pgRepo, err := repository.NewPostgresTripRepository(cfg.DatabaseURL)
	if err != nil {
		logger.Error("postgres init failed; refusing to start", "error", err)
		os.Exit(1)
	}
	tripRepo = pgRepo
	logger.Info("trip repository using postgres")

	if cfg.EnableItineraryWorker {
		worker := services.NewItineraryWorker(queueService, itineraryService, logger)
		go worker.Start(ctx)
		logger.Info("itinerary worker enabled")
	}

	h := handlers.NewHandlerSet(cfg, logger, authService, tripRepo, itineraryService, jobStatusStore, cacheService)
	router := server.NewRouter(cfg, logger, h)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("backend listening", "port", cfg.Port, "env", cfg.AppEnv)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server failed", "error", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}

	logger.Info("server stopped")
}
