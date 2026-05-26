package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"pocket-guide-backend/internal/models"
)

type externalPOI struct {
	Name     string
	Category string
	Location models.Location
	Distance float64
	Score    int
}

type overpassElement struct {
	Lat    float64           `json:"lat"`
	Lon    float64           `json:"lon"`
	Center *models.Location  `json:"center"`
	Tags   map[string]string `json:"tags"`
}

type overpassResponse struct {
	Elements []overpassElement `json:"elements"`
}

var overpassEndpoints = []string{
	"https://overpass-api.de/api/interpreter",
	"https://overpass.kumi.systems/api/interpreter",
	"https://overpass.openstreetmap.ru/api/interpreter",
}

func fetchExternalPOIs(ctx context.Context, destination string, limit int) ([]externalPOI, error) {
	if limit <= 0 {
		limit = 12
	}

	center, err := resolveDestinationCoordinates(ctx, destination)
	if err != nil {
		return nil, err
	}

	query := fmt.Sprintf(`[out:json][timeout:14];
(
	node(around:5000,%f,%f)[tourism~"^(attraction|museum|gallery|viewpoint|zoo|aquarium|theme_park)$"];
	way(around:5000,%f,%f)[tourism~"^(attraction|museum|gallery|viewpoint|zoo|aquarium|theme_park)$"];
	relation(around:5000,%f,%f)[tourism~"^(attraction|museum|gallery|viewpoint|zoo|aquarium|theme_park)$"];

	node(around:5000,%f,%f)[historic];
	way(around:5000,%f,%f)[historic];
	relation(around:5000,%f,%f)[historic];

	node(around:5000,%f,%f)[leisure~"^(park|garden|nature_reserve|beach_resort|marina)$"];
	way(around:5000,%f,%f)[leisure~"^(park|garden|nature_reserve|beach_resort|marina)$"];

	node(around:5000,%f,%f)[amenity~"^(restaurant|cafe|bar|pub|marketplace)$"];
	way(around:5000,%f,%f)[amenity~"^(restaurant|cafe|bar|pub|marketplace)$"];

	node(around:5000,%f,%f)[natural~"^(beach|peak|waterfall)$"];
	way(around:5000,%f,%f)[natural~"^(beach|peak|waterfall)$"];
);
out center tags 140;`,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
		center.Lat, center.Lng,
	)

	var payload overpassResponse
	var lastErr error

	for _, endpoint := range overpassEndpoints {
		timeoutCtx, cancel := context.WithTimeout(ctx, 7*time.Second)
		req, err := http.NewRequestWithContext(timeoutCtx, http.MethodPost, endpoint, bytes.NewBufferString(query))
		if err != nil {
			cancel()
			lastErr = err
			continue
		}
		req.Header.Set("Content-Type", "text/plain")
		req.Header.Set("User-Agent", "PocketGuide/1.0 itinerary-backend")

		client := &http.Client{Timeout: 7 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			cancel()
			lastErr = err
			continue
		}

		if resp.StatusCode >= 400 {
			_ = resp.Body.Close()
			cancel()
			lastErr = fmt.Errorf("overpass status %d on %s", resp.StatusCode, endpoint)
			continue
		}

		decodeErr := json.NewDecoder(resp.Body).Decode(&payload)
		_ = resp.Body.Close()
		cancel()
		if decodeErr != nil {
			lastErr = decodeErr
			continue
		}

		if len(payload.Elements) > 0 {
			lastErr = nil
			break
		}
	}

	if len(payload.Elements) == 0 && lastErr != nil {
		wikiPOIs, wikiErr := fetchWikipediaPOIs(ctx, center, destination, limit)
		if wikiErr != nil || len(wikiPOIs) == 0 {
			return nil, lastErr
		}
		return wikiPOIs, nil
	}

	pois := make([]externalPOI, 0, len(payload.Elements))
	seen := make(map[string]struct{})

	for _, el := range payload.Elements {
		name := strings.TrimSpace(el.Tags["name"])
		if name == "" {
			continue
		}

		if shouldExcludePOI(name, el.Tags) {
			continue
		}

		lat, lng, ok := elementCoordinates(el)
		if !ok {
			continue
		}

		key := strings.ToLower(name)
		if _, ok := seen[key]; ok {
			continue
		}

		category := classifyPOICategory(el.Tags)
		if category == "" {
			continue
		}

		seen[key] = struct{}{}
		distance := haversineKm(center.Lat, center.Lng, lat, lng)
		score := scorePOI(name, el.Tags, category, distance)
		if score < 30 {
			continue
		}

		pois = append(pois, externalPOI{
			Name:     name,
			Category: category,
			Location: models.Location{Lat: lat, Lng: lng},
			Distance: distance,
			Score:    score,
		})
	}

	sort.Slice(pois, func(i, j int) bool {
		if pois[i].Score == pois[j].Score {
			if pois[i].Distance == pois[j].Distance {
				return pois[i].Name < pois[j].Name
			}
			return pois[i].Distance < pois[j].Distance
		}
		return pois[i].Score > pois[j].Score
	})

	if len(pois) > limit {
		pois = pois[:limit]
	}

	if len(pois) < limit/2 {
		wikiPOIs, wikiErr := fetchWikipediaPOIs(ctx, center, destination, limit-len(pois))
		if wikiErr == nil && len(wikiPOIs) > 0 {
			for _, wpoi := range wikiPOIs {
				key := strings.ToLower(strings.TrimSpace(wpoi.Name))
				if _, exists := seen[key]; exists {
					continue
				}
				seen[key] = struct{}{}
				pois = append(pois, wpoi)
			}

			sort.Slice(pois, func(i, j int) bool {
				if pois[i].Score == pois[j].Score {
					if pois[i].Distance == pois[j].Distance {
						return pois[i].Name < pois[j].Name
					}
					return pois[i].Distance < pois[j].Distance
				}
				return pois[i].Score > pois[j].Score
			})

			if len(pois) > limit {
				pois = pois[:limit]
			}
		}
	}

	return pois, nil
}

