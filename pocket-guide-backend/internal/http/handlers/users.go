package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pocket-guide-backend/internal/http/middleware"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/pkg/response"
)

func (h *HandlerSet) UpdateMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	updated, err := h.LocalAuthService.UpdateMe(r.Context(), userID, req)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(strings.ToLower(err.Error()), "not found") {
			status = http.StatusNotFound
		}
		if strings.Contains(strings.ToLower(err.Error()), "already") {
			status = http.StatusConflict
		}
		response.Error(w, status, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, updated)
}

func (h *HandlerSet) DeleteMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	if err := h.LocalAuthService.DeleteMe(r.Context(), userID); err != nil {
		response.Error(w, http.StatusNotFound, "user not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
