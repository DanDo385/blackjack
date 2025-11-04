# YOLO Blackjack - Complete Implementation Guide

## 0) Ground Rules (Locked + Player-Facing)

**Decks:** 7

**Reshuffle:** at 67% seen

**Dealer:** H17 (hits soft 17)

**Blackjack payout:** 7:5 (1.4×)

**Doubles:** any two; DAS on non-Aces

**Splits:** allowed; Aces split once; no hits after

**Surrender:** none

**Mid-shoe entry:** off

**Wagering (static; not TC-dependent):**

- Anchor = rolling median of last 5 played bets
- Spread window: ¼×…4× Anchor
- Growth cap: max +33% vs last bet
- Participation: in any last 10 hands, must play ≥6; extra skips charge micro-ante = 10% of table min
- Bet steps: 5% of Anchor

**Fees (on wins only):** recoup VRF LINK cost + $0.05 eq

---

## 1) Repo Layout

```text
blackjack/
  contracts/
    src/
      Factory.sol
      Table.sol
      interfaces/ITable.sol
    script/
      DeployFactory.s.sol
      DeployTables.s.sol
    foundry.toml
  
  backend/
    cmd/api/main.go
    internal/
      handlers/
        engine.go
        treasury.go
        user.go
      storage/
        redis.go          # NEW: Redis client initialization
        postgres.go       # NEW: Postgres client initialization
      types/
        dto.go            # NEW: Data transfer objects
    go.mod
    go.sum
  
  frontend/
    app/
      layout.tsx
      page.tsx                 # Lobby
      play/page.tsx            # Game table
      treasury/page.tsx
      account/page.tsx
      transactions/page.tsx
      docs/page.tsx
      faq/page.tsx
    components/
      Providers.tsx            # NEW: Wagmi + React Query wrapper
      Navbar.tsx
      RetroScoreboard.tsx
      TableCanvas.tsx
      BetControls.tsx
      AlertBus.tsx
      TimeRangeTabs.tsx
      StatsCards.tsx
      LeaderboardMarquee.tsx   # TODO: Implement later
    lib/
      wagmi.ts
      api.ts
      contracts.ts
      rules.ts                 # TODO: Implement later
      store.ts
    public/
      boards/
        dealerjohhny5.png
      cards/                   # {Rank}-{Suit}.png format (e.g., 10-H.png, A-S.png)
    styles/
      globals.css
      scoreboard.css
    next.config.mjs
    tailwind.config.ts
    postcss.config.js
    tsconfig.json
    package.json
    .env.local.example
```

---

## 2) Database Setup

### Postgres Schema

Create database and tables:

```sql
CREATE DATABASE yolo;

\c yolo

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
```

### Redis Keys Structure

- `engine:state:{table_id}` - Current game state (JSON)
- `session:{player_address}` - Player session data (JSON)
- `shoe:{shoe_id}` - Shoe state (JSON)
- `cache:user:{player_address}:summary` - Cached user summary (TTL: 60s)

---

## 3) Backend Database Integration

### internal/storage/postgres.go

```go
package storage

import (
    "context"
    "fmt"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func InitPostgres() error {
    dsn := os.Getenv("POSTGRES_DSN")
    if dsn == "" {
        dsn = "postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable"
    }

    pool, err := pgxpool.New(context.Background(), dsn)
    if err != nil {
        return fmt.Errorf("failed to connect to postgres: %w", err)
    }

    DB = pool
    return nil
}

func ClosePostgres() {
    if DB != nil {
        DB.Close()
    }
}
```

### internal/storage/redis.go

```go
package storage

import (
    "context"
    "fmt"
    "os"
    "time"

    "github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis() error {
    addr := os.Getenv("REDIS_ADDR")
    if addr == "" {
        addr = "localhost:6379"
    }

    RDB = redis.NewClient(&redis.Options{
        Addr: addr,
    })

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := RDB.Ping(ctx).Err(); err != nil {
        return fmt.Errorf("failed to connect to redis: %w", err)
    }

    return nil
}

func CloseRedis() {
    if RDB != nil {
        RDB.Close()
    }
}
```

### internal/types/dto.go

