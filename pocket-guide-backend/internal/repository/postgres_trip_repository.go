package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"pocket-guide-backend/internal/models"
)

type PostgresTripRepository struct {
	db *sql.DB
}

func NewPostgresTripRepository(databaseURL string) (*PostgresTripRepository, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, err
	}

	repo := &PostgresTripRepository{db: db}
	if err := repo.pingAndMigrate(context.Background()); err != nil {
		return nil, err
	}

	return repo, nil
}

func (r *PostgresTripRepository) pingAndMigrate(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := r.db.PingContext(ctx); err != nil {
		return err
	}

	query := `
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  country TEXT,
  start_date TEXT,
  end_date TEXT,
  budget TEXT,
  budget_per_day TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  group_type TEXT,
  trip_type TEXT,
  trip_scope TEXT,
  travel_month TEXT,
  itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
`
	_, err := r.db.ExecContext(ctx, query)
	return err
}

func (r *PostgresTripRepository) ListByUser(ctx context.Context, userID string) ([]models.Trip, error) {
	rows, err := r.db.QueryContext(ctx, `
SELECT id, user_id, destination, COALESCE(country, ''), COALESCE(start_date, ''), COALESCE(end_date, ''),
       COALESCE(budget, ''), COALESCE(budget_per_day, ''), tags, interests,
       COALESCE(group_type, ''), COALESCE(trip_type, ''), COALESCE(trip_scope, ''), COALESCE(travel_month, ''), itinerary, created_at
FROM trips
WHERE user_id = $1
ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.Trip, 0)
	for rows.Next() {
		var trip models.Trip
		var tagsRaw []byte
		var interestsRaw []byte
		var itineraryRaw []byte

		err := rows.Scan(
			&trip.ID,
			&trip.UserID,
			&trip.Destination,
			&trip.Country,
			&trip.StartDate,
			&trip.EndDate,
			&trip.Budget,
			&trip.BudgetPerDay,
			&tagsRaw,
			&interestsRaw,
			&trip.GroupType,
			&trip.TripType,
			&trip.TripScope,
			&trip.TravelMonth,
			&itineraryRaw,
			&trip.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		_ = json.Unmarshal(tagsRaw, &trip.Tags)
		_ = json.Unmarshal(interestsRaw, &trip.Interests)
		trip.Itinerary = decodeItineraryJSONB(itineraryRaw)

		items = append(items, trip)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func decodeItineraryJSONB(raw []byte) []models.ItineraryItem {
	if len(raw) == 0 {
		return nil
	}

	var direct []models.ItineraryItem
	if err := json.Unmarshal(raw, &direct); err == nil {
		return direct
	}

	// Legacy rows can contain a JSON string instead of a JSON array.
	var legacyString string
	if err := json.Unmarshal(raw, &legacyString); err == nil {
		return parseLegacyItineraryString(legacyString)
	}

	return nil
}

func parseLegacyItineraryString(value string) []models.ItineraryItem {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil
	}

	if parsed := parseItineraryItemsFromString(value); len(parsed) > 0 {
		return parsed
	}

	// Some old payloads duplicate quotes like {""day"":1}.
	normalized := strings.ReplaceAll(value, `""`, `"`)
	if parsed := parseItineraryItemsFromString(normalized); len(parsed) > 0 {
		return parsed
	}

	// Fallback for concatenated arrays in one string.
	segments := splitJSONArraySegments(normalized)
	if len(segments) == 0 {
		return nil
	}

	merged := make([]models.ItineraryItem, 0)
	for _, segment := range segments {
		if parsed := parseItineraryItemsFromString(segment); len(parsed) > 0 {
			merged = append(merged, parsed...)
		}
	}

	if len(merged) == 0 {
		return nil
	}

	return merged
}

func parseItineraryItemsFromString(value string) []models.ItineraryItem {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}

	var direct []models.ItineraryItem
	if err := json.Unmarshal([]byte(trimmed), &direct); err == nil && len(direct) > 0 {
		return direct
	}

	var wrapper struct {
		Items     []models.ItineraryItem `json:"items"`
		Itinerary []models.ItineraryItem `json:"itinerary"`
	}
	if err := json.Unmarshal([]byte(trimmed), &wrapper); err == nil {
		if len(wrapper.Items) > 0 {
			return wrapper.Items
		}
		if len(wrapper.Itinerary) > 0 {
			return wrapper.Itinerary
		}
	}

	// Nested JSON string.
	var nested string
	if err := json.Unmarshal([]byte(trimmed), &nested); err == nil {
		return parseItineraryItemsFromString(nested)
	}

	return nil
}

