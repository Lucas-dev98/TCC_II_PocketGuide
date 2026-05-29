package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"pocket-guide-backend/internal/config"
	"pocket-guide-backend/internal/models"
)

type GeminiClient struct {
	apiKey     string
	model      string
	timeout    time.Duration
	maxRetries int
	httpClient *http.Client
	logger     *slog.Logger
}

func NewGeminiClient(cfg config.Config, logger *slog.Logger) *GeminiClient {
	if cfg.GeminiAPIKey == "" {
		logger.Warn("gemini disabled because GEMINI_API_KEY is empty")
		return nil
	}

	if cfg.GeminiTimeoutSec <= 0 {
		cfg.GeminiTimeoutSec = 30
	}
	if cfg.GeminiMaxRetries <= 0 {
		cfg.GeminiMaxRetries = 3
	}

	return &GeminiClient{
		apiKey:     cfg.GeminiAPIKey,
		model:      cfg.GeminiModel,
		timeout:    time.Duration(cfg.GeminiTimeoutSec) * time.Second,
		maxRetries: cfg.GeminiMaxRetries,
		httpClient: &http.Client{Timeout: time.Duration(cfg.GeminiTimeoutSec) * time.Second},
		logger:     logger,
	}
}

func (g *GeminiClient) Enabled() bool {
	return g != nil && g.apiKey != ""
}

func (g *GeminiClient) GenerateItinerary(ctx context.Context, req models.ItineraryRequest, agg models.AggregatedContext) ([]models.ItineraryItem, error) {
	if g == nil || !g.Enabled() {
		return nil, fmt.Errorf("gemini disabled")
	}

	prompt := buildGeminiPrompt(req, agg)
	endpoint := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.model, g.apiKey)

	type payloadPart struct {
		Text string `json:"text"`
	}
	type payloadContent struct {
		Parts []payloadPart `json:"parts"`
	}
	type payload struct {
		Contents         []payloadContent `json:"contents"`
		GenerationConfig struct {
			Temperature      float64 `json:"temperature"`
			ResponseMimeType string  `json:"responseMimeType"`
		} `json:"generationConfig"`
	}

	body := payload{Contents: []payloadContent{{Parts: []payloadPart{{Text: prompt}}}}}
	body.GenerationConfig.Temperature = 0.35
	body.GenerationConfig.ResponseMimeType = "application/json"

	jsonBody, _ := json.Marshal(body)

	var lastErr error
	for attempt := 1; attempt <= g.maxRetries; attempt++ {
		requestCtx, cancel := context.WithTimeout(ctx, g.timeout)
		httpReq, _ := http.NewRequestWithContext(requestCtx, http.MethodPost, endpoint, bytes.NewBuffer(jsonBody))
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := g.httpClient.Do(httpReq)
		cancel()
		if err != nil {
			lastErr = err
			g.logger.Warn("gemini request failed", "attempt", attempt, "error", err)
			time.Sleep(time.Duration(attempt) * 500 * time.Millisecond)
			continue
		}

		respBody, _ := io.ReadAll(resp.Body)
		_ = resp.Body.Close()
		if resp.StatusCode >= 400 {
			lastErr = fmt.Errorf("gemini status %d", resp.StatusCode)
			g.logger.Warn("gemini non-success response", "attempt", attempt, "status", resp.StatusCode)
			time.Sleep(time.Duration(attempt) * 500 * time.Millisecond)
			continue
		}

		items, parseErr := parseGeminiItems(respBody)
		if parseErr == nil && len(items) > 0 {
			return items, nil
		}

		lastErr = parseErr
		g.logger.Warn("gemini parse failed", "attempt", attempt, "error", parseErr)
		time.Sleep(time.Duration(attempt) * 500 * time.Millisecond)
	}

	if lastErr == nil {
		lastErr = fmt.Errorf("gemini generation failed")
	}
	return nil, lastErr
}

