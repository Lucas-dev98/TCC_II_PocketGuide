package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"pocket-guide-backend/internal/models"
)

type UserRepository interface {
	Create(ctx context.Context, req models.RegisterRequest, passwordHash string) (models.User, error)
	GetByID(ctx context.Context, userID string) (models.User, error)
	GetByEmail(ctx context.Context, email string) (models.User, error)
	Update(ctx context.Context, userID string, req models.UpdateUserRequest, passwordHash *string) (models.User, error)
	UpdatePasswordHash(ctx context.Context, userID string, passwordHash string) error
	CreatePasswordResetToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error
	ConsumePasswordResetToken(ctx context.Context, tokenHash string) (string, error)
	Delete(ctx context.Context, userID string) error
}

type PostgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(databaseURL string) (*PostgresUserRepository, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}

	repo := &PostgresUserRepository{db: db}
	if err := repo.pingAndMigrate(context.Background()); err != nil {
		return nil, err
	}

	return repo, nil
}

func (r *PostgresUserRepository) pingAndMigrate(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := r.db.PingContext(ctx); err != nil {
		return err
	}

	query := `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
	token_hash TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
`
	_, err := r.db.ExecContext(ctx, query)
	return err
}

func (r *PostgresUserRepository) Create(ctx context.Context, req models.RegisterRequest, passwordHash string) (models.User, error) {
	user := models.User{
		ID:           generateID(),
		Email:        strings.ToLower(strings.TrimSpace(req.Email)),
		Name:         strings.TrimSpace(req.Name),
		PasswordHash: passwordHash,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	_, err := r.db.ExecContext(ctx, `
INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6)
`, user.ID, user.Email, user.Name, user.PasswordHash, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate key") {
			return models.User{}, fmt.Errorf("email already registered")
		}
		return models.User{}, err
	}

	return user, nil
}

func (r *PostgresUserRepository) GetByID(ctx context.Context, userID string) (models.User, error) {
	var user models.User
	err := r.db.QueryRowContext(ctx, `
SELECT id, email, name, password_hash, created_at, updated_at
FROM users
WHERE id = $1
`, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.User{}, fmt.Errorf("user not found")
		}
		return models.User{}, err
	}

	return user, nil
}

func (r *PostgresUserRepository) GetByEmail(ctx context.Context, email string) (models.User, error) {
	var user models.User
	err := r.db.QueryRowContext(ctx, `
SELECT id, email, name, password_hash, created_at, updated_at
FROM users
WHERE email = $1
`, strings.ToLower(strings.TrimSpace(email))).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.User{}, fmt.Errorf("invalid credentials")
		}
		return models.User{}, err
	}

	return user, nil
}

func (r *PostgresUserRepository) Update(ctx context.Context, userID string, req models.UpdateUserRequest, passwordHash *string) (models.User, error) {
	current, err := r.GetByID(ctx, userID)
	if err != nil {
		return models.User{}, err
	}

	name := current.Name
	if strings.TrimSpace(req.Name) != "" {
		name = strings.TrimSpace(req.Name)
	}

	email := current.Email
	if strings.TrimSpace(req.Email) != "" {
		email = strings.ToLower(strings.TrimSpace(req.Email))
	}

	hash := current.PasswordHash
	if passwordHash != nil {
		hash = *passwordHash
	}

	now := time.Now().UTC()
	_, err = r.db.ExecContext(ctx, `
UPDATE users
SET name = $1,
    email = $2,
    password_hash = $3,
    updated_at = $4
WHERE id = $5
`, name, email, hash, now, userID)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate key") {
			return models.User{}, fmt.Errorf("email already registered")
		}
		return models.User{}, err
	}

	updated, err := r.GetByID(ctx, userID)
	if err != nil {
		return models.User{}, err
	}

	return updated, nil
}

func (r *PostgresUserRepository) UpdatePasswordHash(ctx context.Context, userID string, passwordHash string) error {
	result, err := r.db.ExecContext(ctx, `
UPDATE users
SET password_hash = $1,
    updated_at = $2
WHERE id = $3
`, passwordHash, time.Now().UTC(), userID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

func (r *PostgresUserRepository) CreatePasswordResetToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
VALUES ($1, $2, $3)
`, tokenHash, userID, expiresAt)
	return err
}

func (r *PostgresUserRepository) ConsumePasswordResetToken(ctx context.Context, tokenHash string) (string, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return "", err
	}
	defer tx.Rollback()

	var userID string
	var expiresAt time.Time
	err = tx.QueryRowContext(ctx, `
SELECT user_id, expires_at
FROM password_reset_tokens
WHERE token_hash = $1
FOR UPDATE
`, tokenHash).Scan(&userID, &expiresAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("invalid or expired reset token")
		}
		return "", err
	}

	if time.Now().UTC().After(expiresAt) {
		_, _ = tx.ExecContext(ctx, `DELETE FROM password_reset_tokens WHERE token_hash = $1`, tokenHash)
		return "", fmt.Errorf("invalid or expired reset token")
	}

	if _, err := tx.ExecContext(ctx, `DELETE FROM password_reset_tokens WHERE token_hash = $1`, tokenHash); err != nil {
		return "", err
	}

	if err := tx.Commit(); err != nil {
		return "", err
	}

	return userID, nil
}

func (r *PostgresUserRepository) Delete(ctx context.Context, userID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, userID)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}