func splitJSONArraySegments(value string) []string {
	segments := make([]string, 0)
	depth := 0
	start := -1
	inString := false
	escaped := false

	for i := 0; i < len(value); i++ {
		ch := value[i]

		if escaped {
			escaped = false
			continue
		}

		if ch == '\\' {
			escaped = true
			continue
		}

		if ch == '"' {
			inString = !inString
			continue
		}

		if inString {
			continue
		}

		if ch == '[' {
			if depth == 0 {
				start = i
			}
			depth++
			continue
		}

		if ch == ']' {
			depth--
			if depth == 0 && start >= 0 {
				segments = append(segments, value[start:i+1])
				start = -1
			}
		}
	}

	return segments
}

func (r *PostgresTripRepository) Create(ctx context.Context, userID string, req models.CreateTripRequest) (models.Trip, error) {
	tagsRaw, _ := json.Marshal(req.Tags)
	interestsRaw, _ := json.Marshal(req.Interests)
	itineraryRaw, _ := json.Marshal(req.Itinerary)

	trip := models.Trip{
		ID:           generateID(),
		UserID:       userID,
		Destination:  req.Destination,
		Country:      req.Country,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Budget:       req.Budget,
		BudgetPerDay: req.BudgetPerDay,
		Tags:         req.Tags,
		Interests:    req.Interests,
		GroupType:    req.GroupType,
		TripType:     req.TripType,
		TripScope:    req.TripScope,
		TravelMonth:  req.TravelMonth,
		Itinerary:    req.Itinerary,
		CreatedAt:    time.Now().UTC(),
	}

	_, err := r.db.ExecContext(ctx, `
INSERT INTO trips (
  id, user_id, destination, country, start_date, end_date, budget, budget_per_day,
  tags, interests, group_type, trip_type, trip_scope, travel_month, itinerary, created_at
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15::jsonb,$16)
`, trip.ID, trip.UserID, trip.Destination, trip.Country, trip.StartDate, trip.EndDate, trip.Budget, trip.BudgetPerDay,
		string(tagsRaw), string(interestsRaw), trip.GroupType, trip.TripType, trip.TripScope, trip.TravelMonth, string(itineraryRaw), trip.CreatedAt)
	if err != nil {
		return models.Trip{}, err
	}

	return trip, nil
}

func (r *PostgresTripRepository) Delete(ctx context.Context, userID string, tripID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM trips WHERE id = $1 AND user_id = $2`, tripID, userID)
	if err != nil {
		return err
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		return fmt.Errorf("trip not found")
	}
	return nil
}

func (r *PostgresTripRepository) Update(ctx context.Context, userID string, tripID string, req models.UpdateTripRequest) (models.Trip, error) {
	tagsRaw, _ := json.Marshal(req.Tags)
	interestsRaw, _ := json.Marshal(req.Interests)
	itineraryRaw, _ := json.Marshal(req.Itinerary)

	result, err := r.db.ExecContext(ctx, `
UPDATE trips
SET destination = $1,
    country = $2,
    start_date = $3,
    end_date = $4,
    budget = $5,
    budget_per_day = $6,
    tags = $7::jsonb,
    interests = $8::jsonb,
    group_type = $9,
    trip_type = $10,
    trip_scope = $11,
    travel_month = $12,
    itinerary = $13::jsonb
WHERE id = $14 AND user_id = $15
`, req.Destination, req.Country, req.StartDate, req.EndDate, req.Budget, req.BudgetPerDay,
		string(tagsRaw), string(interestsRaw), req.GroupType, req.TripType, req.TripScope, req.TravelMonth, string(itineraryRaw), tripID, userID)
	if err != nil {
		return models.Trip{}, err
	}

	count, _ := result.RowsAffected()
	if count == 0 {
		return models.Trip{}, fmt.Errorf("trip not found")
	}

	trip := models.Trip{
		ID:           tripID,
		UserID:       userID,
		Destination:  req.Destination,
		Country:      req.Country,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Budget:       req.Budget,
		BudgetPerDay: req.BudgetPerDay,
		Tags:         req.Tags,
		Interests:    req.Interests,
		GroupType:    req.GroupType,
		TripType:     req.TripType,
		TripScope:    req.TripScope,
		TravelMonth:  req.TravelMonth,
		Itinerary:    req.Itinerary,
		CreatedAt:    time.Now().UTC(),
	}

	return trip, nil
}
