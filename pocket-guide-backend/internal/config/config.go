package config

import (
	"os"
	"strconv"
)

type Config struct {
	AppName string
	AppEnv  string
	Port    string

	AuthBypass bool

	FirebaseProjectID string
	GoogleCredentials string

	RedisAddr     string
	RedisPassword string
	RedisDB       int
	RedisEnabled  bool

	DatabaseURL string
	UsePostgres bool

	GeminiAPIKey     string
	GeminiModel      string
	GeminiTimeoutSec int
	GeminiMaxRetries int

	RateLimitPerMin       int
	EnableItineraryWorker bool
}

func Load() Config {
	return Config{
		AppName:               getEnv("APP_NAME", "PocketGuide Backend"),
		AppEnv:                getEnv("APP_ENV", "development"),
		Port:                  getEnv("PORT", "8080"),
		AuthBypass:            getEnvBool("AUTH_BYPASS", true),
		FirebaseProjectID:     getEnv("FIREBASE_PROJECT_ID", ""),
		GoogleCredentials:     getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		RedisAddr:             getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword:         getEnv("REDIS_PASSWORD", ""),
		RedisDB:               getEnvInt("REDIS_DB", 0),
		RedisEnabled:          getEnvBool("REDIS_ENABLED", false),
		DatabaseURL:           getEnv("DATABASE_URL", ""),
		UsePostgres:           getEnvBool("USE_POSTGRES", false),
		GeminiAPIKey:          getEnv("GEMINI_API_KEY", ""),
		GeminiModel:           getEnv("GEMINI_MODEL", "gemini-2.0-flash"),
		GeminiTimeoutSec:      getEnvInt("GEMINI_TIMEOUT_SEC", 30),
		GeminiMaxRetries:      getEnvInt("GEMINI_MAX_RETRIES", 3),
		RateLimitPerMin:       getEnvInt("RATE_LIMIT_PER_MIN", 120),
		EnableItineraryWorker: getEnvBool("ENABLE_ITINERARY_WORKER", false),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	raw := getEnv(key, "")
	if raw == "" {
		return fallback
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return fallback
	}
	return value
}

func getEnvInt(key string, fallback int) int {
	raw := getEnv(key, "")
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}
