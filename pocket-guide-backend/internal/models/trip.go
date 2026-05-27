package models

import "time"

type Trip struct {
	ID           string          `json:"id"`
	UserID       string          `json:"userId"`
	Destination  string          `json:"destination"`
	Country      string          `json:"country,omitempty"`
	StartDate    string          `json:"startDate"`
	EndDate      string          `json:"endDate"`
	Budget       string          `json:"budget"`
	BudgetPerDay string          `json:"budgetPerDay,omitempty"`
	Tags         []string        `json:"tags"`
	Interests    []string        `json:"interests,omitempty"`
	GroupType    string          `json:"groupType,omitempty"`
	TripType     string          `json:"tripType,omitempty"`
	TripScope    string          `json:"tripScope,omitempty"`
	TravelMonth  string          `json:"travelMonth,omitempty"`
	Itinerary    []ItineraryItem `json:"itinerary,omitempty"`
	CreatedAt    time.Time       `json:"createdAt"`
}

type CreateTripRequest struct {
	Destination  string          `json:"destination"`
	Country      string          `json:"country,omitempty"`
	StartDate    string          `json:"startDate"`
	EndDate      string          `json:"endDate"`
	Budget       string          `json:"budget"`
	BudgetPerDay string          `json:"budgetPerDay,omitempty"`
	Tags         []string        `json:"tags"`
	Interests    []string        `json:"interests,omitempty"`
	GroupType    string          `json:"groupType,omitempty"`
	TripType     string          `json:"tripType,omitempty"`
	TripScope    string          `json:"tripScope,omitempty"`
	TravelMonth  string          `json:"travelMonth,omitempty"`
	Itinerary    []ItineraryItem `json:"itinerary,omitempty"`
}

type UpdateTripRequest struct {
	Destination  string          `json:"destination"`
	Country      string          `json:"country,omitempty"`
	StartDate    string          `json:"startDate"`
	EndDate      string          `json:"endDate"`
	Budget       string          `json:"budget"`
	BudgetPerDay string          `json:"budgetPerDay,omitempty"`
	Tags         []string        `json:"tags"`
	Interests    []string        `json:"interests,omitempty"`
	GroupType    string          `json:"groupType,omitempty"`
	TripType     string          `json:"tripType,omitempty"`
	TripScope    string          `json:"tripScope,omitempty"`
	TravelMonth  string          `json:"travelMonth,omitempty"`
	Itinerary    []ItineraryItem `json:"itinerary,omitempty"`
}

type ItineraryRequest struct {
	Destination     string   `json:"destination"`
	Days            int      `json:"days"`
	Tags            []string `json:"tags"`
	Budget          string   `json:"budget"`
	BudgetMinPerDay *float64 `json:"budgetMinPerDay,omitempty"`
	BudgetMaxPerDay *float64 `json:"budgetMaxPerDay,omitempty"`
	BudgetCurrency  string   `json:"budgetCurrency,omitempty"`
	Travelers       *int     `json:"travelers,omitempty"`
	Language        string   `json:"language"`
	GroupType       string   `json:"groupType"`
	Season          string   `json:"season"`
	TripScope       string   `json:"tripScope"`
	Async           bool     `json:"async"`
}

type ItineraryItem struct {
	Day      int       `json:"day"`
	Time     string    `json:"time"`
	Name     string    `json:"name"`
	Duration int       `json:"duration"`
	Reason   string    `json:"reason"`
	Tip      string    `json:"tip"`
	Category string    `json:"category"`
	Location *Location `json:"location,omitempty"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type ItineraryResponse struct {
	Items       []ItineraryItem   `json:"items"`
	Cached      bool              `json:"cached"`
	Queued      bool              `json:"queued"`
	JobID       string            `json:"jobId,omitempty"`
	Context     map[string]string `json:"context,omitempty"`
	Provider    string            `json:"provider"`
	GeneratedAt time.Time         `json:"generatedAt"`
}

type ItineraryJobStatusResponse struct {
	JobID     string             `json:"jobId"`
	Status    string             `json:"status"`
	Error     string             `json:"error,omitempty"`
	Result    *ItineraryResponse `json:"result,omitempty"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

type AggregatedContext struct {
	WeatherHint string `json:"weatherHint"`
	Currency    string `json:"currency"`
	SafetyHint  string `json:"safetyHint"`
}
