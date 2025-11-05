package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/game"
)

// SaveHandStart saves a new hand when HandStarted event is received
func SaveHandStart(ctx context.Context, handID int64, playerAddr, tokenAddr, amount, vrfReqId string) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	query := `
		INSERT INTO hands (hand_id, player_address, token_address, amount, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (hand_id) DO NOTHING
	`

	_, err := DB.Exec(ctx, query, handID, playerAddr, tokenAddr, amount)
	return err
}

// UpdateHandSettlement updates a hand when HandSettled event is received
func UpdateHandSettlement(ctx context.Context, handID int64, result, payout, feeLink, feeNickelRef string, settledAt *time.Time) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	query := `
		UPDATE hands
		SET result = $1, payout = $2, fee_link = $3, fee_nickel_ref = $4, settled_at = $5
		WHERE hand_id = $6
	`

	_, err := DB.Exec(ctx, query, result, payout, feeLink, feeNickelRef, settledAt, handID)
	return err
}

// SaveHandResult saves a resolved hand result to PostgreSQL
func SaveHandResult(ctx context.Context, result *game.HandResult) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// First, ensure hand exists
	query := `
		INSERT INTO hands (hand_id, player_address, token_address, amount, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (hand_id) DO UPDATE SET
			result = $5,
			payout = $6,
			fee_link = $7,
			fee_nickel_ref = $8
	`

	_, err := DB.Exec(ctx, query,
		result.HandID,
		result.PlayerAddr,
		"", // token address - should be stored separately
		result.Payout.String(),
		result.Outcome,
		result.Payout.String(),
		result.FeeLink.String(),
		result.FeeNickelRef.String(),
	)
	return err
}

// GetHandState retrieves hand state from Redis
func GetHandState(ctx context.Context, handID int64) (map[string]interface{}, error) {
	if RDB == nil {
		return nil, fmt.Errorf("redis not initialized")
	}

	key := fmt.Sprintf("hand:%d", handID)
	val, err := RDB.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var state map[string]interface{}
	if err := json.Unmarshal([]byte(val), &state); err != nil {
		return nil, err
	}

	return state, nil
}

// SetHandState stores hand state in Redis with TTL
func SetHandState(ctx context.Context, handID int64, state map[string]interface{}, ttl time.Duration) error {
	if RDB == nil {
		return fmt.Errorf("redis not initialized")
	}

	key := fmt.Sprintf("hand:%d", handID)
	data, err := json.Marshal(state)
	if err != nil {
		return err
	}

	return RDB.Set(ctx, key, data, ttl).Err()
}

// UpdateHandState updates existing hand state in Redis
func UpdateHandState(ctx context.Context, handID int64, updates map[string]interface{}, ttl time.Duration) error {
	// Get existing state
	state, err := GetHandState(ctx, handID)
	if err != nil {
		// If not found, create new
		state = make(map[string]interface{})
	}

	// Merge updates
	for k, v := range updates {
		state[k] = v
	}

	return SetHandState(ctx, handID, state, ttl)
}

// UpdateHandSeed updates the seed field in Redis hand state
func UpdateHandSeed(ctx context.Context, handID int64, seed string) error {
	return UpdateHandState(ctx, handID, map[string]interface{}{
		"seed":   seed,
		"status": "randomness_fulfilled",
	}, 30*time.Minute)
}

// DeleteHandState removes hand state from Redis
func DeleteHandState(ctx context.Context, handID int64) error {
	if RDB == nil {
		return fmt.Errorf("redis not initialized")
	}

	key := fmt.Sprintf("hand:%d", handID)
	return RDB.Del(ctx, key).Err()
}

// UpdateUserMetricsAsync updates user metrics asynchronously
func UpdateUserMetricsAsync(ctx context.Context, playerAddr string) {
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := UpdateUserMetrics(ctx, playerAddr); err != nil {
			// Log error but don't block
			fmt.Printf("Failed to update user metrics: %v\n", err)
		}
	}()
}

// UpdateUserMetrics updates user metrics based on recent hands
func UpdateUserMetrics(ctx context.Context, playerAddr string) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// Calculate metrics from last 100 hands
	query := `
		WITH recent_hands AS (
			SELECT 
				amount, payout, result, created_at
			FROM hands
			WHERE player_address = $1
			ORDER BY created_at DESC
			LIMIT 100
		),
		metrics AS (
			SELECT
				COUNT(*) as total_hands,
				SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
				SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) as losses,
				SUM(CAST(payout AS DECIMAL) - CAST(amount AS DECIMAL)) as net_pnl,
				AVG(CAST(amount AS DECIMAL)) as avg_bet
			FROM recent_hands
		)
		INSERT INTO user_metrics (
			player_address,
			ev_per_100,
			skill_score,
			updated_at
		)
		SELECT
			$1,
			CASE WHEN total_hands > 0 
				THEN (net_pnl / NULLIF(total_hands * avg_bet, 0)) * 10000
				ELSE 0
			END,
			CASE WHEN total_hands > 0
				THEN (wins::DECIMAL / total_hands::DECIMAL) * 100
				ELSE 0
			END,
			NOW()
		FROM metrics
		ON CONFLICT (player_address) DO UPDATE SET
			ev_per_100 = EXCLUDED.ev_per_100,
			skill_score = EXCLUDED.skill_score,
			updated_at = NOW()
	`

	_, err := DB.Exec(ctx, query, playerAddr)
	return err
}

// InsertTreasurySnapshot inserts a treasury position snapshot
func InsertTreasurySnapshot(ctx context.Context, token string, pct float64) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	query := `
		INSERT INTO treasury_positions (token, pct, recorded_at)
		VALUES ($1, $2, NOW())
	`

	_, err := DB.Exec(ctx, query, token, pct)
	return err
}

// GetPlayerState retrieves cached player state from Redis
func GetPlayerState(ctx context.Context, playerAddr string) (map[string]interface{}, error) {
	if RDB == nil {
		return nil, fmt.Errorf("redis not initialized")
	}

	key := fmt.Sprintf("player:%s", playerAddr)
	val, err := RDB.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var state map[string]interface{}
	if err := json.Unmarshal([]byte(val), &state); err != nil {
		return nil, err
	}

	return state, nil
}

// SetPlayerState stores player state in Redis
func SetPlayerState(ctx context.Context, playerAddr string, state map[string]interface{}, ttl time.Duration) error {
	if RDB == nil {
		return fmt.Errorf("redis not initialized")
	}

	key := fmt.Sprintf("player:%s", playerAddr)
	data, err := json.Marshal(state)
	if err != nil {
		return err
	}

	return RDB.Set(ctx, key, data, ttl).Err()
}

