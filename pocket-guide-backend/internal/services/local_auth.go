package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/models"
	"pocket-guide-backend/internal/repository"
)

type LocalAuthService struct {
	users     repository.UserRepository
	jwtSecret []byte
	tokenTTL  time.Duration
	resetTTL  time.Duration
	appEnv    string
	ready     bool
	logger    *slog.Logger
}

func NewLocalAuthService(cfg config.Config, users repository.UserRepository, logger *slog.Logger) *LocalAuthService {
	secret := strings.TrimSpace(cfg.JWTSecret)
	if secret == "" {
		secret = "change-me-dev-secret"
	}

	ttlHours := cfg.JWTExpiresInHours
	if ttlHours <= 0 {
		ttlHours = 24
	}

	service := &LocalAuthService{
		users:     users,
		jwtSecret: []byte(secret),
		tokenTTL:  time.Duration(ttlHours) * time.Hour,
		resetTTL:  30 * time.Minute,
		appEnv:    strings.ToLower(strings.TrimSpace(cfg.AppEnv)),
		ready:     users != nil,
		logger:    logger,
	}

	if !service.ready {
		logger.Error("local auth unavailable: user repository is nil")
	}

	return service
}

func (s *LocalAuthService) Ready() bool {
	return s.ready
}

func (s *LocalAuthService) VerifyIDToken(_ context.Context, idToken string) (*AuthClaims, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(idToken, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	if claims.Subject == "" {
		return nil, fmt.Errorf("invalid token subject")
	}

	return &AuthClaims{UID: claims.Subject, Email: claims.Issuer}, nil
}

func (s *LocalAuthService) Register(ctx context.Context, req models.RegisterRequest) (models.AuthResponse, error) {
	name := strings.TrimSpace(req.Name)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)

	if name == "" {
		return models.AuthResponse{}, fmt.Errorf("name is required")
	}
	if email == "" {
		return models.AuthResponse{}, fmt.Errorf("email is required")
	}
	if len(password) < 6 {
		return models.AuthResponse{}, fmt.Errorf("password must be at least 6 characters")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.AuthResponse{}, err
	}

	user, err := s.users.Create(ctx, models.RegisterRequest{Name: name, Email: email, Password: password}, string(hash))
	if err != nil {
		return models.AuthResponse{}, err
	}

	token, expiresIn, err := s.buildToken(user)
	if err != nil {
		return models.AuthResponse{}, err
	}

	return models.AuthResponse{Token: token, ExpiresIn: expiresIn, User: sanitizeUser(user)}, nil
}

func (s *LocalAuthService) Login(ctx context.Context, req models.LoginRequest) (models.AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := strings.TrimSpace(req.Password)
	if email == "" || password == "" {
		return models.AuthResponse{}, fmt.Errorf("email and password are required")
	}

	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return models.AuthResponse{}, fmt.Errorf("invalid credentials")
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return models.AuthResponse{}, fmt.Errorf("invalid credentials")
	}

	token, expiresIn, err := s.buildToken(user)
	if err != nil {
		return models.AuthResponse{}, err
	}

	return models.AuthResponse{Token: token, ExpiresIn: expiresIn, User: sanitizeUser(user)}, nil
}

func (s *LocalAuthService) GetMe(ctx context.Context, userID string) (models.User, error) {
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return models.User{}, err
	}
	return sanitizeUser(user), nil
}

func (s *LocalAuthService) UpdateMe(ctx context.Context, userID string, req models.UpdateUserRequest) (models.User, error) {
	var passwordHash *string
	if req.Password != nil {
		trimmed := strings.TrimSpace(*req.Password)
		if len(trimmed) < 6 {
			return models.User{}, fmt.Errorf("password must be at least 6 characters")
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(trimmed), bcrypt.DefaultCost)
		if err != nil {
			return models.User{}, err
		}
		hashString := string(hash)
		passwordHash = &hashString
	}

	updated, err := s.users.Update(ctx, userID, req, passwordHash)
	if err != nil {
		return models.User{}, err
	}

	return sanitizeUser(updated), nil
}

func (s *LocalAuthService) DeleteMe(ctx context.Context, userID string) error {
	return s.users.Delete(ctx, userID)
}

func (s *LocalAuthService) RequestPasswordReset(ctx context.Context, req models.ForgotPasswordRequest) (models.ForgotPasswordResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" {
		return models.ForgotPasswordResponse{}, fmt.Errorf("email is required")
	}

	message := "If the email exists, password reset instructions were generated."

	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		return models.ForgotPasswordResponse{Message: message}, nil
	}

	rawToken, tokenHash, err := generateResetToken()
	if err != nil {
		return models.ForgotPasswordResponse{}, fmt.Errorf("failed to generate reset token")
	}

	expiresAt := time.Now().UTC().Add(s.resetTTL)
	if err := s.users.CreatePasswordResetToken(ctx, user.ID, tokenHash, expiresAt); err != nil {
		return models.ForgotPasswordResponse{}, err
	}

	resp := models.ForgotPasswordResponse{Message: message}
	if s.appEnv == "development" {
		resp.ResetToken = rawToken
	}

	return resp, nil
}

func (s *LocalAuthService) ResetPassword(ctx context.Context, req models.ResetPasswordRequest) error {
	token := strings.TrimSpace(req.Token)
	newPassword := strings.TrimSpace(req.NewPassword)

	if token == "" {
		return fmt.Errorf("reset token is required")
	}
	if len(newPassword) < 6 {
		return fmt.Errorf("password must be at least 6 characters")
	}

	tokenHash := hashResetToken(token)
	userID, err := s.users.ConsumePasswordResetToken(ctx, tokenHash)
	if err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.users.UpdatePasswordHash(ctx, userID, string(hash))
}

func (s *LocalAuthService) buildToken(user models.User) (string, int64, error) {
	now := time.Now().UTC()
	expiresAt := now.Add(s.tokenTTL)
	claims := jwt.RegisteredClaims{
		Subject:   user.ID,
		Issuer:    user.Email,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(expiresAt),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return signed, int64(s.tokenTTL.Seconds()), nil
}

func sanitizeUser(user models.User) models.User {
	user.PasswordHash = ""
	return user
}

func generateResetToken() (string, string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", "", err
	}

	token := hex.EncodeToString(raw)
	return token, hashResetToken(token), nil
}

func hashResetToken(token string) string {
	digest := sha256.Sum256([]byte(token))
	return hex.EncodeToString(digest[:])
}
