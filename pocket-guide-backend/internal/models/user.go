package models

import "time"

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

type ForgotPasswordResponse struct {
	Message    string `json:"message"`
	ResetToken string `json:"resetToken,omitempty"`
}

type UpdateUserRequest struct {
	Name     string  `json:"name,omitempty"`
	Email    string  `json:"email,omitempty"`
	Password *string `json:"password,omitempty"`
}

type AuthResponse struct {
	Token     string `json:"token"`
	ExpiresIn int64  `json:"expiresIn"`
	User      User   `json:"user"`
}
