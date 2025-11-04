# YOLO Blackjack - Complete Implementation Guide

A provably fair, multicoin blackjack game on Base L2 with static wagering rules, real-time player metrics, and treasury oversight.

## Overview

**YOLO Blackjack** combines on-chain smart contracts (Solidity/Foundry), a Go backend API, and a Next.js frontend to deliver a complete blockchain blackjack experience:

- **Contracts** (Base L2): Factory, Table, Treasury contracts with player wagering rails
- **Backend** (Go): RESTful API with PostgreSQL (persistent data) + Redis (caching)
- **Frontend** (Next.js/React): Real-time game UI, player metrics dashboard, treasury overview

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Go** 1.24+ ([Install](https://go.dev/dl/))
- **Node.js** 18+ and **pnpm** ([Install Node](https://nodejs.org/), then `npm install -g pnpm`)
- **Docker** (Docker Desktop or Colima + Docker CLI) ([Install Docker Desktop](https://www.docker.com/products/docker-desktop/), [Install Colima](https://github.com/abiosoft/colima))
- **PostgreSQL** 15+ ([Install](https://www.postgresql.org/download/))
- **Redis** ([Install](https://redis.io/docs/getting-started/installation/))
- **Foundry** (Foundryup) ([Install](https://book.getfoundry.sh/getting-started/installation))
- **Git** ([Install](https://git-scm.com/downloads))

### Quick Install Commands (macOS)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Go
brew install go

# Install Node.js and pnpm
brew install node
npm install -g pnpm

# Install PostgreSQL
brew install postgresql@17
brew services start postgresql@17

# Install Redis
brew install redis
brew services start redis

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Local Development Setup Guide

This guide walks you through setting up the complete stack locally, starting with the local blockchain, then databases, backend, and finally the frontend.

### 🚀 Quick Start (one command)

If you have Docker, Go, Foundry, and Node installed, you can spin up the complete stack with a single command:

```bash
make dev
```

This script will:

- Launch PostgreSQL 17 and Redis via Docker Compose
- Run database migrations
- Boot the Go API server
- Start a local Anvil chain, compile, and deploy the contracts
- Update `frontend/lib/contracts.ts` with the freshly deployed addresses
- Start the Next.js dev server at `http://localhost:3000`

> Ensure the Docker daemon is running before you run `make dev`. Open Docker Desktop or run `colima start` (the script will try to launch Colima automatically if it is installed, but it cannot start Docker Desktop for you).

> Press `Ctrl+C` in the terminal to stop everything. The command automatically tears down the Docker containers and background processes.

If you prefer not to use `make`, execute the underlying script directly:

```bash
./scripts/dev.sh
```

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/DanDo385/blackjack.git
cd blackjack

# Install backend dependencies
cd backend
go mod tidy
cd ..

# Install frontend dependencies
cd frontend
pnpm install
cd ..

# Install Foundry dependencies
cd contracts
forge install
cd ..
```

---

### Step 2: Start Local Blockchain (Anvil)

**Anvil** is Foundry's local Ethereum node that simulates a blockchain. It comes with 10 pre-funded accounts ready to use.

#### 2.1 Start Anvil

Open a new terminal window and run:

```bash
cd contracts
anvil
```

You should see output like:

```text
Available Accounts
==================

(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
(2) 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
...
```

**Important:** Keep this terminal open. Anvil must be running for the frontend to connect.

#### 2.2 Default Anvil Accounts

Anvil provides 10 accounts with 10,000 ETH each. Here are the first few:

| Account # | Address | Private Key |
|-----------|---------|-------------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

**We'll use Account #0** (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) as our player account.

#### 2.3 Deploy Contracts to Anvil

In a **new terminal** (keep Anvil running), deploy the contracts:

```bash
cd contracts

# Set the private key for Account #0 (deployer)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deploy Factory contract
forge script script/DeployFactory.s.sol --rpc-url http://localhost:8545 --broadcast

# Note the Factory address from the output (it will be printed)
# Example: Factory: 0x5FbDB2315678afecb367f032d93F642f64180aa3

# Set environment variables for Table deployment
export FACTORY_ADDR=<your-factory-address-here>
export TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  # Using Account #0 as treasury

# Deploy Table
forge script script/DeployTables.s.sol --rpc-url http://localhost:8545 --broadcast
```

You should see output like:

```text
Table: 0x...
```

**Save this address!** You'll need it for the frontend configuration.

#### 2.4 Update Frontend Contract Addresses

Edit `frontend/lib/contracts.ts` and replace the placeholder addresses with your deployed addresses:

```typescript
export const addresses = {
  factory: '0xYourFactoryAddress',
  table: '0xYourTableAddress',
  treasury: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0
} as const
```

---

### Step 3: Setup Databases

#### 3.1 PostgreSQL Setup

```bash
# Start PostgreSQL (if not already running)
brew services start postgresql@17  # macOS
# OR: sudo systemctl start postgresql  # Linux

# Create the database
createdb yolo
# OR: psql -U postgres -c "CREATE DATABASE yolo;"

# Load the schema
psql -U postgres yolo < backend/schema.sql
# OR if using a different user: psql yolo < backend/schema.sql
```

**Verify the database was created:**

```bash
psql -U postgres yolo -c "\dt"
```

You should see tables: `hands`, `user_metrics`, `treasury_positions`, `treasury_equity`.

#### 3.2 Redis Setup

```bash
# Start Redis (if not already running)
brew services start redis  # macOS
# OR: sudo systemctl start redis  # Linux

# Verify Redis is running
redis-cli PING
# Should return: PONG
```

---

### Step 4: Configure Environment Variables

#### 4.1 Backend Environment

Create a `.env` file in the project root (or set environment variables):

```bash
# Backend Database Configuration
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
REDIS_ADDR=localhost:6379
```

**Note:** Adjust `POSTGRES_DSN` if your PostgreSQL uses different credentials:

- Format: `postgres://username:password@host:port/database?sslmode=disable`
- Default macOS: `postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable`
- Default Linux: `postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable`

#### 4.2 Frontend Environment

Create `frontend/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE=http://localhost:8080

# Local Anvil RPC URL (change this from Base mainnet to Anvil!)
NEXT_PUBLIC_RPC_HTTP_URL=http://localhost:8545
```

**Important:** Make sure `NEXT_PUBLIC_RPC_HTTP_URL` points to `http://localhost:8545` (Anvil), not Base mainnet, for local development.

---

### Step 5: Start the Backend API

In a **new terminal**:

```bash
cd backend

# Set environment variables (if not using .env file)
export POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
export REDIS_ADDR=localhost:6379

# Run the backend
go run ./cmd/api
```

You should see:

```text
dev api on :8080
```

**Test the backend:**

```bash
# Test engine state endpoint
curl http://localhost:8080/api/engine/state

# Test treasury endpoint
curl http://localhost:8080/api/treasury/overview
```

Keep this terminal open.

---

### Step 6: Start the Frontend

In a **new terminal**:

```bash
cd frontend
pnpm dev
```

You should see:

```text
▲ Next.js 14.2.11
- Local:        http://localhost:3000
```

Open your browser to **<http://localhost:3000>**

---

### Step 7: Connect Your Wallet

1. **Open the frontend** at `http://localhost:3000`
2. **Click "Connect Wallet"** (or similar button)
3. **Import Account #0** into MetaMask (or your wallet):
   - In MetaMask: Settings → Advanced → Show test networks
   - Add a network:
     - Network Name: `Anvil Local`
     - RPC URL: `http://localhost:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`
   - Import Account using private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - You should see **10,000 ETH** in the account

4. **Connect the wallet** to the frontend

---

## How Everything Connects Together

### Architecture Flow

```text
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│   Next.js    │─────▶│   Go API    │
│  (Frontend) │      │   Frontend   │      │  (Backend)  │
└─────────────┘      └──────────────┘      └─────────────┘
      │                      │                     │
      │                      │                     │
      │  Wagmi               │                     │
      │  (Wallet)            │                     │
      │                      │                     │
      ▼                      ▼                     ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Anvil     │      │   Wagmi     │      │ PostgreSQL │
│ (Local      │      │   Config    │      │  (Persist) │
│ Blockchain) │      │             │      └─────────────┘
└─────────────┘      └──────────────┘             │
                                                   │
                                            ┌─────────────┐
                                            │   Redis     │
                                            │   (Cache)   │
                                            └─────────────┘
```

### Data Flow

1. **Smart Contracts** (Anvil):
   - `Factory.sol` - Creates and manages table instances
   - `Table.sol` - Handles game logic, bets, and settlements
   - Deployed on local Anvil chain (Chain ID: 31337)

2. **Frontend** (Next.js):
   - Connects to Anvil via Wagmi using `NEXT_PUBLIC_RPC_HTTP_URL`
   - Calls Go API endpoints for game state, user metrics, treasury data
   - Interacts with contracts via Wagmi hooks (`useWriteContract`, `useReadContract`)

3. **Backend** (Go):
   - Reads/writes to PostgreSQL for persistent data (hands, metrics, treasury)
   - Uses Redis for caching (user summaries, session data)
   - Provides REST API endpoints at `http://localhost:8080`

4. **Databases**:
   - **PostgreSQL**: Stores hand history, user metrics, treasury positions
   - **Redis**: Caches frequently accessed data (60s TTL for user summaries)

---

## Project Structure

```text
blackjack/
├── contracts/                    # Foundry / Solidity smart contracts
│   ├── src/
│   │   ├── Factory.sol          # Deploy tables
│   │   ├── Table.sol            # Core game logic + wagering rails
│   │   └── interfaces/
│   │       └── ITable.sol       # Table interface with rules struct
│   ├── script/
│   │   ├── DeployFactory.s.sol
│   │   └── DeployTables.s.sol
│   └── foundry.toml
│
├── backend/                      # Go API server
│   ├── cmd/api/
│   │   └── main.go              # Entry point; init Postgres + Redis
│   ├── internal/
│   │   ├── handlers/
│   │   │   ├── engine.go        # /api/engine/* endpoints
│   │   │   ├── user.go          # /api/user/* endpoints (DB-backed)
│   │   │   └── treasury.go      # /api/treasury/* endpoints (DB-backed)
│   │   ├── storage/
│   │   │   ├── postgres.go      # PostgreSQL connection pooling
│   │   │   └── redis.go         # Redis client initialization
│   │   └── types/
│   │       └── dto.go           # Data transfer objects
│   ├── schema.sql               # PostgreSQL schema + tables
│   ├── go.mod
│   └── go.sum
│
└── frontend/                     # Next.js + React + Tailwind
    ├── app/
    │   ├── layout.tsx           # Root layout with Providers
    │   ├── page.tsx             # Lobby / hero page
    │   ├── play/page.tsx        # Game table (TableCanvas)
    │   ├── account/page.tsx     # Player metrics + stats
    │   └── treasury/page.tsx    # Treasury charts
    ├── components/
    │   ├── Providers.tsx        # Wagmi + React Query + Toast
    │   ├── TableCanvas.tsx      # Game board + card slots
    │   ├── BetControls.tsx      # Bet input + validation
    │   └── ...
    ├── lib/
    │   ├── wagmi.ts             # Wagmi config (Base L2 / Anvil)
    │   ├── contracts.ts         # Contract ABIs + addresses
    │   └── api.ts               # API helper functions
    └── package.json
```

---

## Game Rules (Locked)

| Rule | Value |
|------|-------|
| **Decks** | 7 |
| **Reshuffle** | 67% penetration |
| **Dealer** | H17 (hits soft 17) |
| **Blackjack Payout** | 7:5 (1.4×) |
| **Doubles** | Any two cards; DAS on non-Aces |
| **Splits** | Allowed; Aces split once; no hits after |
| **Surrender** | None |
| **Mid-shoe entry** | Off |

### Wagering (Static)

- **Anchor**: Rolling median of last 5 played bets
- **Spread Window**: ¼× to 4× Anchor
- **Growth Cap**: Max +33% vs last bet
- **Bet Steps**: 5% of Anchor
- **Participation**: Must play ≥6 of last 10 hands; extra skips charged 10% micro-ante
- **Fees** (on wins only): Recoup VRF LINK cost + $0.05 equivalent

---

## API Endpoints

### Engine

- **GET** `/api/engine/state` — Current game state (true count, shoe %, anchor, spreads)
- **POST** `/api/engine/bet` — Place a bet (returns handId)

### User

- **GET** `/api/user/summary?player=0x...` — Player metrics (EV%, skill score, tilt, risk adjustment)
- **GET** `/api/user/hands?player=0x...` — Hand history (100 most recent)

### Treasury

- **GET** `/api/treasury/overview` — Asset allocation + equity series (60 days)

---

## Troubleshooting

### Anvil Connection Issues

**Problem:** Frontend can't connect to Anvil

**Solution:**

```bash
# Verify Anvil is running
curl http://localhost:8545

# Check if port 8545 is in use
lsof -i :8545

# Restart Anvil
pkill anvil
anvil
```

### Backend Won't Start

**Problem:** Backend fails to connect to PostgreSQL or Redis

**Solution:**

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check Redis is running
redis-cli PING

# Verify database exists
psql -U postgres -l | grep yolo

# Check ports
lsof -i :8080  # Backend
lsof -i :5432  # Postgres
lsof -i :6379  # Redis
```

### Frontend Build Fails

**Problem:** Next.js build errors or dependency issues

**Solution:**

```bash
cd frontend

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Check Node version (should be 18+)
node --version
```

### Database Schema Errors

**Problem:** Tables don't exist or schema is out of date

**Solution:**

```bash
# Reset schema (dev only!)
psql -U postgres yolo < backend/schema.sql

# Or drop & recreate
psql -U postgres -c "DROP DATABASE yolo;"
psql -U postgres -c "CREATE DATABASE yolo;"
psql -U postgres yolo < backend/schema.sql
```

### Contract Deployment Fails

**Problem:** `forge script` fails with "insufficient funds" or connection errors

**Solution:**

```bash
# Verify Anvil is running
curl http://localhost:8545

# Check you're using the correct RPC URL
forge script script/DeployFactory.s.sol --rpc-url http://localhost:8545 --broadcast

# Verify private key is set
echo $PRIVATE_KEY
```

### Frontend Shows Wrong Network

**Problem:** Frontend tries to connect to Base mainnet instead of Anvil

**Solution:**

1. Check `frontend/.env.local` has `NEXT_PUBLIC_RPC_HTTP_URL=http://localhost:8545`
2. Restart the Next.js dev server: `pnpm dev`
3. Clear browser cache and reconnect wallet
4. Make sure MetaMask is connected to "Anvil Local" network (Chain ID: 31337)

---

## Quick Start Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] **Anvil is running** on `http://localhost:8545`
- [ ] **Contracts deployed** and addresses saved
- [ ] **Frontend contract addresses** updated in `frontend/lib/contracts.ts`
- [ ] **PostgreSQL is running** and database `yolo` exists
- [ ] **Schema loaded** (`psql yolo < backend/schema.sql`)
- [ ] **Redis is running** (`redis-cli PING` returns `PONG`)
- [ ] **Backend environment variables** set (POSTGRES_DSN, REDIS_ADDR)
- [ ] **Backend API** running on `http://localhost:8080`
- [ ] **Frontend `.env.local`** configured with Anvil RPC URL
- [ ] **Frontend dependencies** installed (`pnpm install`)
- [ ] **Frontend dev server** running on `http://localhost:3000`
- [ ] **Wallet connected** to Anvil network (Chain ID: 31337)
- [ ] **Account #0 imported** into MetaMask with private key

---

## Development Workflow

### Making Changes

1. **Smart Contracts** (`contracts/`):
   - Edit `.sol` files
   - Rebuild: `forge build`
   - Redeploy: `forge script script/Deploy*.s.sol --rpc-url http://localhost:8545 --broadcast`
   - Update addresses in `frontend/lib/contracts.ts`

2. **Backend** (`backend/`):
   - Edit `.go` files
   - Backend auto-reloads on `go run` (manual restart needed)
   - Test API: `curl http://localhost:8080/api/engine/state`

3. **Frontend** (`frontend/`):
   - Edit `.tsx` files
   - Next.js hot-reloads automatically
   - Changes appear in browser immediately

---

## Database Schema Overview

| Table | Purpose |
|-------|---------|
| `hands` | Player hand history (bets, results, payouts) |
| `user_metrics` | Rolling player stats (EV%, skill score, tilt index) |
| `treasury_positions` | Asset allocation snapshots |
| `treasury_equity` | Equity curve history |

### Redis Key Structure

- `engine:state:{table_id}` — Current game state (JSON)
- `session:{player_address}` — Player session data
- `shoe:{shoe_id}` — Shoe state & card tracking
- `cache:user:{player_address}:summary` — Cached user metrics (60s TTL)

---

## Card Image Format

All card images must follow the naming convention: `{Rank}-{Suit}.png`

- **Ranks**: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `J`, `Q`, `K`, `A`
- **Suits**: `C` (Clubs), `D` (Diamonds), `H` (Hearts), `S` (Spades)

**Examples**: `10-H.png`, `A-S.png`, `J-C.png`, `K-D.png`

Cards are located in `frontend/public/cards/`

---

## Alert & Toast Notifications

Triggered in `BetControls` and game flow:

- **Leaderboard join** — Welcome message
- **Streaks** — 3/5/7 consecutive wins
- **Hand milestones** — 100/250/500 hands played
- **≥50% lobby stake** — "Dramatic wager" warning
- **Micro-ante charge** — Skip penalty notification
- **Bet adjustment** — Auto-clamped bet size

---

## Performance Considerations

### Caching Strategy

- User summary: Redis 60s TTL
- Engine state: Redis real-time (updated on new hand)
- Treasury data: Postgres aggregation + Redis daily cache

### Database Indexes

- `idx_hands_player` — Fast lookup by player address
- `idx_hands_created` — Time-series queries

### API Response Size

- `/api/user/hands` — Limit 100 records
- `/api/treasury/overview` — Limit 60 days of equity history

---

## Future Enhancements

1. **Chainlink VRF** — Provably fair card dealing
2. **Price Oracle** — Token pricing for settlement
3. **Leaderboard** — Real-time global rankings
4. **Mobile App** — React Native client
5. **Multi-table** — Simultaneous games per player
6. **EIP-712 Quote Verifier** — Signed off-chain pricing
7. **Treasury Rebalancing** — Automated strategy execution

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a PR

---

## License

Proprietary — YOLO Blackjack

---

## Support

For issues, questions, or feedback:

- GitHub Issues: [Report a bug](https://github.com/DanDo385/blackjack/issues)
- Documentation: [CLAUDE.md](./CLAUDE.md)
