package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"pocket-guide-backend/internal/models"
)

type ItineraryService struct {
	cache      Cache
	queue      TaskQueue
	jobs       JobStatusStore
	aggregator *ExternalAggregator
	gemini     *GeminiClient
	logger     *slog.Logger
}

func NewItineraryService(cache Cache, queue TaskQueue, jobs JobStatusStore, aggregator *ExternalAggregator, gemini *GeminiClient, logger *slog.Logger) *ItineraryService {
	return &ItineraryService{
		cache:      cache,
		queue:      queue,
		jobs:       jobs,
		aggregator: aggregator,
		gemini:     gemini,
		logger:     logger,
	}
}

func (s *ItineraryService) Generate(ctx context.Context, userID string, req models.ItineraryRequest) (models.ItineraryResponse, error) {
	if req.Days <= 0 {
		req.Days = 3
	}
	if req.Budget == "" {
		req.Budget = "mid"
	}

	cacheKey := buildCacheKey(userID, req)
	if cached, err := s.cache.Get(ctx, cacheKey); err == nil && cached != "" {
		var response models.ItineraryResponse
		if unmarshalErr := json.Unmarshal([]byte(cached), &response); unmarshalErr == nil {
			response.Items = enrichItineraryLocations(req.Destination, response.Items)
			response.Cached = true
			return response, nil
		}
	}

	if req.Async && s.queue.Available() {
		jobID := s.jobs.NewID()
		_ = s.jobs.Set(ctx, models.ItineraryJobStatusResponse{
			JobID:     jobID,
			Status:    "queued",
			UpdatedAt: time.Now().UTC(),
		})

		if err := s.queue.EnqueueItinerary(ctx, ItineraryJob{JobID: jobID, UserID: userID, Request: req}); err != nil {
			return models.ItineraryResponse{}, err
		}
		return models.ItineraryResponse{Queued: true, JobID: jobID, Provider: "queue", GeneratedAt: time.Now().UTC()}, nil
	}

	if req.Async && !s.queue.Available() {
		s.logger.Warn("async itinerary requested but queue unavailable; falling back to sync generation")
	}

	aggContext, err := s.aggregator.BuildContext(ctx, req.Destination)
	if err != nil {
		return models.ItineraryResponse{}, err
	}

	externalPOIs, poiErr := fetchExternalPOIs(ctx, req.Destination, req.Days*8)
	if poiErr != nil {
		s.logger.Warn("external poi lookup failed; using internal fallback only", "error", poiErr)
	}

	provider := "backend-fallback"
	items := make([]models.ItineraryItem, 0)
	if s.gemini != nil && s.gemini.Enabled() {
		geminiItems, geminiErr := s.gemini.GenerateItinerary(ctx, req, aggContext)
		if geminiErr != nil {
			s.logger.Warn("gemini generation failed, fallback enabled", "error", geminiErr)
		} else {
			items = enrichItineraryLocations(req.Destination, geminiItems)
			provider = "gemini"
		}
	}

	if len(items) == 0 {
		items = fallbackItinerary(req, externalPOIs)
	}

	items = ensureUniqueItineraryItems(req, items, externalPOIs)

	response := models.ItineraryResponse{
		Items:       items,
		Cached:      false,
		Queued:      false,
		Context:     map[string]string{"weatherHint": aggContext.WeatherHint, "currency": aggContext.Currency, "safetyHint": aggContext.SafetyHint},
		Provider:    provider,
		GeneratedAt: time.Now().UTC(),
	}

	payload, err := json.Marshal(response)
	if err == nil {
		_ = s.cache.Set(ctx, cacheKey, string(payload), 30*time.Minute)
	}

	return response, nil
}

func (s *ItineraryService) GetJobStatus(ctx context.Context, jobID string) (*models.ItineraryJobStatusResponse, error) {
	return s.jobs.Get(ctx, jobID)
}

