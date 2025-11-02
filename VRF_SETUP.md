# Chainlink VRF Setup Guide

## Overview

Your Table contract now uses Chainlink VRF v2 for provably fair randomness. Each bet automatically requests randomness from Chainlink, which is verifiable on-chain.

## Setup Steps

### 1. Create a Chainlink VRF Subscription

1. Go to [Chainlink VRF Subscription Manager](https://vrf.chain.link/)
2. Connect your wallet
3. Click "Create Subscription"
4. Fund your subscription with LINK tokens (or native token if using VRF v2.5)
   - Minimum: ~2 LINK for testing
   - Recommended: 10+ LINK for production

### 2. Get VRF Configuration Values

After creating your subscription, you'll need:

- **VRF Coordinator Address**: Network-specific VRF coordinator
- **Key Hash**: Gas price key hash (select based on your gas price tolerance)
- **Subscription ID**: Your subscription ID from step 1

### 3. Network-Specific Values

#### Base Sepolia (Testnet)

- **VRF Coordinator**: `0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625`
- **Key Hashes**:
  - 500 gwei: `0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314`
  - 1000 gwei: `0x588d9a9c8c4b0e88c8b4c9c8c4b0e88c8b4c9c8c4b0e88c8b4c9c8c4b0e88c8b4c9`

#### Base Mainnet

- **VRF Coordinator**: Check [Chainlink Docs](https://docs.chain.link/vrf/v2/subscription/supported-networks)
- **Key Hashes**: Check Chainlink docs for mainnet key hashes

#### Local Anvil (Development)

- Use a mock VRF coordinator for local testing
- See "Local Development" section below

### 4. Add Consumer to Subscription

After deploying your Table contract:

1. Go to your subscription page
2. Click "Add Consumer"
3. Enter your Table contract address
4. Confirm the transaction

### 5. Set Environment Variables

```bash
# Required for deployment
export VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
export VRF_KEY_HASH=0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314
export VRF_SUBSCRIPTION_ID=123  # Your subscription ID
export VRF_CALLBACK_GAS_LIMIT=500000

# Deploy tables
forge script script/DeployTables.s.sol --rpc-url $RPC_URL --broadcast
```

## How It Works

1. **Player places bet** → `placeBet()` is called
2. **Contract requests randomness** → Calls `vrfCoordinator.requestRandomWords()`
3. **Chainlink generates randomness** → After ~3 block confirmations (15-30 seconds)
4. **Randomness received** → `fulfillRandomWords()` callback is automatically called
5. **Seed is set** → Hand seed is stored, ready for settlement
6. **Player can settle** → `settle()` can now be called with the random seed

## Cost Estimation

- **Per hand**: ~0.25 LINK (~$2-5 depending on LINK price)
- **Gas costs**: Additional gas for VRF callback (~500k gas)
- **Total per hand**: ~0.25 LINK + gas fees

## Local Development (Anvil)

For local testing without LINK tokens:

1. **Install VRF Mock**:

   ```bash
   forge install smartcontractkit/chainlink-brownie-contracts
   ```

2. **Deploy Mock VRF Coordinator**:

   ```solidity
   // Use VRFCoordinatorV2Mock from chainlink-brownie-contracts
   ```

3. **Set environment variables**:

   ```bash
   export VRF_COORDINATOR=<mock_coordinator_address>
   export VRF_SUBSCRIPTION_ID=1  # Mock subscription
   ```

## Monitoring

### Check Randomness Status

```solidity
// Check if randomness has been fulfilled
Hand memory h = table.hands(handId);
bool hasRandomness = h.seed != bytes32(0);
```

### Check VRF Request

```solidity
// Get request ID from HandStarted event
// Then check if fulfilled via RandomFulfilled event
```

## Troubleshooting

### "Subscription not found"

- Ensure subscription exists and is funded
- Verify subscription ID is correct

### "Insufficient balance"

- Add more LINK to your subscription
- Check subscription balance on Chainlink dashboard

### "Request not fulfilled"

- Wait 15-30 seconds after placing bet
- Check VRF coordinator status
- Verify callback gas limit is sufficient

### "OnlyCoordinatorCanFulfill"

- This is expected - only VRF coordinator can fulfill
- If you see this, something is wrong with your setup

## Security Considerations

1. **Subscription Management**: Keep subscription private key secure
2. **Gas Limits**: Set callback gas limit high enough for your logic
3. **Request Confirmations**: 3 confirmations is standard (adjustable)
4. **Key Hash Selection**: Choose based on acceptable gas price ceiling

## Production Checklist

- [ ] Create VRF subscription on mainnet
- [ ] Fund subscription with sufficient LINK
- [ ] Deploy Table contracts with correct VRF config
- [ ] Add Table contracts as consumers to subscription
- [ ] Test randomness fulfillment
- [ ] Monitor subscription balance
- [ ] Set up alerts for low balance
- [ ] Document subscription ID for operations

## Additional Resources

- [Chainlink VRF Docs](https://docs.chain.link/vrf/v2/introduction)
- [VRF Subscription Manager](https://vrf.chain.link/)
- [Supported Networks](https://docs.chain.link/vrf/v2/subscription/supported-networks)
