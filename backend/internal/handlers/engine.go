package handlers

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"math/rand"
	"net/http"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/contracts"
	"github.com/DanDo385/blackjack/backend/internal/game"
	"github.com/DanDo385/blackjack/backend/internal/storage"
	"github.com/ethereum/go-ethereum/common"
)

// Card represents a playing card
type Card struct {
	Suit  string `json:"suit"`  // C, D, H, S
	Value string `json:"value"` // A, 2-10, J, Q, K
}

// GameState represents the current game state
type GameState struct {
	HandID     int      `json:"handId"`
	DealerHand []string `json:"dealerHand"` // Card image paths
	PlayerHand []string `json:"playerHand"` // Card image paths
	Tokens     float64  `json:"tokens"`
	Message    string   `json:"message"`
}

// ActionRequest represents a game action request
type ActionRequest struct {
	HandID       int     `json:"handId"`
	Action       string  `json:"action"`
	BuyInsurance bool    `json:"buyInsurance,omitempty"`
	Amount       float64 `json:"amount,omitempty"`
}

var suits = []string{"C", "D", "H", "S"}
var values = []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

// cardToImagePath converts a card to its image path
func cardToImagePath(value, suit string) string {
	if value == "J" {
		// Handle jokers/special cards
		return fmt.Sprintf("/cards/J-%s.png", suit)
	}
	return fmt.Sprintf("/cards/%s-%s.png", value, suit)
}

// dealCard deals a random card
func dealCard() Card {
	return Card{
		Suit:  suits[rand.Intn(len(suits))],
		Value: values[rand.Intn(len(values))],
	}
}

// dealInitialHands deals initial cards for dealer and player
func dealInitialHands() ([]string, []string) {
	dealerCards := []Card{dealCard(), dealCard()}
	playerCards := []Card{dealCard(), dealCard()}

	dealerHand := make([]string, len(dealerCards))
	playerHand := make([]string, len(playerCards))

	for i, card := range dealerCards {
		if i == 0 {
			// First dealer card is face-up
			dealerHand[i] = cardToImagePath(card.Value, card.Suit)
		} else {
			// Second dealer card is face-down
			dealerHand[i] = "/cards/back.png"
		}
	}

	for i, card := range playerCards {
		playerHand[i] = cardToImagePath(card.Value, card.Suit)
	}

	return dealerHand, playerHand
}

