package contracts

import (
	"context"
	"fmt"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// TableContract wraps the Table contract interaction
type TableContract struct {
	client *ethclient.Client
	auth   *bind.TransactOpts
	table  common.Address
}

// NewTableContract creates a new Table contract wrapper
// For local dev: uses RPC_URL from env (defaults to http://localhost:8545)
// Uses PRIVATE_KEY from env for signing transactions
func NewTableContract(tableAddress string) (*TableContract, error) {
	rpcURL := os.Getenv("RPC_URL")
	if rpcURL == "" {
		rpcURL = "http://localhost:8545" // Anvil default
	}

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ethereum client: %w", err)
	}

	privateKeyStr := os.Getenv("PRIVATE_KEY")
	if privateKeyStr == "" {
		return nil, fmt.Errorf("PRIVATE_KEY environment variable not set")
	}

	privateKey, err := crypto.HexToECDSA(privateKeyStr[2:]) // Remove 0x prefix if present
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get chain ID: %w", err)
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, fmt.Errorf("failed to create authorized transactor: %w", err)
	}

	// Set gas price (for Anvil, can be 0)
	auth.GasPrice = big.NewInt(0)

	return &TableContract{
		client: client,
		auth:   auth,
		table:  common.HexToAddress(tableAddress),
	}, nil
}

// FulfillRandomness calls the fulfillRandomness function on the Table contract
// This is a simplified version - in production you'd use the generated ABI bindings
func (tc *TableContract) FulfillRandomness(ctx context.Context, handId *big.Int, seed [32]byte) error {
	// For now, we'll use a direct contract call
	// In production, you'd generate proper ABI bindings using abigen
	
	// Create the function selector for fulfillRandomness(uint256,bytes32)
	// Function signature: fulfillRandomness(uint256,bytes32)
	// Keccak256("fulfillRandomness(uint256,bytes32)") = first 4 bytes
	funcSelector := crypto.Keccak256([]byte("fulfillRandomness(uint256,bytes32)"))[:4]
	
	// Encode parameters: uint256 handId, bytes32 seed
	// This is a simplified version - in production use abigen or proper ABI encoding
	_ = funcSelector
	_ = handId
	_ = seed
	
	return fmt.Errorf("fulfillRandomness requires contract ABI bindings - see comments for implementation")
}

// Close closes the ethereum client connection
func (tc *TableContract) Close() {
	if tc.client != nil {
		tc.client.Close()
	}
}

