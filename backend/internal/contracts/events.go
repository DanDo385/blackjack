package contracts

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/game"
	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Event signatures (keccak256 of event signature)
var (
	// HandStarted(uint256 indexed handId, address indexed player, address token, uint256 amount, bytes32 vrfReqId)
	handStartedSig = crypto.Keccak256Hash([]byte("HandStarted(uint256,address,address,uint256,bytes32)"))

	// RandomFulfilled(uint256 indexed handId, bytes32 seed)
	randomFulfilledSig = crypto.Keccak256Hash([]byte("RandomFulfilled(uint256,bytes32)"))

	// HandSettled(uint256 indexed handId, address indexed player, int256 pnl, address payoutToken, uint256 payoutAmount, uint256 feeLink, uint256 feeNickelRef)
	handSettledSig = crypto.Keccak256Hash([]byte("HandSettled(uint256,address,int256,address,uint256,uint256,uint256)"))
)

// EventWatcher watches for Table contract events and processes them
type EventWatcher struct {
	client    *ethclient.Client
	tableAddr common.Address
	stopChan  chan struct{}
	wg        sync.WaitGroup
}

// NewEventWatcher creates a new event watcher for the Table contract
func NewEventWatcher(tableAddress string) (*EventWatcher, error) {
	rpcURL := os.Getenv("RPC_URL")
	wsURL := os.Getenv("WS_RPC_URL")

	if wsURL == "" {
		wsURL = deriveWebsocketURL(rpcURL)
	}
	if wsURL == "" {
		wsURL = "ws://localhost:8545"
	}

	client, err := ethclient.Dial(wsURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ethereum client using websockets (%s): %w", wsURL, err)
	}

	return &EventWatcher{
		client:    client,
		tableAddr: common.HexToAddress(tableAddress),
		stopChan:  make(chan struct{}),
	}, nil
}

// deriveWebsocketURL converts an HTTP RPC endpoint to its WebSocket equivalent if needed.
func deriveWebsocketURL(raw string) string {
	raw = strings.TrimSpace(raw)
	switch {
	case raw == "":
		return ""
	case strings.HasPrefix(raw, "ws://"), strings.HasPrefix(raw, "wss://"):
		return raw
	case strings.HasPrefix(raw, "http://"):
		return "ws://" + strings.TrimPrefix(raw, "http://")
	case strings.HasPrefix(raw, "https://"):
		return "wss://" + strings.TrimPrefix(raw, "https://")
	default:
		// Assume bare host:port should use ws://
		return "ws://" + raw
	}
}

// Start begins watching for events in a goroutine
func (ew *EventWatcher) Start(ctx context.Context) {
	ew.wg.Add(1)
	go ew.watchEvents(ctx)
}

// Stop stops the event watcher
func (ew *EventWatcher) Stop() {
	close(ew.stopChan)
	ew.wg.Wait()
	if ew.client != nil {
		ew.client.Close()
	}
}

// watchEvents continuously watches for contract events
func (ew *EventWatcher) watchEvents(ctx context.Context) {
	defer ew.wg.Done()

	query := ethereum.FilterQuery{
		Addresses: []common.Address{ew.tableAddr},
	}

	logs := make(chan types.Log)
	sub, err := ew.client.SubscribeFilterLogs(ctx, query, logs)
	if err != nil {
		log.Printf("Failed to subscribe to logs: %v", err)
		return
	}
	defer sub.Unsubscribe()

	for {
		select {
		case <-ew.stopChan:
			return
		case err := <-sub.Err():
			log.Printf("Event subscription error: %v", err)
			// Reconnect after delay
			time.Sleep(5 * time.Second)
			continue
		case logEntry := <-logs:
			ew.handleLog(ctx, logEntry)
		}
	}
}

// handleLog processes a log entry and routes to appropriate handler
func (ew *EventWatcher) handleLog(ctx context.Context, logEntry types.Log) {
	if len(logEntry.Topics) == 0 {
		return
	}

	eventSig := logEntry.Topics[0]

	// Match event signatures by comparing topic[0] with known signatures
	if eventSig == handStartedSig && len(logEntry.Topics) >= 3 {
		ew.handleHandStarted(ctx, logEntry)
		return
	}

	if eventSig == randomFulfilledSig && len(logEntry.Topics) >= 2 {
		ew.handleRandomFulfilled(ctx, logEntry)
		return
	}

	if eventSig == handSettledSig && len(logEntry.Topics) >= 3 {
		ew.handleHandSettled(ctx, logEntry)
		return
	}
}

