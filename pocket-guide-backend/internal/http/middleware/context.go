package middleware

import "context"

type contextKey string

const userIDKey contextKey = "user_id"

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	value, ok := ctx.Value(userIDKey).(string)
	if !ok || value == "" {
		return "", false
	}
	return value, true
}
