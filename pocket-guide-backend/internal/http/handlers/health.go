package handlers

import (
	"net/http"
	"time"

	"pocket-guide-backend/pkg/response"
)

func (h *HandlerSet) Health(w http.ResponseWriter, _ *http.Request) {
	response.JSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"app":    h.Config.AppName,
		"env":    h.Config.AppEnv,
		"time":   time.Now().UTC(),
		"services": map[string]bool{
			"firebaseAuth": h.AuthService.Ready(),
			"cache":        h.Cache.Available(),
		},
	})
}
