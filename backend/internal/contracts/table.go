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

// PlaceBet calls placeBet on the Table contract
// Returns the handId from the transaction
func (tc *TableContract) PlaceBet(ctx context.Context, tokenAddr common.Address, amount *big.Int, usdcRef *big.Int, quoteId [32]byte) (*big.Int, error) {
	// Note: This requires contract ABI bindings generated via abigen
	// For now, return an error indicating bindings are needed
	// To generate bindings:
	//   abigen --abi Table.abi --pkg contracts --type Table --out table_bindings.go
	return nil, fmt.Errorf("PlaceBet requires contract ABI bindings - generate with abigen")
}

// Settle calls settle on the Table contract
func (tc *TableContract) Settle(ctx context.Context, handId *big.Int) error {
	// Note: This requires contract ABI bindings
	return fmt.Errorf("Settle requires contract ABI bindings - generate with abigen")
}

// GetSpreadNum reads the spreadNum parameter from the contract
func (tc *TableContract) GetSpreadNum(ctx context.Context) (*big.Int, error) {
	// Note: This requires contract ABI bindings
	return nil, fmt.Errorf("GetSpreadNum requires contract ABI bindings - generate with abigen")
}

// GetGrowthCapBps reads the growthCapBps parameter from the contract
func (tc *TableContract) GetGrowthCapBps(ctx context.Context) (*big.Int, error) {
	// Note: This requires contract ABI bindings
	return nil, fmt.Errorf("GetGrowthCapBps requires contract ABI bindings - generate with abigen")
}

// GetTableMin reads the tableMin parameter from the contract
func (tc *TableContract) GetTableMin(ctx context.Context) (*big.Int, error) {
	// Note: This requires contract ABI bindings
	return nil, fmt.Errorf("GetTableMin requires contract ABI bindings - generate with abigen")
}

// GetTableMax reads the tableMax parameter from the contract
func (tc *TableContract) GetTableMax(ctx context.Context) (*big.Int, error) {
	// Note: This requires contract ABI bindings
	return nil, fmt.Errorf("GetTableMax requires contract ABI bindings - generate with abigen")
}

// FulfillRandomness calls the fulfillRandomness function on the Table contract
// Note: VRF automatically calls fulfillRandomWords, but this is kept for backward compatibility
func (tc *TableContract) FulfillRandomness(ctx context.Context, handId *big.Int, seed [32]byte) error {
	// Note: This requires contract ABI bindings generated via abigen
	// The contract's fulfillRandomWords is called automatically by VRF coordinator
	// This function is kept for backward compatibility only
	return fmt.Errorf("FulfillRandomness requires contract ABI bindings - VRF calls fulfillRandomWords automatically")
}

// Close closes the ethereum client connection
func (tc *TableContract) Close() {
	if tc.client != nil {
		tc.client.Close()
	}
}
