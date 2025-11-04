# Environment Configuration Guide

## Overview

This project uses a **consolidated `.env` file** in the project root. All components (backend, frontend, contracts) read from this single file.

## Quick Setup

### 1. Create Root `.env` File

Copy the example and customize:

```bash
cp .env.example .env
```

### 2. Run Consolidation Script (Optional)

This script merges any existing `frontend/.env.local` into root `.env` and creates a symlink:

```bash
./scripts/consolidate-env.sh
```

## Configuration Details

### Contract Addresses

**Important:** The backend event watcher needs `TABLE_ADDRESS` to be the **Table contract address** (not Factory), since events (`HandStarted`, `RandomFulfilled`, `HandSettled`) are emitted from Table contracts.

#### Option 1: Auto-load from Foundry (Recommended)

The backend automatically reads contract addresses from Foundry broadcast files:

- `contracts/broadcast/DeployFactory.s.sol/31337/run-latest.json` → Factory address
- `contracts/broadcast/DeployTables.s.sol/31337/run-latest.json` → Table addresses (from TableCreated events)

After deploying contracts with Foundry, addresses are automatically detected. No manual configuration needed!

#### Option 2: Manual Configuration

Set in `.env`:

```bash
TABLE_ADDRESS=0xYourTableAddress  # Standard table address
TABLE_STD_ADDR=0x...              # Standard table (optional)
TABLE_PREM_ADDR=0x...              # Premier table (optional)
FACTORY_ADDR=0x...                # Factory address (optional)
```

### Environment Variables

#### Blockchain (Required)

```bash
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

#### Backend

```bash
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
REDIS_ADDR=localhost:6379
FRONTEND_URL=http://localhost:3000
```

#### Frontend (Next.js)

```bash
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_RPC_HTTP_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

## How It Works

### Backend

1. **Loads `.env` from project root** (via `godotenv.Load("../.env")`)
2. **Auto-detects Table address** via `contracts.GetTableAddress()`:
   - First checks `TABLE_ADDRESS` env var
   - Falls back to Foundry broadcast files (`contracts/broadcast/...`)
   - Defaults to standard table if found
3. **Event watcher starts automatically** if Table address is found

### Frontend

1. **Reads from `frontend/.env.local`** (Next.js convention)
2. **Symlink points to root `.env`** (after running consolidation script)
3. **All `NEXT_PUBLIC_*` vars** are available in browser

### Foundry Contracts

1. **Reads from `.env`** via `vm.envAddress()` and `vm.envOr()`
2. **Saves addresses** to `contracts/broadcast/` directory
3. **Backend auto-detects** from broadcast files

## Address Resolution Priority

For `TABLE_ADDRESS`:

1. ✅ `TABLE_ADDRESS` env var (highest priority)
2. ✅ Foundry broadcast file → Standard table address
3. ✅ `TABLE_STD_ADDR` env var (fallback)
4. ❌ Event watcher disabled if none found

## Example .env File

```bash
# Blockchain
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Backend
POSTGRES_DSN=postgres://postgres:postgres@localhost:5432/yolo?sslmode=disable
REDIS_ADDR=localhost:6379
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_RPC_HTTP_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337

# Contracts (auto-detected from Foundry, or set manually)
# TABLE_ADDRESS=0x...  # Optional - auto-detected from broadcast files
```

## Troubleshooting

### Event Watcher Not Starting

If you see: `"No TABLE_ADDRESS found - event watcher disabled"`

1. Deploy contracts: `forge script script/DeployTables.s.sol --broadcast`
2. Or set `TABLE_ADDRESS` manually in `.env`
3. Restart backend

### Frontend Can't Read Env Vars

1. Ensure `frontend/.env.local` exists (symlink to root `.env`)
2. Restart Next.js dev server
3. Verify vars start with `NEXT_PUBLIC_` prefix

### Contract Addresses Not Found

1. Check `contracts/broadcast/` directory exists
2. Verify latest deployment: `cat contracts/broadcast/DeployTables.s.sol/31337/run-latest.json`
3. Or set addresses manually in `.env`