func fallbackItinerary(req models.ItineraryRequest, externalPOIs []externalPOI) []models.ItineraryItem {
	tags := normalizeTags(req.Tags)
	items := make([]models.ItineraryItem, 0, req.Days*3)
	usedNames := make(map[string]struct{})
	timeSlots := []struct {
		time string
		slot int
	}{
		{time: "09:00", slot: 0},
		{time: "13:00", slot: 1},
		{time: "18:00", slot: 2},
	}

	for day := 1; day <= req.Days; day++ {
		for _, ts := range timeSlots {
			seed := ((day - 1) * len(timeSlots)) + ts.slot
			category := categoryForSlot(tags, ts.slot)
			placeName, location := uniquePlaceForSlot(req.Destination, seed, usedNames, category, externalPOIs)

			items = append(items, models.ItineraryItem{
				Day:      day,
				Time:     ts.time,
				Name:     placeName,
				Duration: durationForSlot(ts.slot),
				Reason:   reasonForPreferences(tags, req.Budget, req.GroupType, category, day),
				Tip:      tipForPreferences(req.Budget, req.GroupType, category),
				Category: category,
				Location: location,
			})
		}
	}

	return items
}

func normalizeTags(tags []string) []string {
	if len(tags) == 0 {
		return []string{"exploration", "culture", "food"}
	}

	normalized := make([]string, 0, len(tags))
	for _, tag := range tags {
		cleaned := strings.ToLower(strings.TrimSpace(tag))
		if cleaned != "" {
			normalized = append(normalized, cleaned)
		}
	}

	if len(normalized) == 0 {
		return []string{"exploration", "culture", "food"}
	}

	return normalized
}

func categoryForSlot(tags []string, slot int) string {
	if len(tags) > 0 {
		tag := tags[slot%len(tags)]
		switch {
		case strings.Contains(tag, "gastr"), strings.Contains(tag, "food"), strings.Contains(tag, "culin"):
			return "Food"
		case strings.Contains(tag, "hist"), strings.Contains(tag, "cult"), strings.Contains(tag, "museum"):
			return "Culture"
		case strings.Contains(tag, "avent"), strings.Contains(tag, "adventure"), strings.Contains(tag, "trail"):
			return "Adventure"
		case strings.Contains(tag, "nature"), strings.Contains(tag, "praia"), strings.Contains(tag, "beach"):
			return "Nature"
		}
	}

	defaults := []string{"Exploration", "Culture", "Food"}
	return defaults[slot%len(defaults)]
}

func durationForSlot(slot int) int {
	switch slot {
	case 0:
		return 120
	case 1:
		return 150
	default:
		return 120
	}
}

func reasonForPreferences(tags []string, budget string, groupType string, category string, day int) string {
	interest := "your selected interests"
	if len(tags) > 0 {
		interest = tags[(day-1)%len(tags)]
	}

	if strings.TrimSpace(groupType) == "" {
		groupType = "group"
	}

	if strings.TrimSpace(budget) == "" {
		budget = "mid"
	}

	return fmt.Sprintf("Curated for %s travel style, with %s focus, %s experiences, and %s budget profile.", groupType, interest, strings.ToLower(category), budget)
}

func tipForPreferences(budget string, groupType string, category string) string {
	b := strings.ToLower(strings.TrimSpace(budget))
	g := strings.ToLower(strings.TrimSpace(groupType))

	if b == "economico" || b == "ultra-economico" || b == "low" {
		return "Prefer public transport and reserve tickets online for lower prices."
	}

	if g == "familia" || g == "family" {
		return fmt.Sprintf("Choose family-friendly stops and add short breaks between %s activities.", strings.ToLower(category))
	}

	return fmt.Sprintf("Book the %s activity in advance to avoid peak-hour queues.", strings.ToLower(category))
}

