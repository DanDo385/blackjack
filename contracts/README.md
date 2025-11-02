# Smart Contracts Testing Guide

This directory contains the smart contracts for the YOLO Blackjack project, along with comprehensive test suites using Foundry.

## Setup

### Prerequisites

1. **Foundry** - Install via [Foundryup](https://book.getfoundry.sh/getting-started/installation)
2. **Git Submodules** - Initialize the Chainlink contracts submodule:

```bash
git submodule update --init --recursive
```

### Building Contracts

```bash
make build
# or
cd contracts && forge build
```

### Running Tests

```bash
# Run all tests
make test

# Run tests with verbose output
cd contracts && forge test -vv

# Run tests with coverage
make test-coverage

# Run tests with gas reporting
make test-gas

# Run a specific test
make test-specific TEST=test_PlaceBet
```

### Test Structure

- `test/Factory.t.sol` - Comprehensive tests for Factory contract
- `test/Table.t.sol` - Comprehensive tests for Table contract
- `test/mocks/` - Mock contracts for testing (MockVRFCoordinatorV2, TestERC20)
- `test/helpers/` - Helper utilities and fixtures

### Test Coverage

The test suite aims for high coverage of:
- Constructor initialization
- Bet placement and validation
- Wagering rails (bounds, growth cap, step rounding)
- VRF request and fulfillment
- Hand settlement
- Reshuffle logic
- Player state management
- Edge cases and error conditions
- Fuzz testing

### Deployment

#### Local Anvil Deployment

```bash
# Start Anvil
make deploy-anvil

# Deploy Factory
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
make deploy-factory

# Deploy Tables
export FACTORY_ADDR=<factory-address>
export TREASURY_ADDR=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
make deploy-tables
```

#### Using Foundry Scripts Directly

```bash
# Deploy Factory
cd contracts
forge script script/DeployFactory.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key $PRIVATE_KEY

# Deploy Tables
FACTORY_ADDR=<addr> TREASURY_ADDR=<addr> forge script script/DeployTables.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key $PRIVATE_KEY
```

### Mock Contracts

The test suite includes mock contracts for testing:

- **MockVRFCoordinatorV2** - Mock VRF coordinator that allows immediate fulfillment of randomness requests
- **TestERC20** - Extended ERC20 token with convenience functions for testing

### Helper Utilities

- **TestHelpers** - Utility functions for creating test fixtures and calculating expected values

### Cleanup

```bash
make clean-contracts
# or
cd contracts && forge clean
```

## Test Execution Examples

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vv

# Run specific test file
forge test --match-path test/Factory.t.sol

# Run specific test function
forge test --match-test test_PlaceBet

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage
```

## Troubleshooting

### Chainlink Contracts Not Found

If you see errors about missing Chainlink contracts:

```bash
git submodule update --init --recursive
cd contracts/lib/chainlink-brownie-contracts
```

### Compilation Errors

1. Ensure all submodules are initialized
2. Check that `foundry.toml` remappings are correct
3. Verify Solidity version matches (0.8.24)

### Test Failures

1. Check that Anvil is running if tests require it
2. Verify mock contracts are properly imported
3. Check test setup functions are correct

