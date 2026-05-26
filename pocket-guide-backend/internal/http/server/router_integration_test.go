package server

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/http/handlers"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/internal/repository"
	"pocket-guide-backend/internal/services"
)

func newTestRouter(t *testing.T) (http.Handler, services.JobStatusStore) {
	t.Helper()

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	cfg := config.Config{
		AuthBypass:      true,
		RateLimitPerMin: 1000,
	}

	tripRepo := repository.NewMemoryTripRepository()
	jobStore := services.NewMemoryJobStatusStore()
	cache := &services.NoopCacheService{}
	queue := &services.NoopQueueService{}
	aggregator := services.NewExternalAggregator(logger)
	itineraryService := services.NewItineraryService(cache, queue, jobStore, aggregator, nil, logger)

	h := handlers.NewHandlerSet(cfg, logger, nil, tripRepo, itineraryService, jobStore, cache)
	return NewRouter(cfg, logger, h), jobStore
}

func performJSONRequest(t *testing.T, handler http.Handler, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()

	var payload io.Reader
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			t.Fatalf("failed to marshal body: %v", err)
		}
		payload = bytes.NewReader(encoded)
	}

	req := httptest.NewRequest(method, path, payload)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	return rr
}

func TestTripsUpdateEndpoints_PutAndPatch(t *testing.T) {
	router, _ := newTestRouter(t)

	createReq := models.CreateTripRequest{
		Destination: "Lisbon",
		Country:     "Portugal",
		StartDate:   "2026-06-10",
		EndDate:     "2026-06-15",
		Budget:      "medio",
		Tags:        []string{"culture"},
		Interests:   []string{"museums"},
		GroupType:   "casal",
		TripType:    "cultura",
		TripScope:   "internacional",
		TravelMonth: "6",
	}

	createRes := performJSONRequest(t, router, http.MethodPost, "/api/v1/trips", createReq)
	if createRes.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusCreated, createRes.Code, createRes.Body.String())
	}

	var created models.Trip
	if err := json.Unmarshal(createRes.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode create response: %v", err)
	}
	if created.ID == "" {
		t.Fatal("expected created trip ID")
	}

	putReq := models.UpdateTripRequest{
		Destination: "Porto",
		Country:     "Portugal",
		StartDate:   "2026-06-11",
		EndDate:     "2026-06-16",
		Budget:      "luxo",
		Tags:        []string{"food"},
		Interests:   []string{"gastronomy"},
		GroupType:   "casal",
		TripType:    "gastronomia",
		TripScope:   "internacional",
		TravelMonth: "6",
	}

	putRes := performJSONRequest(t, router, http.MethodPut, "/api/v1/trips/"+created.ID, putReq)
	if putRes.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, putRes.Code, putRes.Body.String())
	}

	var putUpdated models.Trip
	if err := json.Unmarshal(putRes.Body.Bytes(), &putUpdated); err != nil {
		t.Fatalf("failed to decode put response: %v", err)
	}
	if putUpdated.Destination != "Porto" {
		t.Fatalf("expected destination Porto, got %s", putUpdated.Destination)
	}

	patchReq := models.UpdateTripRequest{
		Destination: "Coimbra",
		Country:     "Portugal",
		StartDate:   "2026-06-12",
		EndDate:     "2026-06-17",
		Budget:      "medio",
		Tags:        []string{"history"},
		Interests:   []string{"architecture"},
		GroupType:   "casal",
		TripType:    "cultura",
		TripScope:   "internacional",
		TravelMonth: "6",
	}

	patchRes := performJSONRequest(t, router, http.MethodPatch, "/api/v1/trips/"+created.ID, patchReq)
	if patchRes.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, patchRes.Code, patchRes.Body.String())
	}

	var patchUpdated models.Trip
	if err := json.Unmarshal(patchRes.Body.Bytes(), &patchUpdated); err != nil {
		t.Fatalf("failed to decode patch response: %v", err)
	}
	if patchUpdated.Destination != "Coimbra" {
		t.Fatalf("expected destination Coimbra, got %s", patchUpdated.Destination)
	}
}

func TestGetItineraryJobStatusEndpoint(t *testing.T) {
	router, jobs := newTestRouter(t)

	jobID := jobs.NewID()
	err := jobs.Set(context.Background(), models.ItineraryJobStatusResponse{
		JobID:     jobID,
		Status:    "running",
		UpdatedAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to seed job status: %v", err)
	}

	statusRes := performJSONRequest(t, router, http.MethodGet, "/api/v1/itineraries/jobs/"+jobID, nil)
	if statusRes.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, statusRes.Code, statusRes.Body.String())
	}

	var statusPayload models.ItineraryJobStatusResponse
	if err := json.Unmarshal(statusRes.Body.Bytes(), &statusPayload); err != nil {
		t.Fatalf("failed to decode status response: %v", err)
	}
	if statusPayload.JobID != jobID {
		t.Fatalf("expected jobID %s, got %s", jobID, statusPayload.JobID)
	}
	if statusPayload.Status != "running" {
		t.Fatalf("expected status running, got %s", statusPayload.Status)
	}

	notFoundRes := performJSONRequest(t, router, http.MethodGet, "/api/v1/itineraries/jobs/not-found", nil)
	if notFoundRes.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusNotFound, notFoundRes.Code, notFoundRes.Body.String())
	}
}