func fetchWikipediaPOIs(ctx context.Context, center models.Location, destination string, limit int) ([]externalPOI, error) {
	if limit <= 0 {
		limit = 10
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, 6*time.Second)
	defer cancel()

	geoURL := fmt.Sprintf(
		"https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=%f|%f&gsradius=10000&gslimit=%d&format=json",
		center.Lat,
		center.Lng,
		limit,
	)

	req, err := http.NewRequestWithContext(timeoutCtx, http.MethodGet, geoURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "PocketGuide/1.0 itinerary-backend")

	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("wikipedia status %d", resp.StatusCode)
	}

	type wikiGeoItem struct {
		Title string  `json:"title"`
		Lat   float64 `json:"lat"`
		Lon   float64 `json:"lon"`
		Dist  float64 `json:"dist"`
	}

	type wikiGeoResponse struct {
		Query struct {
			Geosearch []wikiGeoItem `json:"geosearch"`
		} `json:"query"`
	}

	var payload wikiGeoResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, err
	}

	if len(payload.Query.Geosearch) == 0 {
		return nil, fmt.Errorf("no wikipedia pois for %s", destination)
	}

	pois := make([]externalPOI, 0, len(payload.Query.Geosearch))
	seen := make(map[string]struct{})
	for _, item := range payload.Query.Geosearch {
		name := strings.TrimSpace(item.Title)
		if name == "" {
			continue
		}
		if shouldExcludePOI(name, map[string]string{}) {
			continue
		}

		key := strings.ToLower(name)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}

		category := classifyWikipediaTitle(name)
		distance := haversineKm(center.Lat, center.Lng, item.Lat, item.Lon)
		score := 60 - int(math.Min(distance*4, 25))

		pois = append(pois, externalPOI{
			Name:     name,
			Category: category,
			Location: models.Location{Lat: item.Lat, Lng: item.Lon},
			Distance: distance,
			Score:    score,
		})
	}

	return pois, nil
}

func classifyWikipediaTitle(title string) string {
	n := strings.ToLower(title)
	switch {
	case strings.Contains(n, "museum"), strings.Contains(n, "museu"), strings.Contains(n, "church"), strings.Contains(n, "cathedral"), strings.Contains(n, "fort"):
		return "Culture"
	case strings.Contains(n, "beach"), strings.Contains(n, "praia"), strings.Contains(n, "park"), strings.Contains(n, "jardim"), strings.Contains(n, "mount"):
		return "Nature"
	case strings.Contains(n, "market"), strings.Contains(n, "mercado"), strings.Contains(n, "restaurant"):
		return "Food"
	default:
		return "Exploration"
	}
}

func elementCoordinates(el overpassElement) (float64, float64, bool) {
	if el.Lat != 0 && el.Lon != 0 {
		return el.Lat, el.Lon, true
	}

	if el.Center != nil {
		if el.Center.Lat != 0 && el.Center.Lng != 0 {
			return el.Center.Lat, el.Center.Lng, true
		}
	}

	return 0, 0, false
}

func shouldExcludePOI(name string, tags map[string]string) bool {
	if len(strings.TrimSpace(name)) < 3 {
		return true
	}

	amenity := strings.ToLower(tags["amenity"])
	if amenity != "" {
		disallowedAmenities := map[string]struct{}{
			"school":       {},
			"university":   {},
			"college":      {},
			"hospital":     {},
			"clinic":       {},
			"pharmacy":     {},
			"bank":         {},
			"atm":          {},
			"fuel":         {},
			"parking":      {},
			"toilets":      {},
			"bus_station":  {},
			"fire_station": {},
			"police":       {},
		}
		if _, blocked := disallowedAmenities[amenity]; blocked {
			return true
		}
	}

	normalizedName := strings.ToLower(strings.TrimSpace(name))
	disallowedNameParts := []string{
		"university",
		"faculdade",
		"escola",
		"hospital",
		"posto",
		"delegacia",
		"tribunal",
		"secretaria",
		"ministério",
		"foundation",
		"fundação",
	}

	for _, part := range disallowedNameParts {
		if strings.Contains(normalizedName, part) {
			return true
		}
	}

	return false
}

