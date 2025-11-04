# Wager Flow Implementation Guide

This document explains the updated wager flow with the two-step process: "Bring to Table" → "Deal"

## User Flow

### 1. Initial State (No tokens at table)
```
[Wager] [–] [100.00] [+] [Step] [1.00] [Bring to Table]
```
- User sets wager amount using +/– buttons or manual input
- Step controls the increment for +/– buttons
- "Bring to Table" button is green

### 2. Tokens at Table (No hand active)
```
Tokens at table: 100.00 ETH

[Deal] (Large teal button)
[Cash Out] (Gray button)
```
- After clicking "Bring to Table", tokens are committed
- Large teal "Deal" button appears
- User can cash out at any time

### 3. Hand Active (Cards dealt)
```
Tokens at table: 100.00 ETH

[Hit] [Stand] [Split] [Double]
[Cash Out]
```
- After clicking "Deal", cards are dealt
- Action buttons appear with proper colors:
  - Hit: Green (always active)
  - Stand: Red (always active)
  - Split: Yellow (only with pair)
  - Double: Purple (only on initial 2 cards)
- Buttons gray out when not available per blackjack rules

### 4. Hand Complete (Re-deal prompt)
```
🎰 Hand Complete!
Re-deal with the same wager?

Previous Wager: 100.00 ETH
[Re-deal] [No thanks]
```
- After standing, modal appears
- Re-deal: Keeps tokens at table, deals new hand
- No thanks: Returns to step 2 (tokens still at table)

## State Management

### Store States
```typescript
tokensInPlay: number      // Amount at table
tokenInPlay: string       // Token type (ETH, USDC, etc.)
gameActive: boolean       // Tokens are at table
handDealt: boolean        // Cards have been dealt
handId: number | null     // Active hand ID
showReDealPrompt: boolean // Show re-deal modal
```

### State Transitions
1. **Initial** → **Tokens at Table**: `setTokensInPlay(amount, token)`
2. **Tokens at Table** → **Hand Active**: `setGameState(dealer, player, handId)`
3. **Hand Active** → **Hand Complete**: `endHand()`
4. **Hand Complete** → **Tokens at Table**: `closeReDealPrompt() + resetHand()`
5. **Any State** → **Initial**: `cashOut()`

## Component Behavior

### BetControls
- Shows wager controls when `gameActive === false`
- Shows "Bring to Table" button (green)
- Handles localStorage persistence of `lastWager`

### GameActions
- Shows when `gameActive === true`
- Shows "Deal" button when `handDealt === false`
- Shows action buttons when `handDealt === true`
- Buttons conditionally enabled based on game rules

### ReDealPrompt
- Shows when `showReDealPrompt === true`
- Accepts: Resets hand state, keeps tokens
- Declines: Just resets hand state

## API Integration

### Bring to Table
```javascript
// Frontend only - no backend call
setTokensInPlay(wager, selectedToken)
setLastWager(wager)
```

### Deal
```javascript
POST /api/engine/bet
{
  amount: tokensInPlay,
  token: tokenInPlay
}
```

### Cash Out
```javascript
POST /api/game/cashout
{
  handId: handId // optional
}
```

## Troubleshooting

### Cash Out 404 Error
Ensure backend has the route registered:
```go
r.Post("/api/game/cashout", handlers.PostCashOut)
```

Handler should return 200 OK:
```go
func PostCashOut(w http.ResponseWriter, r *http.Request) {
    // Implementation
    respondWithJSON(w, http.StatusOK, response)
}
```

### Deal Button Not Appearing
Check state:
- `gameActive` must be `true`
- `handDealt` must be `false`
- `tokensInPlay` must be `> 0`

### Action Buttons Disabled
Verify:
- `handDealt === true`
- No loading state active
- Rules satisfied (e.g., Split needs pair)

## Testing Checklist

- [ ] "Bring to Table" commits tokens without dealing
- [ ] Teal "Deal" button appears after bringing tokens
- [ ] Deal button deals cards and shows action buttons
- [ ] Action buttons only light up when valid
- [ ] Split/Double only available on initial 2 cards
- [ ] Cash out works at any time
- [ ] Re-deal prompt appears after hand ends
- [ ] Re-deal keeps same wager and deals new hand
- [ ] Declining re-deal returns to Deal button
- [ ] Wager persists across page refreshes
