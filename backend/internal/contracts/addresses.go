package contracts

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// DeploymentAddresses holds contract addresses from Foundry deployments
type DeploymentAddresses struct {
	FactoryAddr    string
	TableStdAddr   string
	TablePremAddr  string
	TreasuryAddr   string
	VRFCoordinator string
}

// LoadAddressesFromFoundry reads contract addresses from Foundry broadcast files
// Looks for addresses in contracts/broadcast/DeployTables.s.sol/{chainId}/run-latest.json
// Falls back to environment variables if broadcast files not found
func LoadAddressesFromFoundry(chainID int64) (*DeploymentAddresses, error) {
	addrs := &DeploymentAddresses{}

	// Try to find Factory address from DeployFactory broadcast
	factoryPath := filepath.Join("contracts", "broadcast", "DeployFactory.s.sol", fmt.Sprintf("%d", chainID), "run-latest.json")
	if _, err := os.Stat(factoryPath); os.IsNotExist(err) {
		factoryPath = filepath.Join("..", factoryPath)
	}
	if factoryData, err := os.ReadFile(factoryPath); err == nil {
		var factoryBroadcast struct {
			Receipts []struct {
				ContractAddress string `json:"contractAddress"`
			} `json:"receipts"`
		}
		if err := json.Unmarshal(factoryData, &factoryBroadcast); err == nil && len(factoryBroadcast.Receipts) > 0 {
			addrs.FactoryAddr = factoryBroadcast.Receipts[0].ContractAddress
		}
	}

	// Try to find Table addresses from DeployTables broadcast
	// TableCreated event signature: keccak256("TableCreated(address,bool)")
	tableCreatedSig := "0xbc20dac13c4f58bd3c4597ad92ac146cd8edd02d82169590e66cee339c7d98d1"
	
	broadcastPath := filepath.Join("contracts", "broadcast", "DeployTables.s.sol", fmt.Sprintf("%d", chainID), "run-latest.json")
	if _, err := os.Stat(broadcastPath); os.IsNotExist(err) {
		broadcastPath = filepath.Join("..", broadcastPath)
	}

	if data, err := os.ReadFile(broadcastPath); err == nil {
		var broadcast struct {
			Receipts []struct {
				Logs []struct {
					Address string   `json:"address"`
					Topics  []string `json:"topics"`
					Data    string   `json:"data"`
				} `json:"logs"`
			} `json:"receipts"`
		}

		if err := json.Unmarshal(data, &broadcast); err == nil {
			for _, receipt := range broadcast.Receipts {
				for _, log := range receipt.Logs {
					if len(log.Topics) > 0 && log.Topics[0] == tableCreatedSig {
						// Decode Table address from log data
						// Data format: table address (32 bytes) + premier flag (32 bytes)
						if len(log.Data) >= 130 { // 0x + 128 hex chars
							// Remove 0x prefix and extract table address (first 64 chars = 32 bytes)
							dataHex := strings.TrimPrefix(log.Data, "0x")
							if len(dataHex) >= 128 {
								// Table address is first 32 bytes (64 hex chars)
								tableAddrHex := "0x" + dataHex[24:64] // Skip leading zeros, take address
								
								// Premier flag is second 32 bytes (last 64 hex chars)
								premierHex := dataHex[64:128]
								isPremier := premierHex != "0000000000000000000000000000000000000000000000000000000000000000"
								
								if isPremier {
									addrs.TablePremAddr = tableAddrHex
								} else {
									addrs.TableStdAddr = tableAddrHex
								}
							}
						}
					}
				}
			}
		}
	}

	// Fall back to environment variables if addresses not found
	if addrs.FactoryAddr == "" {
		addrs.FactoryAddr = os.Getenv("FACTORY_ADDR")
	}
	if addrs.TableStdAddr == "" {
		addrs.TableStdAddr = os.Getenv("TABLE_STD_ADDR")
	}
	if addrs.TablePremAddr == "" {
		addrs.TablePremAddr = os.Getenv("TABLE_PREM_ADDR")
	}
	if addrs.TreasuryAddr == "" {
		addrs.TreasuryAddr = os.Getenv("TREASURY_ADDR")
	}
	if addrs.VRFCoordinator == "" {
		addrs.VRFCoordinator = os.Getenv("VRF_COORDINATOR")
	}

	return addrs, nil
}

// GetTableAddress returns the appropriate table address based on env or Foundry
// Defaults to standard table if TABLE_ADDRESS not set
// TABLE_ADDRESS should be the Table contract address (not Factory) since events are emitted from Table contracts
func GetTableAddress() string {
	// First check env var
	if addr := os.Getenv("TABLE_ADDRESS"); addr != "" {
		return addr
	}

	// Try to load from Foundry (default to chain 31337 for Anvil)
	addrs, err := LoadAddressesFromFoundry(31337)
	if err == nil && addrs.TableStdAddr != "" {
		return addrs.TableStdAddr
	}

	// Last resort: return empty (will disable event watcher)
	return ""
}