```go
package types

import "time"

type Hand struct {
    HandID       int64     `db:"hand_id"`
    PlayerAddr   string    `db:"player_address"`
    TokenAddr    string    `db:"token_address"`
    Amount       string    `db:"amount"`
    USDCRef      *string   `db:"usdc_ref"`
    Result       *string   `db:"result"`
    Payout       string    `db:"payout"`
    FeeLink      string    `db:"fee_link"`
    FeeNickelRef string    `db:"fee_nickel_ref"`
    CreatedAt    time.Time `db:"created_at"`
    SettledAt    *time.Time `db:"settled_at"`
}

type UserMetrics struct {
    PlayerAddr    string  `db:"player_address"`
    EVPer100      float64 `db:"ev_per_100"`
    SigmaPer100   float64 `db:"sigma_per_100"`
    SkillScore    float64 `db:"skill_score"`
    TiltIndex     float64 `db:"tilt_index"`
    Luck10d       float64 `db:"luck_10d"`
    RiskAdjDelta  int     `db:"risk_adj_delta"`
    ReturnAdjDelta int    `db:"return_adj_delta"`
    Anchor        *string `db:"anchor"`
    LastBet       *string `db:"last_bet"`
}

type TreasuryPosition struct {
    Token string  `json:"token"`
    Pct   float64 `json:"pct"`
}

type TreasuryEquity struct {
    DayOffset int     `json:"d"`
    Value     float64 `json:"v"`
}
```

### Updated cmd/api/main.go

```go
package main

import (
    "log"
    "net/http"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    "github.com/dando385/blackjack/backend/internal/handlers"
    "github.com/dando385/blackjack/backend/internal/storage"
)

func main() {
    // Initialize databases
    if err := storage.InitPostgres(); err != nil {
        log.Fatalf("Failed to init postgres: %v", err)
    }
    defer storage.ClosePostgres()

    if err := storage.InitRedis(); err != nil {
        log.Fatalf("Failed to init redis: %v", err)
    }
    defer storage.CloseRedis()

    r := chi.NewRouter()
    r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
    r.Use(middleware.Timeout(30 * time.Second))

    r.Get("/api/engine/state", handlers.GetEngineState)
    r.Post("/api/engine/bet", handlers.PostBet)

    r.Get("/api/treasury/overview", handlers.GetTreasuryOverview)

    r.Get("/api/user/summary", handlers.GetUserSummary)
    r.Get("/api/user/hands", handlers.GetUserHands)

    log.Println("dev api on :8080")
    http.ListenAndServe(":8080", r)
}
```

### Updated internal/handlers/user.go

```go
package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"

    "github.com/dando385/blackjack/backend/internal/storage"
    "github.com/dando385/blackjack/backend/internal/types"
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
            "evPer100":      -0.8,
            "sigmaPer100":   12.4,
            "skillScore":    101.7,
            "tiltIndex":     0.32,
            "luck10d":       0.5,
            "riskAdjDelta":  7,
            "returnAdjDelta": -6,
        }
        json.NewEncoder(w).Encode(summary)
        return
    }

    summary := map[string]any{
        "evPer100":      metrics.EVPer100,
        "sigmaPer100":   metrics.SigmaPer100,
        "skillScore":    metrics.SkillScore,
        "tiltIndex":     metrics.TiltIndex,
        "luck10d":       metrics.Luck10d,
        "riskAdjDelta":  metrics.RiskAdjDelta,
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
```

### Updated internal/handlers/treasury.go

```go
package handlers

import (
    "context"
    "encoding/json"
    "net/http"

    "github.com/dando385/blackjack/backend/internal/storage"
    "github.com/dando385/blackjack/backend/internal/types"
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
            "positions":   positions,
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
        "positions":   posJSON,
        "equitySeries": eqJSON,
    })
}
```

---

## 4) Frontend Updates

### components/Providers.tsx

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }:{ children: React.ReactNode }){
  const [qc] = useState(()=> new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } }
  }))
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Updated app/layout.tsx

```tsx
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'
import type { ReactNode } from 'react'

export const metadata = { 
  title: 'YOLO Blackjack', 
  description: 'Provably fair multicoin blackjack' 
}

export default function RootLayout({ children }:{ children: ReactNode }){
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Updated app/page.tsx (fix image path)

```tsx
import Navbar from '@/components/Navbar'
import { AlertBus } from '@/components/AlertBus'
import Image from 'next/image'
import Link from 'next/link'

