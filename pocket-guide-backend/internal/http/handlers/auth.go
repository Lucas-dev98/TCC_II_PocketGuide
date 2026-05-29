package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"pocket-guide-backend/internal/http/middleware"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/pkg/response"
)

func (h *HandlerSet) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	created, err := h.LocalAuthService.Register(r.Context(), req)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(strings.ToLower(err.Error()), "already") {
			status = http.StatusConflict
		}
		response.Error(w, status, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, created)
}

func (h *HandlerSet) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	loggedIn, err := h.LocalAuthService.Login(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	response.JSON(w, http.StatusOK, loggedIn)
}

func (h *HandlerSet) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req models.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	resp, err := h.LocalAuthService.RequestPasswordReset(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, resp)
}

func (h *HandlerSet) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req models.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request payload")
		return
	}

	if err := h.LocalAuthService.ResetPassword(r.Context(), req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{"message": "password reset successful"})
}

func (h *HandlerSet) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	user, err := h.LocalAuthService.GetMe(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "user not found")
		return
	}

	response.JSON(w, http.StatusOK, user)
}
