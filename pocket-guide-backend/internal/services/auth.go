package services

import (
	"context"
	"errors"
	"log/slog"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

	"pocket-guide-backend/internal/config"
)

type AuthClaims struct {
	UID   string
	Email string
}

type AuthVerifier interface {
	VerifyIDToken(ctx context.Context, idToken string) (*AuthClaims, error)
	Ready() bool
}

type FirebaseAuthService struct {
	client *auth.Client
	ready  bool
	logger *slog.Logger
}

func NewFirebaseAuthService(ctx context.Context, cfg config.Config, logger *slog.Logger) *FirebaseAuthService {
	service := &FirebaseAuthService{logger: logger}

	if cfg.AuthBypass {
		logger.Warn("auth bypass enabled; protected routes will accept dev user")
		service.ready = true
		return service
	}

	var opts []option.ClientOption
	if cfg.GoogleCredentials != "" {
		opts = append(opts, option.WithCredentialsFile(cfg.GoogleCredentials))
	}

	firebaseCfg := &firebase.Config{ProjectID: cfg.FirebaseProjectID}
	app, err := firebase.NewApp(ctx, firebaseCfg, opts...)
	if err != nil {
		logger.Error("firebase app init failed", "error", err)
		return service
	}

	client, err := app.Auth(ctx)
	if err != nil {
		logger.Error("firebase auth init failed", "error", err)
		return service
	}

	service.client = client
	service.ready = true
	return service
}

func (s *FirebaseAuthService) Ready() bool {
	return s.ready
}

func (s *FirebaseAuthService) VerifyIDToken(ctx context.Context, idToken string) (*AuthClaims, error) {
	if !s.ready || s.client == nil {
		return nil, errors.New("firebase auth unavailable")
	}

	token, err := s.client.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, err
	}

	email, _ := token.Claims["email"].(string)
	return &AuthClaims{UID: token.UID, Email: email}, nil
}