func scorePOI(name string, tags map[string]string, category string, distance float64) int {
	score := 50

	tourism := strings.ToLower(tags["tourism"])
	amenity := strings.ToLower(tags["amenity"])
	leisure := strings.ToLower(tags["leisure"])
	historic := strings.ToLower(tags["historic"])
	natural := strings.ToLower(tags["natural"])

	switch tourism {
	case "attraction", "museum", "gallery", "viewpoint", "zoo", "aquarium", "theme_park":
		score += 45
	case "artwork":
		score += 20
	}

	if historic != "" {
		score += 28
	}

	switch leisure {
	case "park", "garden", "nature_reserve", "beach_resort", "marina":
		score += 24
	}

	switch amenity {
	case "restaurant", "cafe", "bar", "pub", "marketplace":
		score += 18
	}

	switch natural {
	case "beach", "peak", "waterfall":
		score += 20
	}

	if strings.TrimSpace(tags["wikipedia"]) != "" || strings.TrimSpace(tags["wikidata"]) != "" {
		score += 16
	}

	if strings.TrimSpace(tags["opening_hours"]) != "" {
		score += 8
	}

	if len(strings.Fields(name)) >= 2 {
		score += 5
	}

	if category == "Culture" && (tourism == "museum" || historic != "") {
		score += 8
	}

	if distance > 0 {
		score -= int(math.Min(distance*5, 35))
	}

	return score
}

func resolveDestinationCoordinates(ctx context.Context, destination string) (models.Location, error) {
	if base, ok := baseCoordinatesForDestination(destination); ok {
		return base, nil
	}

	timeoutCtx, cancel := context.WithTimeout(ctx, 6*time.Second)
	defer cancel()

	nominatimURL := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json&limit=1", url.QueryEscape(destination))
	req, err := http.NewRequestWithContext(timeoutCtx, http.MethodGet, nominatimURL, nil)
	if err != nil {
		return models.Location{}, err
	}
	req.Header.Set("User-Agent", "PocketGuide/1.0 itinerary-backend")

	client := &http.Client{Timeout: 6 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return models.Location{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return models.Location{}, fmt.Errorf("nominatim status %d", resp.StatusCode)
	}

	type nominatimResult struct {
		Lat string `json:"lat"`
		Lon string `json:"lon"`
	}

	var rows []nominatimResult
	if err := json.NewDecoder(resp.Body).Decode(&rows); err != nil {
		return models.Location{}, err
	}
	if len(rows) == 0 {
		return models.Location{}, fmt.Errorf("destination not found")
	}

	lat, err := strconv.ParseFloat(rows[0].Lat, 64)
	if err != nil {
		return models.Location{}, err
	}
	lng, err := strconv.ParseFloat(rows[0].Lon, 64)
	if err != nil {
		return models.Location{}, err
	}

	return models.Location{Lat: lat, Lng: lng}, nil
}

func classifyPOICategory(tags map[string]string) string {
	tourism := strings.ToLower(tags["tourism"])
	amenity := strings.ToLower(tags["amenity"])
	historic := strings.ToLower(tags["historic"])
	leisure := strings.ToLower(tags["leisure"])
	natural := strings.ToLower(tags["natural"])

	switch {
	case amenity == "restaurant" || amenity == "cafe" || amenity == "bar" || amenity == "marketplace" || amenity == "pub":
		return "Food"
	case tourism == "museum" || tourism == "gallery" || tourism == "attraction" || tourism == "artwork" || tourism == "theme_park" || tourism == "zoo" || tourism == "aquarium" || amenity == "theatre" || amenity == "arts_centre" || historic != "":
		return "Culture"
	case leisure == "park" || leisure == "nature_reserve" || leisure == "beach_resort" || leisure == "marina" || natural == "beach":
		return "Nature"
	case tourism != "" || amenity != "" || leisure != "" || natural != "":
		return "Exploration"
	default:
		return ""
	}
}

func haversineKm(lat1, lon1, lat2, lon2 float64) float64 {
	const r = 6371.0
	toRad := func(v float64) float64 { return v * math.Pi / 180 }

	dLat := toRad(lat2 - lat1)
	dLon := toRad(lon2 - lon1)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(toRad(lat1))*math.Cos(toRad(lat2))*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return r * c
}