export default function Home(){
  return (
    <>
      <Navbar />
      <AlertBus />
      <main className="max-w-6xl mx-auto p-4">
        <div className="relative rounded-2xl overflow-hidden border">
          <Image src="/boards/dealerjohhny5.png" alt="YOLO Lobby" width={1800} height={900} className="w-full h-auto object-cover"/>
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold">YOLO Blackjack</h1>
              <p className="opacity-85">Club chaos × casino precision. Provably fair. Multicoin. Static rules.</p>
              <Link href="/play" className="inline-block mt-3 px-4 py-2 rounded-xl bg-white text-black">Enter Table</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
```

### Updated app/treasury/page.tsx (with recharts)

```tsx
'use client'
import Navbar from '@/components/Navbar'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

const COLORS = ['#3b82f6','#22c55e','#eab308','#ef4444','#a855f7']

export default function Treasury(){
  const [data, setData] = useState<any>(null)

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/treasury/overview`)
      .then(r=>r.json()).then(setData)
  },[])

  const positions = data?.positions || []
  const pnl = data?.equitySeries || []

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Treasury Vault</h1>
        <p className="opacity-70 mb-4">Aggregated assets & strategies (read-only)</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Allocation</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={positions} dataKey="pct" nameKey="token" outerRadius={100}>
                  {positions.map((e:any, i:number) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-2 text-sm">{positions.map((p:any,i:number)=><li key={i}>{p.token}: {p.pct}%</li>)}</ul>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Equity (ref USDC)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={pnl}>
                <XAxis dataKey="d"/>
                <YAxis/>
                <Tooltip/>
                <Line type="monotone" dataKey="v" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </>
  )
}
```

---

## 5) Environment Variables

### Root .env

```bash
# Base L2
RPC_HTTP_URL=https://mainnet.base.org
RPC_WS_URL=wss://mainnet.base.org
DEPLOYER_PRIVATE_KEY=0x...

# Backend
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
REDIS_ADDR=localhost:6379

# Next.js Frontend
NEXT_PUBLIC_RPC_HTTP_URL=https://mainnet.base.org
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### frontend/.env.local.example

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_RPC_HTTP_URL=https://mainnet.base.org
```

---

## 6) Runbook

### Database Setup

```bash
# Install Postgres and Redis (macOS)
brew install postgresql@17 redis

# Start services
brew services start postgresql@17
brew services start redis

# Create database
createdb yolo
psql yolo < schema.sql  # (create schema.sql from section 2)
```

### Backend

```bash
cd backend
go run ./cmd/api
# -> http://localhost:8080
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm dev
# -> http://localhost:3000
```

### Contracts

```bash
cd contracts
forge build
# Deploy as per script instructions
```

---

## 7) Card Image Naming Convention

Ensure card images follow pattern: `{Rank}-{Suit}.png`

- Rank: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `J`, `Q`, `K`, `A`
- Suit: `C` (Clubs), `D` (Diamonds), `H` (Hearts), `S` (Spades)

Examples: `10-H.png`, `A-S.png`, `J-C.png`, `K-D.png`

---

## 8) Integration Notes

- Frontend hits Go API at `NEXT_PUBLIC_API_BASE` for engine state, user summary, treasury
- Contract writes to `Table.sol` via wagmi once addresses are live
- Remove True Count display from `RetroScoreboard` before mainnet launch
- Redis used for session/game state caching
- Postgres used for persistent user hands, transactions, treasury history

---

## 9) Alerts & Drama

Toast notifications on:

- Leaderboard join
- Streaks (3/5/7 wins)
- Hand milestones (100/250/500)
- ≥50% lobby stake bet
- Micro-ante charge

Next card slot glows `.slot.next` for ~250ms per deal beat.

---

## 10) Risk Metric Display

In Account Summary → StatsCards:

Show: "Risk Adj (luck=0.5): +7" and "Return Adj (luck=0.5): −6"

Meaning: When `10d_luck_realized = 0.5`, user tends to increase risk by 7 units and reduce expected return by 6 units (over-confidence drift).

Wired to `/api/user/summary`: `riskAdjDelta`, `returnAdjDelta`, `luck10d`.