// handleHandStarted processes HandStarted events
// Event: HandStarted(uint256 indexed handId, address indexed player, address token, uint256 amount, bytes32 vrfReqId)
func (ew *EventWatcher) handleHandStarted(ctx context.Context, logEntry types.Log) {
	if len(logEntry.Topics) < 3 || len(logEntry.Data) < 96 {
		log.Printf("Invalid HandStarted event data")
		return
	}

	handId := new(big.Int).SetBytes(logEntry.Topics[1].Bytes())
	playerAddr := common.BytesToAddress(logEntry.Topics[2].Bytes())

	// Decode remaining data: token (address), amount (uint256), vrfReqId (bytes32)
	data := logEntry.Data
	tokenAddr := common.BytesToAddress(data[0:32])
	amount := new(big.Int).SetBytes(data[32:64])
	vrfReqId := data[64:96]

	log.Printf("HandStarted: handId=%s, player=%s, token=%s, amount=%s, vrfReqId=%s",
		handId.String(), playerAddr.Hex(), tokenAddr.Hex(), amount.String(), hex.EncodeToString(vrfReqId))

	// Save hand to PostgreSQL
	handID := handId.Int64()
	err := storage.SaveHandStart(ctx, handID, playerAddr.Hex(), tokenAddr.Hex(), amount.String(), hex.EncodeToString(vrfReqId))
	if err != nil {
		log.Printf("Failed to save hand start: %v", err)
		return
	}

	// Cache in Redis
	handState := map[string]interface{}{
		"handId":     handID,
		"player":     playerAddr.Hex(),
		"token":      tokenAddr.Hex(),
		"amount":     amount.String(),
		"vrfReqId":   hex.EncodeToString(vrfReqId),
		"status":     "pending_randomness",
		"created_at": time.Now().Unix(),
	}
	storage.SetHandState(ctx, handID, handState, 30*time.Minute)
}

// handleRandomFulfilled processes RandomFulfilled events
// Event: RandomFulfilled(uint256 indexed handId, bytes32 seed)
func (ew *EventWatcher) handleRandomFulfilled(ctx context.Context, logEntry types.Log) {
	if len(logEntry.Topics) < 2 || len(logEntry.Data) < 32 {
		log.Printf("Invalid RandomFulfilled event data")
		return
	}

	handId := new(big.Int).SetBytes(logEntry.Topics[1].Bytes())
	seed := logEntry.Data[0:32]

	log.Printf("RandomFulfilled: handId=%s, seed=%s", handId.String(), hex.EncodeToString(seed))

	// Update Redis with seed
	handID := handId.Int64()
	storage.UpdateHandSeed(ctx, handID, hex.EncodeToString(seed))

	// Trigger async hand resolution
	go ew.resolveHand(ctx, handID, seed)
}

// handleHandSettled processes HandSettled events
// Event: HandSettled(uint256 indexed handId, address indexed player, int256 pnl, address payoutToken, uint256 payoutAmount, uint256 feeLink, uint256 feeNickelRef)
func (ew *EventWatcher) handleHandSettled(ctx context.Context, logEntry types.Log) {
	if len(logEntry.Topics) < 3 || len(logEntry.Data) < 192 {
		log.Printf("Invalid HandSettled event data")
		return
	}

	handId := new(big.Int).SetBytes(logEntry.Topics[1].Bytes())
	playerAddr := common.BytesToAddress(logEntry.Topics[2].Bytes())

	// Decode data: pnl (int256), payoutToken (address), payoutAmount (uint256), feeLink (uint256), feeNickelRef (uint256)
	data := logEntry.Data
	pnl := new(big.Int).SetBytes(data[0:32])
	_ = common.BytesToAddress(data[32:64]) // payoutToken - stored but not used here
	payoutAmount := new(big.Int).SetBytes(data[64:96])
	feeLink := new(big.Int).SetBytes(data[96:128])
	feeNickelRef := new(big.Int).SetBytes(data[128:160])

	log.Printf("HandSettled: handId=%s, player=%s, pnl=%s, payout=%s, fees=%s/%s",
		handId.String(), playerAddr.Hex(), pnl.String(), payoutAmount.String(), feeLink.String(), feeNickelRef.String())

	// Update hand in PostgreSQL
	handID := handId.Int64()
	now := time.Now()
	result := "lose"
	if pnl.Sign() > 0 {
		result = "win"
	} else if pnl.Sign() == 0 {
		result = "push"
	}

	err := storage.UpdateHandSettlement(ctx, handID, result, payoutAmount.String(), feeLink.String(), feeNickelRef.String(), &now)
	if err != nil {
		log.Printf("Failed to update hand settlement: %v", err)
	}

	// Update user metrics
	go storage.UpdateUserMetricsAsync(ctx, playerAddr.Hex())

	// Clean up Redis cache (optional - could keep for history)
	storage.DeleteHandState(ctx, handID)
}

// resolveHand resolves a hand using the VRF seed
func (ew *EventWatcher) resolveHand(ctx context.Context, handID int64, seed []byte) {
	log.Printf("Resolving hand %d with seed %s", handID, hex.EncodeToString(seed))

	// Get hand state from Redis
	handState, err := storage.GetHandState(ctx, handID)
	if err != nil {
		log.Printf("Failed to get hand state: %v", err)
		return
	}

	playerAddr, _ := handState["player"].(string)
	tokenAddr, _ := handState["token"].(string)
	amountStr, _ := handState["amount"].(string)

	// Resolve hand using game engine
	result, err := game.ResolveHand(handID, playerAddr, tokenAddr, amountStr, seed)
	if err != nil {
		log.Printf("Failed to resolve hand: %v", err)
		return
	}

	// Save result to PostgreSQL
	err = storage.SaveHandResult(ctx, result)
	if err != nil {
		log.Printf("Failed to save hand result: %v", err)
		return
	}

	// Update Redis with resolved state
	storage.UpdateHandState(ctx, handID, map[string]interface{}{
		"status":      "resolved",
		"result":      result.Outcome,
		"payout":      result.Payout.String(),
		"dealerCards": result.DealerCards,
		"playerCards": result.PlayerCards,
	}, 15*time.Minute)

	log.Printf("Hand %d resolved: %s, payout=%s", handID, result.Outcome, result.Payout.String())
}
