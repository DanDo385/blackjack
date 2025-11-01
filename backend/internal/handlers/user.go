package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/DanDo385/blackjack/backend/internal/types"
)

func GetUserSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get player address from query param or header (for now, use demo address)
	playerAddr := r.URL.Query().Get("player")
	if playerAddr == "" {
		playerAddr = "0x0000000000000000000000000000000000000000" // demo
	}

	// Try cache first
	ctx := context.Background()
	cacheKey := "cache:user:" + playerAddr + ":summary"
	if cached, err := storage.RDB.Get(ctx, cacheKey).Result(); err == nil {
		w.Write([]byte(cached))
		return
	}

	// Query DB
	var metrics types.UserMetrics
	err := storage.DB.QueryRow(ctx, `
		SELECT player_address, ev_per_100, sigma_per_100, skill_score, tilt_index,
		       luck_10d, risk_adj_delta, return_adj_delta, anchor, last_bet
		FROM user_metrics
		WHERE player_address = $1
	`, playerAddr).Scan(
		&metrics.PlayerAddr, &metrics.EVPer100, &metrics.SigmaPer100,
		&metrics.SkillScore, &metrics.TiltIndex, &metrics.Luck10d,
		&metrics.RiskAdjDelta, &metrics.ReturnAdjDelta, &metrics.Anchor, &metrics.LastBet,
	)

	if err != nil {
		// Return demo data if not found
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
		return
	}

	summary := map[string]any{
		"evPer100":       metrics.EVPer100,
		"sigmaPer100":    metrics.SigmaPer100,
		"skillScore":     metrics.SkillScore,
		"tiltIndex":      metrics.TiltIndex,
		"luck10d":        metrics.Luck10d,
		"riskAdjDelta":   metrics.RiskAdjDelta,
		"returnAdjDelta": metrics.ReturnAdjDelta,
	}

	// Cache for 60s
	if jsonData, err := json.Marshal(summary); err == nil {
		storage.RDB.Set(ctx, cacheKey, jsonData, 60*time.Second).Err()
	}

	json.NewEncoder(w).Encode(summary)
}

func GetUserHands(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	playerAddr := r.URL.Query().Get("player")
	if playerAddr == "" {
		playerAddr = "0x0000000000000000000000000000000000000000"
	}

	ctx := context.Background()
	rows, err := storage.DB.Query(ctx, `
		SELECT hand_id, amount, result, payout, created_at
		FROM hands
		WHERE player_address = $1
		ORDER BY created_at DESC
		LIMIT 100
	`, playerAddr)

	if err != nil {
		json.NewEncoder(w).Encode([]map[string]any{})
		return
	}
	defer rows.Close()

	var hands []map[string]any
	for rows.Next() {
		var handID int64
		var bet, payout string
		var result *string
		var createdAt time.Time

		if err := rows.Scan(&handID, &bet, &result, &payout, &createdAt); err != nil {
			continue
		}

		res := "unknown"
		if result != nil {
			res = *result
		}

		hands = append(hands, map[string]any{
			"handId": handID,
			"bet":    bet,
			"result": res,
			"payout": payout,
			"ts":     createdAt.Format(time.RFC3339),
		})
	}

	json.NewEncoder(w).Encode(hands)
}


