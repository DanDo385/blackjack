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
	TableAddr      string
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

	// Try to find Table address from DeployTables broadcast
	// TableCreated event signature: keccak256("TableCreated(address)")
	tableCreatedSig := "0x8c32c568416fcf6f835b4866c4b1e199032e90de1e3b5e29c8c5c5f122922084"

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
						// Data format: table address (32 bytes)
						if len(log.Data) >= 66 { // 0x + 64 hex chars
							// Remove 0x prefix and extract table address
							dataHex := strings.TrimPrefix(log.Data, "0x")
							if len(dataHex) >= 64 {
								// Table address is 32 bytes (64 hex chars)
								tableAddrHex := "0x" + dataHex[24:64] // Skip leading zeros, take address
								addrs.TableAddr = tableAddrHex
								break // Only need one table now
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
	if addrs.TableAddr == "" {
		addrs.TableAddr = os.Getenv("TABLE_ADDR")
	}
	if addrs.TreasuryAddr == "" {
		addrs.TreasuryAddr = os.Getenv("TREASURY_ADDR")
	}
	if addrs.VRFCoordinator == "" {
		addrs.VRFCoordinator = os.Getenv("VRF_COORDINATOR")
	}

	return addrs, nil
}

// GetTableAddress returns the table address based on env or Foundry
// TABLE_ADDRESS should be the Table contract address (not Factory) since events are emitted from Table contracts
func GetTableAddress() string {
	// First check env var
	if addr := os.Getenv("TABLE_ADDRESS"); addr != "" {
		return addr
	}

	// Try to load from Foundry (default to chain 31337 for Anvil)
	addrs, err := LoadAddressesFromFoundry(31337)
	if err == nil && addrs.TableAddr != "" {
		return addrs.TableAddr
	}

	// Last resort: return empty (will disable event watcher)
	return ""
}