func uniquePlaceForSlot(destination string, seed int, usedNames map[string]struct{}, preferredCategory string, externalPOIs []externalPOI) (string, *models.Location) {
	const maxProbe = 24

	if len(externalPOIs) > 0 {
		if seed < 0 {
			seed = -seed
		}

		for pass := 0; pass < 2; pass++ {
			for probe := 0; probe < len(externalPOIs); probe++ {
				idx := (seed + probe) % len(externalPOIs)
				poi := externalPOIs[idx]
				nameKey := strings.ToLower(strings.TrimSpace(poi.Name))
				if nameKey == "" {
					continue
				}
				if _, exists := usedNames[nameKey]; exists {
					continue
				}

				if pass == 0 && preferredCategory != "" && !strings.EqualFold(preferredCategory, poi.Category) {
					continue
				}

				usedNames[nameKey] = struct{}{}
				location := &models.Location{Lat: poi.Location.Lat, Lng: poi.Location.Lng}
				return poi.Name, location
			}
		}
	}

	for probe := 0; probe < maxProbe; probe++ {
		currentSeed := seed + probe
		name := fallbackPlaceNameForDestination(destination, 1, currentSeed)
		nameKey := strings.ToLower(strings.TrimSpace(name))
		if _, exists := usedNames[nameKey]; exists {
			continue
		}

		usedNames[nameKey] = struct{}{}
		location := fallbackLocationForDestination(destination, 1, currentSeed)
		return name, location
	}

	for probe := 0; probe < maxProbe; probe++ {
		currentSeed := seed + probe
		fallbackName := specificFallbackPlaceName(destination, currentSeed)
		fallbackKey := strings.ToLower(strings.TrimSpace(fallbackName))
		if _, exists := usedNames[fallbackKey]; exists {
			continue
		}

		usedNames[fallbackKey] = struct{}{}
		location := fallbackLocationForDestination(destination, 1, currentSeed)
		return fallbackName, location
	}

	finalName := fmt.Sprintf("%s - Route %d", destinationDisplayName(destination), len(usedNames)+1)
	usedNames[strings.ToLower(finalName)] = struct{}{}
	location := fallbackLocationForDestination(destination, 1, seed)
	return finalName, location
}

func ensureUniqueItineraryItems(req models.ItineraryRequest, items []models.ItineraryItem, externalPOIs []externalPOI) []models.ItineraryItem {
	usedNames := make(map[string]struct{}, len(items))
	normalizedTags := normalizeTags(req.Tags)

	for i := range items {
		name := strings.TrimSpace(items[i].Name)
		if name == "" || shouldReplaceItineraryName(name) {
			seed := (items[i].Day * 10) + i
			replacementName, replacementLocation := uniquePlaceForSlot(req.Destination, seed, usedNames, items[i].Category, externalPOIs)
			items[i].Name = replacementName
			if items[i].Location == nil || (items[i].Location.Lat == 0 && items[i].Location.Lng == 0) {
				items[i].Location = replacementLocation
			}

			if items[i].Category == "" {
				items[i].Category = categoryForSlot(normalizedTags, i%3)
			}

			if strings.TrimSpace(items[i].Reason) == "" {
				items[i].Reason = reasonForPreferences(normalizedTags, req.Budget, req.GroupType, items[i].Category, items[i].Day)
			}

			if strings.TrimSpace(items[i].Tip) == "" {
				items[i].Tip = tipForPreferences(req.Budget, req.GroupType, items[i].Category)
			}
			continue
		}

		key := strings.ToLower(name)
		if _, exists := usedNames[key]; !exists {
			usedNames[key] = struct{}{}
			items[i].Name = name
			continue
		}

		seed := (items[i].Day * 10) + i
		replacementName, replacementLocation := uniquePlaceForSlot(req.Destination, seed, usedNames, items[i].Category, externalPOIs)
		items[i].Name = replacementName
		if items[i].Location == nil || (items[i].Location.Lat == 0 && items[i].Location.Lng == 0) {
			items[i].Location = replacementLocation
		}
	}

	return items
}

func specificFallbackPlaceName(destination string, seed int) string {
	labels := []string{
		"Historic Center Walk",
		"Cultural District Circuit",
		"Local Food Route",
		"Scenic Viewpoint Tour",
		"Museum and Heritage Route",
		"Neighborhood Discovery Walk",
		"Traditional Market Experience",
		"Waterfront Sunset Route",
		"Street Art and Culture Walk",
		"Local Gastronomy Stop",
		"Urban Nature Route",
		"Landmarks Discovery Tour",
	}

	if seed < 0 {
		seed = -seed
	}

	label := labels[seed%len(labels)]
	return fmt.Sprintf("%s - %s", label, destinationDisplayName(destination))
}

func destinationDisplayName(destination string) string {
	clean := strings.TrimSpace(destination)
	if clean == "" {
		return "City"
	}
	return clean
}

func buildCacheKey(userID string, req models.ItineraryRequest) string {
	raw, _ := json.Marshal(struct {
		Version string                  `json:"version"`
		UserID  string                  `json:"userId"`
		Req     models.ItineraryRequest `json:"req"`
	}{Version: "itinerary-v3", UserID: userID, Req: req})
	hash := sha256.Sum256(raw)
	return "itinerary:" + hex.EncodeToString(hash[:])
}
