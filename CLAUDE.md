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
      types/
        dto.go
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

## 2) Backend API Structure

The backend provides a simple REST API that returns demo/static data for development. All handlers in `internal/handlers/` return mock data:

- **GET /api/engine/state** - Returns current game state (true count, shoe %, betting limits)
- **POST /api/engine/bet** - Accepts bet requests and returns pending status
- **POST /api/game/resolve** - Resolves a hand using VRF seed
- **GET /api/treasury/overview** - Returns demo treasury allocation and equity series
- **GET /api/user/summary** - Returns demo user metrics (EV, skill score, etc.)
- **GET /api/user/hands** - Returns empty array (no hand history stored)

All API responses use static/demo data. No database persistence is implemented.

---

## 3) Frontend Updates

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

## 4) Environment Variables

### Root .env

```bash
# Base L2
RPC_HTTP_URL=https://mainnet.base.org
RPC_WS_URL=wss://mainnet.base.org
DEPLOYER_PRIVATE_KEY=0x...

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

## 5) Runbook

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

## 6) Card Image Naming Convention

Ensure card images follow pattern: `{Rank}-{Suit}.png`

- Rank: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `J`, `Q`, `K`, `A`
- Suit: `C` (Clubs), `D` (Diamonds), `H` (Hearts), `S` (Spades)

Examples: `10-H.png`, `A-S.png`, `J-C.png`, `K-D.png`

---

## 7) Integration Notes

- Frontend hits Go API at `NEXT_PUBLIC_API_BASE` for engine state, user summary, treasury
- Contract writes to `Table.sol` via wagmi once addresses are live
- Remove True Count display from `RetroScoreboard` before mainnet launch
- All data is demo/mock data for development
- For production, implement proper on-chain event listening and data persistence

---

## 8) Alerts & Drama

Toast notifications on:

- Leaderboard join
- Streaks (3/5/7 wins)
- Hand milestones (100/250/500)
- ≥50% lobby stake bet
- Micro-ante charge

Next card slot glows `.slot.next` for ~250ms per deal beat.

---

## 9) Risk Metric Display

In Account Summary → StatsCards:

Show: "Risk Adj (luck=0.5): +7" and "Return Adj (luck=0.5): −6"

Meaning: When `10d_luck_realized = 0.5`, user tends to increase risk by 7 units and reduce expected return by 6 units (over-confidence drift).

Wired to `/api/user/summary`: `riskAdjDelta`, `returnAdjDelta`, `luck10d`.
