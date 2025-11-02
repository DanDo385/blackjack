# Randomness Solutions for Blackjack

## Overview

The contract requires a `bytes32 seed` to be provided via `fulfillRandomness()` for provably fair card dealing. Here are your options:

## Option 1: Local Development (No LINK tokens needed)

**For Anvil/local testing:** Use cryptographically secure randomness from your backend.

### Implementation

1. **Backend generates random seed** using Go's `crypto/rand`
2. **Backend calls `fulfillRandomness()`** on the contract after `placeBet()`

**Pros:**

- ✅ Free (no LINK tokens)
- ✅ Works immediately for local dev
- ✅ Cryptographically secure (crypto/rand)
- ✅ Fast

**Cons:**

- ❌ Not verifiable on-chain (trust backend)
- ❌ Not suitable for production

### Code Example

```go
// Generate random seed
seed, _ := random.GenerateSeed()
var seedBytes32 [32]byte
copy(seedBytes32[:], seed)

// Call fulfillRandomness on contract
tableContract.FulfillRandomness(ctx, handId, seedBytes32)
```

---

## Option 2: Chainlink VRF (Production - Requires LINK)

**For production:** Use Chainlink VRF for verifiable randomness.

### How it works

1. Contract requests randomness from Chainlink VRF
2. Chainlink oracle generates random number + cryptographic proof
3. Contract receives randomness with proof (verifiable on-chain)
4. Cost: ~0.25 LINK per request (~$2-5 depending on LINK price)

**Pros:**

- ✅ Provably fair (verifiable on-chain)
- ✅ Industry standard
- ✅ Can't be manipulated
- ✅ Production-ready

**Cons:**

- ❌ Requires LINK tokens
- ❌ ~$2-5 per hand
- ❌ ~15-30 second delay

Implementation

- Use Chainlink VRF v2 contracts
- Contract inherits `VRFConsumerBaseV2`
- Request randomness in `placeBet()`
- Receive in `fulfillRandomWords()` callback

---

## Option 3: Commit-Reveal Scheme (No LINK, but complex)

### Players commit to random values, then reveal later

### How it works (Commit-Reveal)

1. Player commits to a secret random value (hash)
2. Dealer commits to a secret random value (hash)
3. Both reveal secrets
4. Combine secrets to get final randomness

**Pros:**

- ✅ No LINK tokens needed
- ✅ Can be provably fair
- ✅ Players can verify

**Cons:**

- ❌ Complex to implement
- ❌ Requires two-step process
- ❌ User experience overhead

---

## Option 4: Blockhash-Based (Cheap but insecure)

### Use block hashes as randomness source

**Pros:**

- ✅ Free
- ✅ On-chain

**Cons:**

- ❌ Miners can manipulate (not secure)
- ❌ Only works for ~256 blocks
- ❌ Not suitable for production

---

## Recommendation

### For Local Development

Use **Option 1** (Backend-generated randomness):

- Implemented in `backend/internal/random/random.go`
- Generate seed with `crypto/rand`
- Call `fulfillRandomness()` after `placeBet()`

### For Production

Use **Option 2** (Chainlink VRF):

- Upgrade contract to inherit VRFConsumerBaseV2
- Add LINK funding to contract
- Replace `fulfillRandomness()` with VRF callback
- Update backend to handle VRF requests

---

## Current Implementation

The contract has `fulfillRandomness(uint256 handId, bytes32 seed)` which:

- Can be called by anyone (currently no access control)
- Sets the seed for a hand
- Required before `settle()` can be called

**For local dev:** Backend generates seed and calls this function.
**For production:** Replace with Chainlink VRF callback.
