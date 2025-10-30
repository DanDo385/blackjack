# blackjack-yolo

Dev scaffold for YOLO Blackjack (contracts + Go backend + Next.js frontend).

## Repo layout

blackjack-yolo/

- contracts/ (Foundry / Solidity)
- backend/   (Go API)
- frontend/  (Next.js + TS + Tailwind)

## Setup

Frontend

1. cd frontend
2. pnpm install
3. Create `.env.local`:

```
NEXT_PUBLIC_RPC_HTTP_URL=https://mainnet.base.org
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

4. pnpm dev (http://localhost:3000)

Backend

1. cd backend
2. go run ./cmd/api (http://localhost:8080)

Contracts

1. cd contracts
2. forge build
3. See `script/DeployFactory.s.sol` and `script/DeployTables.s.sol`

## Notes

- Frontend Play page uses local mock API for `/api/engine/bet`.
- Account Summary reads `/api/user/summary` for risk metrics (riskAdjDelta, returnAdjDelta, luck10d).
