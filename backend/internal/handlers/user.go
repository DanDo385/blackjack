package handlers

import (
	"encoding/json"
	"net/http"
)

func GetUserSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Return demo data (no database needed)
	summary := map[string]any{
		"evPer100":       -0.8,
		"sigmaPer100":    12.4,
		"skillScore":     101.7,
		"tiltIndex":      0.32,
		"luck10d":        0.5,
		"riskAdjDelta":   7,
		"returnAdjDelta": -6,
	}
	json.NewEncoder(w).Encode(summary)
}

func GetUserHands(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Return empty array (no database needed)
	json.NewEncoder(w).Encode([]map[string]any{})
}