func GetEngineState(w http.ResponseWriter, r *http.Request) {
	resp := map[string]any{
		"trueCount": 1.4, "shoePct": 62,
		"anchor": 100.0, "spreadNum": 4.0, "lastBet": 120.0,
		"growthCapBps": 3300, "tableMin": 5.0, "tableMax": 5000.0,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostBet(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req struct {
		Amount  float64 `json:"amount"`
		Token   string  `json:"token"`
		USDCRef *string `json:"usdcRef,omitempty"`
		QuoteID *string `json:"quoteId,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get player address from request (in production, authenticate/authorize)
	// For now, use a placeholder - in production get from auth token
	playerAddr := r.Header.Get("X-Player-Address")
	if playerAddr == "" {
		http.Error(w, "Player address required", http.StatusBadRequest)
		return
	}

	// Convert amount to big.Int (assuming 18 decimals for most tokens)
	amountWei := new(big.Int)
	amountFloat := big.NewFloat(req.Amount)
	amountFloat.Mul(amountFloat, big.NewFloat(1e18))
	amountWei, _ = amountFloat.Int(nil)

	_ = common.HexToAddress(req.Token) // tokenAddr - stored for future contract calls

	// Get table address from Foundry broadcast or env
	tableAddr := contracts.GetTableAddress()
	if tableAddr == "" {
		// Fallback: return pending state without calling contract
		handID := time.Now().Unix()

		// Save to Redis as pending
		handState := map[string]interface{}{
			"handId":     handID,
			"player":     playerAddr,
			"token":      req.Token,
			"amount":     amountWei.String(),
			"status":     "pending_contract",
			"created_at": time.Now().Unix(),
		}
		storage.SetHandState(ctx, handID, handState, 30*time.Minute)

		resp := map[string]interface{}{
			"handId":  handID,
			"status":  "pending",
			"message": "Bet placed, awaiting contract confirmation",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	// Create table contract wrapper
	tableContract, err := contracts.NewTableContract(tableAddr)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to connect to contract: %v", err), http.StatusInternalServerError)
		return
	}
	defer tableContract.Close()

	// Prepare parameters
	var usdcRef *big.Int
	if req.USDCRef != nil {
		usdcRef = new(big.Int)
		usdcRef.SetString(*req.USDCRef, 10)
	}

	var quoteId [32]byte
	if req.QuoteID != nil {
		quoteBytes, _ := hex.DecodeString(*req.QuoteID)
		copy(quoteId[:], quoteBytes)
	}

	// Call placeBet on contract
	// Note: This requires ABI bindings - for now return pending state
	handID := time.Now().Unix()

	// Save to Redis and PostgreSQL
	handState := map[string]interface{}{
		"handId":     handID,
		"player":     playerAddr,
		"token":      req.Token,
		"amount":     amountWei.String(),
		"status":     "pending_randomness",
		"created_at": time.Now().Unix(),
	}
	storage.SetHandState(ctx, handID, handState, 30*time.Minute)

	// Save to PostgreSQL
	err = storage.SaveHandStart(ctx, handID, playerAddr, req.Token, amountWei.String(), "")
	if err != nil {
		// Log but don't fail request
		fmt.Printf("Warning: Failed to save hand to PostgreSQL: %v\n", err)
	}

	resp := map[string]interface{}{
		"handId":  handID,
		"status":  "pending",
		"message": "Bet placed, awaiting VRF randomness",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// PostResolve resolves a hand using stored VRF seed
func PostResolve(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req struct {
		HandID int64 `json:"handId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Get hand state from Redis
	handState, err := storage.GetHandState(ctx, req.HandID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Hand not found: %v", err), http.StatusNotFound)
		return
	}

	seedHex, ok := handState["seed"].(string)
	if !ok || seedHex == "" {
		http.Error(w, "Hand randomness not yet fulfilled", http.StatusBadRequest)
		return
	}

	// Decode seed
	seed, err := hex.DecodeString(seedHex)
	if err != nil || len(seed) != 32 {
		http.Error(w, "Invalid seed format", http.StatusBadRequest)
		return
	}

	// Get hand details
	playerAddr, _ := handState["player"].(string)
	tokenAddr, _ := handState["token"].(string)
	amountStr, _ := handState["amount"].(string)

	// Resolve hand using game engine
	result, err := game.ResolveHand(req.HandID, playerAddr, tokenAddr, amountStr, seed)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to resolve hand: %v", err), http.StatusInternalServerError)
		return
	}

	// Save result to PostgreSQL
	err = storage.SaveHandResult(ctx, result)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to save result: %v", err), http.StatusInternalServerError)
		return
	}

	// Update Redis
	storage.UpdateHandState(ctx, req.HandID, map[string]interface{}{
		"status":      "resolved",
		"result":      result.Outcome,
		"payout":      result.Payout.String(),
		"dealerCards": result.DealerCards,
		"playerCards": result.PlayerCards,
	}, 15*time.Minute)

	// Return resolved state
	resp := map[string]interface{}{
		"handId":       result.HandID,
		"outcome":      result.Outcome,
		"payout":       result.Payout.String(),
		"dealerHand":   result.DealerCards,
		"playerHand":   result.PlayerCards,
		"feeLink":      result.FeeLink.String(),
		"feeNickelRef": result.FeeNickelRef.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostHit(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Deal a new card to player
	newCard := dealCard()
	cardPath := cardToImagePath(newCard.Value, newCard.Suit)

	// In a real implementation, you'd fetch the current hand from storage
	// For now, return updated state
	resp := GameState{
		HandID:     req.HandID,
		PlayerHand: []string{cardPath}, // Simplified - should append to existing hand
		Message:    "Card dealt",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostStand(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Dealer plays according to rules (hit on 16, stand on 17)
	// Simplified implementation
	resp := GameState{
		HandID:  req.HandID,
		Message: "Player stands. Dealer plays.",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostSplit(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Split the hand (create two hands)
	resp := GameState{
		HandID:  req.HandID,
		Message: "Hand split",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostDouble(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Double down - deal one card and stand
	newCard := dealCard()
	cardPath := cardToImagePath(newCard.Value, newCard.Suit)

	resp := GameState{
		HandID:     req.HandID,
		PlayerHand: []string{cardPath},
		Message:    "Doubled down",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostInsurance(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.BuyInsurance {
		resp := GameState{
			HandID:  req.HandID,
			Message: "Insurance purchased",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	} else {
		resp := GameState{
			HandID:  req.HandID,
			Message: "Insurance declined",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

func PostCashOut(w http.ResponseWriter, r *http.Request) {
	log.Println("PostCashOut handler called")
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("PostCashOut: decode error: %v", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	log.Printf("PostCashOut: handId=%d", req.HandID)

	// Cash out - return tokens to player
	resp := map[string]any{
		"handId":  req.HandID,
		"message": "Tokens cashed out",
		"ok":      true,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
	log.Println("PostCashOut: response sent")
}
