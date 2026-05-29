package services

import (
	"strings"
	"testing"

	"pocket-guide-backend/internal/models"
)

func TestFallbackItineraryUsesPreferencesAndAvoidsImmediateDuplicates(t *testing.T) {
	req := models.ItineraryRequest{
		Destination: "Rio de Janeiro",
		Days:        2,
		Tags:        []string{"gastronomia", "cultura", "natureza"},
		Budget:      "economico",
		GroupType:   "casal",
	}

	items := fallbackItinerary(req, nil)
	if len(items) != 6 {
		t.Fatalf("expected 6 items for 2 days with 3 slots/day, got %d", len(items))
	}

	seen := map[string]struct{}{}
	for _, item := range items {
		if item.Name == "" {
			t.Fatalf("item name should not be empty")
		}
		if strings.Contains(strings.ToLower(item.Name), "local experience") {
			t.Fatalf("fallback name should not be generic: %s", item.Name)
		}
		if item.Location == nil {
			t.Fatalf("item location should not be nil")
		}
		if _, ok := seen[item.Name]; ok {
			t.Fatalf("found duplicated fallback attraction name: %s", item.Name)
		}
		seen[item.Name] = struct{}{}
	}
}

func TestEnsureUniqueItineraryItemsDeduplicatesNames(t *testing.T) {
	items := []models.ItineraryItem{
		{Day: 1, Time: "09:00", Name: "Copacabana", Category: "Nature"},
		{Day: 1, Time: "13:00", Name: "Copacabana", Category: "Nature"},
		{Day: 2, Time: "09:00", Name: "Copacabana", Category: "Nature"},
	}

	req := models.ItineraryRequest{
		Destination: "Rio de Janeiro",
		Tags:        []string{"cultura", "gastronomia"},
		Budget:      "economico",
		GroupType:   "solo",
	}

	unique := ensureUniqueItineraryItems(req, items, nil)
	seen := map[string]struct{}{}
	for _, item := range unique {
		if _, ok := seen[item.Name]; ok {
			t.Fatalf("duplicated name after deduplication: %s", item.Name)
		}
		seen[item.Name] = struct{}{}
	}
}

func TestFallbackItineraryPrefersExternalPOIs(t *testing.T) {
	req := models.ItineraryRequest{
		Destination: "Rio de Janeiro",
		Days:        1,
		Tags:        []string{"cultura", "gastronomia", "natureza"},
		Budget:      "medio",
		GroupType:   "casal",
	}

	pois := []externalPOI{
		{Name: "Museu do Amanhã", Category: "Culture", Location: models.Location{Lat: -22.8945, Lng: -43.1796}},
		{Name: "Confeitaria Colombo", Category: "Food", Location: models.Location{Lat: -22.9034, Lng: -43.1779}},
		{Name: "Parque Lage", Category: "Nature", Location: models.Location{Lat: -22.9608, Lng: -43.2122}},
		{Name: "Escadaria Selarón", Category: "Exploration", Location: models.Location{Lat: -22.9151, Lng: -43.1791}},
	}

	items := fallbackItinerary(req, pois)
	if len(items) != 3 {
		t.Fatalf("expected 3 items for one day, got %d", len(items))
	}

	names := map[string]struct{}{}
	for _, item := range items {
		names[item.Name] = struct{}{}
	}

	if _, ok := names["Museu do Amanhã"]; !ok {
		t.Fatalf("expected external poi 'Museu do Amanhã' to be used")
	}
}

func TestLooksLikeWrongDestinationNameForSalvador(t *testing.T) {
	if !looksLikeWrongDestinationName("Salvador", "Candelaria, El Salvador") {
		t.Fatalf("expected El Salvador place to be flagged for Salvador destination")
	}

	if looksLikeWrongDestinationName("Salvador", "Pelourinho") {
		t.Fatalf("expected Salvador-Bahia attraction to be accepted")
	}
}

func TestBaseCoordinatesForSalvador(t *testing.T) {
	location, ok := baseCoordinatesForDestination("Salvador")
	if !ok {
		t.Fatalf("expected base coordinates for Salvador")
	}

	if location.Lat > -12.0 || location.Lat < -14.0 {
		t.Fatalf("unexpected latitude for Salvador base: %f", location.Lat)
	}

	if location.Lng > -37.0 || location.Lng < -40.0 {
		t.Fatalf("unexpected longitude for Salvador base: %f", location.Lng)
	}
}
