package middleware

import (
	"net/http"
	"strings"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/services"
	"pocket-guide-backend/pkg/response"
)

func FirebaseAuth(cfg config.Config, verifier services.AuthVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cfg.AuthBypass {
				ctx := WithUserID(r.Context(), "dev-user")
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			if !verifier.Ready() {
				response.Error(w, http.StatusServiceUnavailable, "auth service unavailable")
				return
			}

			authHeader := r.Header.Get("Authorization")
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				response.Error(w, http.StatusUnauthorized, "missing bearer token")
				return
			}

			claims, err := verifier.VerifyIDToken(r.Context(), parts[1])
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "invalid token")
				return
			}

			ctx := WithUserID(r.Context(), claims.UID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
