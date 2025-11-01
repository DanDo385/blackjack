package types

import "time"

type Hand struct {
	HandID       int64      `db:"hand_id"`
	PlayerAddr   string     `db:"player_address"`
	TokenAddr    string     `db:"token_address"`
	Amount       string     `db:"amount"`
	USDCRef      *string    `db:"usdc_ref"`
	Result       *string    `db:"result"`
	Payout       string     `db:"payout"`
	FeeLink      string     `db:"fee_link"`
	FeeNickelRef string     `db:"fee_nickel_ref"`
	CreatedAt    time.Time  `db:"created_at"`
	SettledAt    *time.Time `db:"settled_at"`
}

type UserMetrics struct {
	PlayerAddr     string  `db:"player_address"`
	EVPer100       float64 `db:"ev_per_100"`
	SigmaPer100    float64 `db:"sigma_per_100"`
	SkillScore     float64 `db:"skill_score"`
	TiltIndex      float64 `db:"tilt_index"`
	Luck10d        float64 `db:"luck_10d"`
	RiskAdjDelta   int     `db:"risk_adj_delta"`
	ReturnAdjDelta int     `db:"return_adj_delta"`
	Anchor         *string `db:"anchor"`
	LastBet        *string `db:"last_bet"`
}

type TreasuryPosition struct {
	Token string  `json:"token"`
	Pct   float64 `json:"pct"`
}

type TreasuryEquity struct {
	DayOffset int     `json:"d"`
	Value     float64 `json:"v"`
}
