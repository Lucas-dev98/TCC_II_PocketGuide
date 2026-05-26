package handlers

import "testing"

func TestValidateTripPayload(t *testing.T) {
	tests := []struct {
		name    string
		wantErr bool
		input   struct {
			destination  string
			startDate    string
			endDate      string
			budget       string
			budgetPerDay string
			groupType    string
			tripScope    string
		}
	}{
		{
			name:    "valid payload with budgetPerDay",
			wantErr: false,
			input: struct {
				destination  string
				startDate    string
				endDate      string
				budget       string
				budgetPerDay string
				groupType    string
				tripScope    string
			}{
				destination:  "Lisboa",
				startDate:    "2026-06-01",
				endDate:      "2026-06-05",
				budgetPerDay: "medio",
				groupType:    "casal",
				tripScope:    "internacional",
			},
		},
		{
			name:    "invalid date order",
			wantErr: true,
			input: struct {
				destination  string
				startDate    string
				endDate      string
				budget       string
				budgetPerDay string
				groupType    string
				tripScope    string
			}{
				destination:  "Lisboa",
				startDate:    "2026-06-10",
				endDate:      "2026-06-05",
				budgetPerDay: "medio",
				groupType:    "casal",
				tripScope:    "internacional",
			},
		},
		{
			name:    "invalid budget",
			wantErr: true,
			input: struct {
				destination  string
				startDate    string
				endDate      string
				budget       string
				budgetPerDay string
				groupType    string
				tripScope    string
			}{
				destination: "Porto",
				startDate:   "2026-06-01",
				endDate:     "2026-06-05",
				budget:      "invalid-budget",
				groupType:   "casal",
				tripScope:   "nacional",
			},
		},
		{
			name:    "valid ultra economical budget",
			wantErr: false,
			input: struct {
				destination  string
				startDate    string
				endDate      string
				budget       string
				budgetPerDay string
				groupType    string
				tripScope    string
			}{
				destination:  "Rio de Janeiro",
				startDate:    "2026-06-01",
				endDate:      "2026-06-05",
				budgetPerDay: "ultra-economico",
				groupType:    "solo",
				tripScope:    "nacional",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateTripPayload(
				tt.input.destination,
				tt.input.startDate,
				tt.input.endDate,
				tt.input.budget,
				tt.input.budgetPerDay,
				tt.input.groupType,
				tt.input.tripScope,
			)

			if tt.wantErr && err == nil {
				t.Fatalf("expected error, got nil")
			}

			if !tt.wantErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}
