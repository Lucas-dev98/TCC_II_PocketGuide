package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"pocket-guide-backend/internal/http/middleware"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/pkg/response"
)

func (h *HandlerSet) GenerateItinerary(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var req models.ItineraryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if req.Destination == "" {
		response.Error(w, http.StatusBadRequest, "destination is required")
		return
	}

	result, err := h.ItineraryService.Generate(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to generate itinerary")
		return
	}

	status := http.StatusOK
	if result.Queued {
		status = http.StatusAccepted
	}
	response.JSON(w, status, result)
}

func (h *HandlerSet) GetItineraryJobStatus(w http.ResponseWriter, r *http.Request) {
	jobID := chi.URLParam(r, "jobId")
	if jobID == "" {
		response.Error(w, http.StatusBadRequest, "jobId is required")
		return
	}

	status, err := h.JobStatusStore.Get(r.Context(), jobID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "job not found")
		return
	}

	response.JSON(w, http.StatusOK, status)
}
