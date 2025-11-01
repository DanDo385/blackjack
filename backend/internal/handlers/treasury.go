package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/DanDo385/blackjack/backend/internal/types"
)

func GetTreasuryOverview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	ctx := context.Background()

	// Get positions
	rows, err := storage.DB.Query(ctx, `
		SELECT token, pct FROM treasury_positions
		ORDER BY recorded_at DESC
		LIMIT 5
	`)
	if err != nil {
		// Return demo data
		positions := []map[string]any{
			{"token": "USDC", "pct": 40},
			{"token": "WETH", "pct": 25},
			{"token": "WBTC", "pct": 10},
			{"token": "Perps Basis", "pct": 15},
			{"token": "LP/Yield", "pct": 10},
		}
		pnl := make([]map[string]any, 0, 60)
		base := 1000.0
		for i := 0; i < 60; i++ {
			pnl = append(pnl, map[string]any{"d": i, "v": base + float64(i)*2.0})
		}
		json.NewEncoder(w).Encode(map[string]any{
			"positions":    positions,
			"equitySeries": pnl,
		})
		return
	}
	defer rows.Close()

	var positions []types.TreasuryPosition
	for rows.Next() {
		var p types.TreasuryPosition
		rows.Scan(&p.Token, &p.Pct)
		positions = append(positions, p)
	}

	// Get equity series
	eqRows, _ := storage.DB.Query(ctx, `
		SELECT day_offset, value_usdc FROM treasury_equity
		ORDER BY day_offset ASC
		LIMIT 60
	`)
	defer eqRows.Close()

	var equity []types.TreasuryEquity
	for eqRows.Next() {
		var e types.TreasuryEquity
		eqRows.Scan(&e.DayOffset, &e.Value)
		equity = append(equity, e)
	}

	// Convert to JSON format
	posJSON := make([]map[string]any, len(positions))
	for i, p := range positions {
		posJSON[i] = map[string]any{"token": p.Token, "pct": p.Pct}
	}

	eqJSON := make([]map[string]any, len(equity))
	for i, e := range equity {
		eqJSON[i] = map[string]any{"d": e.DayOffset, "v": e.Value}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"positions":    posJSON,
		"equitySeries": eqJSON,
	})
}