func buildGeminiPrompt(req models.ItineraryRequest, agg models.AggregatedContext) string {
	budgetRange := "not informed"
	if req.BudgetMinPerDay != nil || req.BudgetMaxPerDay != nil {
		currency := strings.TrimSpace(req.BudgetCurrency)
		if currency == "" {
			currency = "BRL"
		}

		minValue := "?"
		maxValue := "?"
		if req.BudgetMinPerDay != nil {
			minValue = fmt.Sprintf("%.0f", *req.BudgetMinPerDay)
		}
		if req.BudgetMaxPerDay != nil {
			maxValue = fmt.Sprintf("%.0f", *req.BudgetMaxPerDay)
		}

		budgetRange = fmt.Sprintf("%s %s-%s per day", currency, minValue, maxValue)
	}

	travelers := "not informed"
	if req.Travelers != nil && *req.Travelers > 0 {
		travelers = fmt.Sprintf("%d", *req.Travelers)
	}

	selectedInterests := "not informed"
	interestHints := ""
	destinationGuardrails := buildDestinationGuardrails(req)
	if len(req.Tags) > 0 {
		selectedInterests = strings.Join(req.Tags, ", ")
		interestHints = buildInterestHints(req.Tags)
	}

	return fmt.Sprintf(`Generate a travel itinerary in strict JSON.
Rules:
- Return ONLY valid JSON.
- Format: {"items":[...]}
- Each item fields: day(int), time(HH:mm), name(string), duration(int minutes), reason(string), tip(string), category(string), location({"lat":number,"lng":number})
- Do not return JSON as a quoted string. Return an array of objects in items.
- Create %d days for destination %q.
- Budget: %q; Group: %q; Language: %q; Season: %q; Scope: %q.
- Explicit daily budget range: %q; Travelers: %q.
- Selected interests: %q.
- Interest activity hints: %q.
- Destination disambiguation rules: %q.
- Context hints: weather=%q, currency=%q, safety=%q.
- Ensure variety across days and categories.
`, req.Days, req.Destination, req.Budget, req.GroupType, req.Language, req.Season, req.TripScope, budgetRange, travelers, selectedInterests, interestHints, destinationGuardrails, agg.WeatherHint, agg.Currency, agg.SafetyHint)
}

func buildDestinationGuardrails(req models.ItineraryRequest) string {
	destination := strings.ToLower(strings.TrimSpace(req.Destination))
	language := strings.ToLower(strings.TrimSpace(req.Language))
	scope := strings.ToLower(strings.TrimSpace(req.TripScope))

	if destination == "salvador" || destination == "salvador, bahia" {
		if scope == "nacional" || strings.HasPrefix(language, "pt") {
			return "Interpret destination as Salvador, Bahia, Brazil. Do NOT include places from El Salvador (country) and do NOT switch to Portugal."
		}
	}

	return "Use attractions only from the specified destination city/region; avoid homonymous cities in other countries unless explicitly requested."
}

func buildInterestHints(tags []string) string {
	if len(tags) == 0 {
		return "no explicit interests provided"
	}

	interestHints := make([]string, 0, len(tags))
	for _, tag := range tags {
		switch strings.ToLower(strings.TrimSpace(tag)) {
		case "mergulho", "subaquatico", "subaquático":
			interestHints = append(interestHints, "mergulho: scuba diving, snorkeling, reef tours, boat trips, underwater experiences")
		case "praia", "piscinas-naturais":
			interestHints = append(interestHints, "praia: beaches, water activities, coastal viewpoints, seaside walks")
		case "natureza":
			interestHints = append(interestHints, "natureza: parks, trails, waterfalls, wildlife, outdoor experiences")
		case "gastronomia":
			interestHints = append(interestHints, "gastronomia: local food, markets, food tours, signature restaurants")
		case "cultura", "museus":
			interestHints = append(interestHints, "cultura: museums, heritage sites, monuments, art, historical districts")
		case "aventura":
			interestHints = append(interestHints, "aventura: zip lines, rafting, hiking, climbing, adrenaline activities")
		default:
			interestHints = append(interestHints, fmt.Sprintf("%s: activities directly related to this interest", tag))
		}
	}

	return strings.Join(interestHints, " | ")
}

func parseGeminiItems(raw []byte) ([]models.ItineraryItem, error) {
	type candidatePart struct {
		Text string `json:"text"`
	}
	type candidateContent struct {
		Parts []candidatePart `json:"parts"`
	}
	type candidate struct {
		Content candidateContent `json:"content"`
	}
	type geminiResp struct {
		Candidates []candidate `json:"candidates"`
	}

	var parsed geminiResp
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, err
	}
	if len(parsed.Candidates) == 0 || len(parsed.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty gemini response")
	}

	text := strings.TrimSpace(parsed.Candidates[0].Content.Parts[0].Text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)

	type out struct {
		Items []models.ItineraryItem `json:"items"`
	}

	var wrapper out
	if err := json.Unmarshal([]byte(text), &wrapper); err == nil && len(wrapper.Items) > 0 {
		return wrapper.Items, nil
	}

	var direct []models.ItineraryItem
	if err := json.Unmarshal([]byte(text), &direct); err == nil && len(direct) > 0 {
		return direct, nil
	}

	return nil, fmt.Errorf("unable to parse itinerary json")
}
