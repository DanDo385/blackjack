package random

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateSeed creates a cryptographically secure random bytes32 seed
// For local development, this uses Go's crypto/rand
// For production, replace with Chainlink VRF
func GenerateSeed() ([]byte, error) {
	seed := make([]byte, 32) // bytes32 = 32 bytes
	if _, err := rand.Read(seed); err != nil {
		return nil, fmt.Errorf("failed to generate random seed: %w", err)
	}
	return seed, nil
}

// GenerateSeedHex returns a hex-encoded random seed (for debugging/logging)
func GenerateSeedHex() (string, error) {
	seed, err := GenerateSeed()
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(seed), nil
}

// Bytes32ToHex converts a bytes32 to hex string with 0x prefix
func Bytes32ToHex(seed []byte) string {
	return "0x" + hex.EncodeToString(seed)
}

