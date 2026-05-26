package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"pocket-guide-backend/internal/http/middleware"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/pkg/response"
)

var allowedBudgetValues = map[string]struct{}{
	"ultra-economico": {},
	"economico":       {},
	"medio":           {},
	"premium":         {},
	"luxo":            {},
	"alto":            {},
	"low":             {},
	"mid":             {},
	"high":            {},
}

var allowedGroupTypes = map[string]struct{}{
	"solo":     {},
	"casal":    {},
	"familia":  {},
	"amigos":   {},
	"group":    {},
	"couple":   {},
	"family":   {},
	"friends":  {},
	"business": {},
}

var allowedTripScopes = map[string]struct{}{
	"nacional":      {},
	"internacional": {},
	"domestic":      {},
	"international": {},
}

func normalizeValue(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func parseDate(dateStr string, fieldName string) (time.Time, error) {
	if strings.TrimSpace(dateStr) == "" {
		return time.Time{}, fmt.Errorf("%s is required", fieldName)
	}

	parsed, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("%s must be in YYYY-MM-DD format", fieldName)
	}

	return parsed, nil
}

func validateTripPayload(destination string, startDate string, endDate string, budget string, budgetPerDay string, groupType string, tripScope string) error {
	if strings.TrimSpace(destination) == "" {
		return fmt.Errorf("destination is required")
	}

	start, err := parseDate(startDate, "startDate")
	if err != nil {
		return err
	}

	end, err := parseDate(endDate, "endDate")
	if err != nil {
		return err
	}

	if end.Before(start) {
		return fmt.Errorf("endDate must be equal to or after startDate")
	}

	budgetValue := normalizeValue(budget)
	budgetPerDayValue := normalizeValue(budgetPerDay)

	if budgetValue == "" && budgetPerDayValue == "" {
		return fmt.Errorf("budget or budgetPerDay is required")
	}

	if budgetValue != "" {
		if _, ok := allowedBudgetValues[budgetValue]; !ok {
			return fmt.Errorf("invalid budget value")
		}
	}

	if budgetPerDayValue != "" {
		if _, ok := allowedBudgetValues[budgetPerDayValue]; !ok {
			return fmt.Errorf("invalid budgetPerDay value")
		}
	}

	groupTypeValue := normalizeValue(groupType)
	if groupTypeValue != "" {
		if _, ok := allowedGroupTypes[groupTypeValue]; !ok {
			return fmt.Errorf("invalid groupType value")
		}
	}

	tripScopeValue := normalizeValue(tripScope)
	if tripScopeValue != "" {
		if _, ok := allowedTripScopes[tripScopeValue]; !ok {
			return fmt.Errorf("invalid tripScope value")
		}
	}

	return nil
}

func (h *HandlerSet) ListTrips(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	trips, err := h.TripRepository.ListByUser(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to list trips")
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{"items": trips})
}

func (h *HandlerSet) CreateTrip(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var req models.CreateTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if req.Budget == "" {
		req.Budget = req.BudgetPerDay
	}

	if err := validateTripPayload(req.Destination, req.StartDate, req.EndDate, req.Budget, req.BudgetPerDay, req.GroupType, req.TripScope); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	trip, err := h.TripRepository.Create(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create trip")
		return
	}

	response.JSON(w, http.StatusCreated, trip)
}

func (h *HandlerSet) DeleteTrip(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	tripID := chi.URLParam(r, "tripId")
	if tripID == "" {
		response.Error(w, http.StatusBadRequest, "tripId is required")
		return
	}

	if err := h.TripRepository.Delete(r.Context(), userID, tripID); err != nil {
		response.Error(w, http.StatusNotFound, "trip not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *HandlerSet) UpdateTrip(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	tripID := chi.URLParam(r, "tripId")
	if tripID == "" {
		response.Error(w, http.StatusBadRequest, "tripId is required")
		return
	}

	var req models.UpdateTripRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if req.Budget == "" {
		req.Budget = req.BudgetPerDay
	}

	if err := validateTripPayload(req.Destination, req.StartDate, req.EndDate, req.Budget, req.BudgetPerDay, req.GroupType, req.TripScope); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	updated, err := h.TripRepository.Update(r.Context(), userID, tripID, req)
	if err != nil {
		response.Error(w, http.StatusNotFound, "trip not found")
		return
	}

	response.JSON(w, http.StatusOK, updated)
}
