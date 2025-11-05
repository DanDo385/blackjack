-- User hands/transactions
CREATE TABLE hands (
  hand_id BIGSERIAL PRIMARY KEY,
  player_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  amount DECIMAL(78, 0) NOT NULL,
  usdc_ref DECIMAL(78, 0),
  result TEXT, -- 'win', 'lose', 'push'
  payout DECIMAL(78, 0) DEFAULT 0,
  fee_link DECIMAL(78, 0) DEFAULT 0,
  fee_nickel_ref DECIMAL(78, 0) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  settled_at TIMESTAMP
);

CREATE INDEX idx_hands_player ON hands(player_address);
CREATE INDEX idx_hands_created ON hands(created_at DESC);

-- User metrics (rolling aggregates)
CREATE TABLE user_metrics (
  player_address TEXT PRIMARY KEY,
  ev_per_100 DECIMAL(10, 4),
  sigma_per_100 DECIMAL(10, 4),
  skill_score DECIMAL(5, 2),
  tilt_index DECIMAL(3, 2),
  luck_10d DECIMAL(5, 2),
  risk_adj_delta INTEGER,
  return_adj_delta INTEGER,
  anchor DECIMAL(78, 0),
  last_bet DECIMAL(78, 0),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Treasury positions (snapshot)
CREATE TABLE treasury_positions (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  pct DECIMAL(5, 2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Treasury equity series
CREATE TABLE treasury_equity (
  id SERIAL PRIMARY KEY,
  day_offset INTEGER NOT NULL,
  value_usdc DECIMAL(20, 2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);
