package services

import (
	"context"
	"log/slog"
	"time"

	"pocket-guide-backend/internal/models"
)

type ItineraryWorker struct {
	queue   TaskQueue
	service *ItineraryService
	logger  *slog.Logger
}

func NewItineraryWorker(queue TaskQueue, service *ItineraryService, logger *slog.Logger) *ItineraryWorker {
	return &ItineraryWorker{queue: queue, service: service, logger: logger}
}

func (w *ItineraryWorker) Start(ctx context.Context) {
	if !w.queue.Available() {
		w.logger.Warn("worker disabled because queue is not available")
		return
	}

	for {
		select {
		case <-ctx.Done():
			w.logger.Info("itinerary worker stopped")
			return
		default:
			job, err := w.queue.DequeueItinerary(ctx, 5*time.Second)
			if err != nil {
				w.logger.Error("worker dequeue failed", "error", err)
				continue
			}
			if job == nil {
				continue
			}

			_ = w.service.jobs.Set(ctx, models.ItineraryJobStatusResponse{
				JobID:     job.JobID,
				Status:    "running",
				UpdatedAt: time.Now().UTC(),
			})

			job.Request.Async = false

			result, err := w.service.Generate(ctx, job.UserID, job.Request)
			if err != nil {
				_ = w.service.jobs.Set(ctx, models.ItineraryJobStatusResponse{
					JobID:     job.JobID,
					Status:    "failed",
					Error:     err.Error(),
					UpdatedAt: time.Now().UTC(),
				})
				w.logger.Error("worker itinerary generation failed", "error", err)
				continue
			}

			_ = w.service.jobs.Set(ctx, models.ItineraryJobStatusResponse{
				JobID:     job.JobID,
				Status:    "completed",
				Result:    &result,
				UpdatedAt: time.Now().UTC(),
			})
		}
	}
}
