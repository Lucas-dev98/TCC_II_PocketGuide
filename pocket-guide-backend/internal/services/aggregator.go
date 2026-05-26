package services

import (
	"context"
	"log/slog"

	"pocket-guide-backend/internal/models"
)

type ExternalAggregator struct {
	logger *slog.Logger
}

func NewExternalAggregator(logger *slog.Logger) *ExternalAggregator {
	return &ExternalAggregator{logger: logger}
}

func (a *ExternalAggregator) BuildContext(ctx context.Context, destination string) (models.AggregatedContext, error) {
	_ = ctx
	a.logger.Info("aggregating external context", "destination", destination)

	// Placeholder for integrations like weather/geocoding/pricing providers.
	return models.AggregatedContext{
		WeatherHint: "Bring comfortable clothes for mixed weather.",
		Currency:    "USD",
		SafetyHint:  "Prefer main streets at night.",
	}, nil
}
