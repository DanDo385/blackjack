package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"math/rand"
	"net/http"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/game"
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

// ErrorResponse represents a structured error response
type ErrorResponse struct {
	Error struct {
		Code    string                 `json:"code"`
		Message string                 `json:"message"`
		Details map[string]interface{} `json:"details,omitempty"`
	} `json:"error"`
}

// writeError writes a structured error response
func writeError(w http.ResponseWriter, status int, code, message string, details map[string]interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	
	var resp ErrorResponse
	resp.Error.Code = code
	resp.Error.Message = message
	if details != nil {
		resp.Error.Details = details
	}
	
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("[writeError] Failed to encode error response: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// logError logs a structured error with context
func logError(route, operation string, err error, details map[string]interface{}) {
	log.Printf("[%s] ERROR %s: %v", route, operation, err)
	if details != nil {
		log.Printf("[%s] Details: %+v", route, details)
	}
}

func GetEngineState(w http.ResponseWriter, r *http.Request) {
	// Recover from any panics
	defer func() {
		if rec := recover(); rec != nil {
			logError("GetEngineState", "panic recovered", fmt.Errorf("%v", rec), map[string]interface{}{
				"status": http.StatusInternalServerError,
				"route":  "/api/engine/state",
			})
			writeError(w, http.StatusInternalServerError, "PANIC_ERROR", "Internal server error occurred", map[string]interface{}{
				"panic": fmt.Sprintf("%v", rec),
			})
		}
	}()

	log.Printf("[GetEngineState] Incoming request from %s %s", r.Method, r.RemoteAddr)

	// Get the global engine instance (always returns valid state)
	engine := game.GetEngine()
	if engine == nil {
		logError("GetEngineState", "engine nil", fmt.Errorf("engine instance is nil"), nil)
		writeError(w, http.StatusInternalServerError, "ENGINE_ERROR", "Game engine not available", nil)
		return
	}

	state := engine.GetState()
	if state == nil {
		logError("GetEngineState", "state nil", fmt.Errorf("engine state is nil"), nil)
		writeError(w, http.StatusInternalServerError, "STATE_ERROR", "Game state not available", nil)
		return
	}

	log.Printf("[GetEngineState] Current phase: %s, detail: %s", state.Phase, state.PhaseDetail)
	log.Printf("[GetEngineState] HandID: %d, DeckInitialized: %v, CardsDealt: %d/%d",
		state.HandID, state.DeckInitialized, state.CardsDealt, state.TotalCards)

	// Build response with full state
	resp := map[string]any{
		// Phase information
		"phase":          state.Phase,
		"phaseDetail":    state.PhaseDetail,

		// Game state
		"handId":         state.HandID,
		"deckInitialized": state.DeckInitialized,
		"cardsDealt":     state.CardsDealt,
		"totalCards":     state.TotalCards,

		// Hands (only if cards exist)
		"dealerHand":     state.DealerHand,
		"playerHand":     state.PlayerHand,

		// Outcome (only if complete)
		"outcome":        state.Outcome,
		"payout":         state.Payout,

		// Counting metrics
		"trueCount":      state.TrueCount,
		"shoePct":        state.ShoePct,
		"runningCount":   state.RunningCount,

		// Table parameters
		"anchor":         state.Anchor,
		"spreadNum":      state.SpreadNum,
		"lastBet":        state.LastBet,
		"growthCapBps":   state.GrowthCapBps,
		"tableMin":       state.TableMin,
		"tableMax":       state.TableMax,

		// Metadata
		"lastUpdated":    func() int64 {
			if state.LastUpdated.IsZero() {
				return 0
			}
			return state.LastUpdated.Unix()
		}(),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		logError("GetEngineState", "encode response", err, map[string]interface{}{
			"status": http.StatusInternalServerError,
			"route":  "/api/engine/state",
		})
		writeError(w, http.StatusInternalServerError, "ENCODE_ERROR", "Failed to encode response", map[string]interface{}{
			"original_error": err.Error(),
		})
		return
	}

	log.Printf("[GetEngineState] Response sent successfully")
}

func PostBet(w http.ResponseWriter, r *http.Request) {
	// Recover from any panics
	defer func() {
		if rec := recover(); rec != nil {
			logError("PostBet", "panic recovered", fmt.Errorf("%v", rec), map[string]interface{}{
				"status": http.StatusInternalServerError,
				"route":  "/api/engine/bet",
			})
			writeError(w, http.StatusInternalServerError, "PANIC_ERROR", "Internal server error occurred during bet placement", map[string]interface{}{
				"panic": fmt.Sprintf("%v", rec),
			})
		}
	}()

	log.Printf("[PostBet] Incoming bet request from %s", r.RemoteAddr)

	var req struct {
		Amount  float64 `json:"amount"`
		Token   string  `json:"token"`
		USDCRef *string `json:"usdcRef,omitempty"`
		QuoteID *string `json:"quoteId,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logError("PostBet", "decode request", err, nil)
		writeError(w, http.StatusBadRequest, "DECODE_ERROR", "Invalid request format", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	log.Printf("[PostBet] Bet amount: %.2f, token: %s", req.Amount, req.Token)

	// Get player address from request (in production, authenticate/authorize)
	playerAddr := r.Header.Get("X-Player-Address")
	if playerAddr == "" {
		playerAddr = "0x0000000000000000000000000000000000000000" // Demo fallback
		log.Printf("[PostBet] No player address provided, using demo address")
	}

	// Convert amount to big.Int (assuming 18 decimals for most tokens)
	amountWei := new(big.Int)
	amountFloat := big.NewFloat(req.Amount)
	amountFloat.Mul(amountFloat, big.NewFloat(1e18))
	amountWei, _ = amountFloat.Int(nil)

	tokenAddr := req.Token
	if tokenAddr == "" {
		tokenAddr = "0x0000000000000000000000000000000000000000" // Demo fallback
	}

	// Generate hand ID
	handID := time.Now().Unix()

	// Get engine and start hand
	engine := game.GetEngine()
	if engine == nil {
		logError("PostBet", "get engine", fmt.Errorf("engine is nil"), nil)
		writeError(w, http.StatusInternalServerError, "ENGINE_ERROR", "Game engine not available", nil)
		return
	}

	if err := engine.StartHand(handID, playerAddr, tokenAddr, amountWei.String(), req.Amount); err != nil {
		logError("PostBet", "start hand", err, map[string]interface{}{
			"handId": handID,
			"player": playerAddr,
		})
		writeError(w, http.StatusInternalServerError, "START_HAND_ERROR", "Failed to start hand", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	log.Printf("[PostBet] Hand started: handID=%d, phase=SHUFFLING", handID)

	// Generate random seed for shuffle (in production, this would come from VRF)
	seed := make([]byte, 32)
	rand.Read(seed)

	// Shuffle and deal
	if err := engine.ShuffleAndDeal(seed); err != nil {
		logError("PostBet", "shuffle and deal", err, map[string]interface{}{
			"handId": handID,
		})
		writeError(w, http.StatusInternalServerError, "SHUFFLE_ERROR", "Failed to shuffle and deal cards", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	// Get current state
	state := engine.GetState()
	if state == nil {
		logError("PostBet", "get state", fmt.Errorf("state is nil after ShuffleAndDeal"), map[string]interface{}{
			"handId": handID,
		})
		writeError(w, http.StatusInternalServerError, "STATE_ERROR", "Failed to retrieve game state", nil)
		return
	}

	log.Printf("[PostBet] Cards dealt: phase=%s, dealer=%v, player=%v",
		state.Phase, state.DealerHand, state.PlayerHand)

	// Return state with dealt cards
	resp := map[string]interface{}{
		"handId":      handID,
		"status":      "dealt",
		"phase":       state.Phase,
		"phaseDetail": state.PhaseDetail,
		"dealerHand":  state.DealerHand,
		"playerHand":  state.PlayerHand,
		"message":     "Cards dealt - player's turn",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		logError("PostBet", "encode response", err, map[string]interface{}{
			"handId": handID,
		})
		writeError(w, http.StatusInternalServerError, "ENCODE_ERROR", "Failed to encode response", map[string]interface{}{
			"error": err.Error(),
		})
		return
	}

	log.Printf("[PostBet] Response sent successfully")
}

// PostResolve resolves a hand using stored VRF seed
func PostResolve(w http.ResponseWriter, r *http.Request) {
	var req struct {
		HandID int64 `json:"handId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// For demo purposes, generate a random seed
	seed := make([]byte, 32)
	rand.Read(seed)

	// Mock hand details
	playerAddr := "0x0000000000000000000000000000000000000000"
	tokenAddr := "0x0000000000000000000000000000000000000000"
	amountStr := "1000000000000000000" // 1 token

	// Resolve hand using game engine
	result, err := game.ResolveHand(req.HandID, playerAddr, tokenAddr, amountStr, seed)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to resolve hand: %v", err), http.StatusInternalServerError)
		return
	}

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
	log.Printf("[PostHit] Incoming hit request")

	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[PostHit] Error decoding request: %v", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	log.Printf("[PostHit] HandID: %d", req.HandID)

	// Get engine and execute hit
	engine := game.GetEngine()
	if err := engine.PlayerHit(); err != nil {
		log.Printf("[PostHit] Error executing hit: %v", err)
		http.Error(w, fmt.Sprintf("Failed to hit: %v", err), http.StatusBadRequest)
		return
	}

	// Get current state
	state := engine.GetState()

	log.Printf("[PostHit] Card dealt: phase=%s, playerHand=%v", state.Phase, state.PlayerHand)

	// Check if player busted
	if state.Phase == game.PhaseResolution {
		// Auto-resolve
		if err := engine.ResolveHand(); err != nil {
			log.Printf("[PostHit] Error resolving hand: %v", err)
		}
		state = engine.GetState()
	}

	resp := map[string]interface{}{
		"handId":      req.HandID,
		"phase":       state.Phase,
		"phaseDetail": state.PhaseDetail,
		"playerHand":  state.PlayerHand,
		"dealerHand":  state.DealerHand,
		"outcome":     state.Outcome,
		"payout":      state.Payout,
		"message":     "Card dealt",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func PostStand(w http.ResponseWriter, r *http.Request) {
	log.Printf("[PostStand] Incoming stand request")

	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[PostStand] Error decoding request: %v", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	log.Printf("[PostStand] HandID: %d", req.HandID)

	// Get engine and execute stand
	engine := game.GetEngine()
	if err := engine.PlayerStand(); err != nil {
		log.Printf("[PostStand] Error executing stand: %v", err)
		http.Error(w, fmt.Sprintf("Failed to stand: %v", err), http.StatusBadRequest)
		return
	}

	// Execute dealer play
	if err := engine.DealerPlay(); err != nil {
		log.Printf("[PostStand] Error executing dealer play: %v", err)
		http.Error(w, fmt.Sprintf("Failed dealer play: %v", err), http.StatusInternalServerError)
		return
	}

	// Resolve hand
	if err := engine.ResolveHand(); err != nil {
		log.Printf("[PostStand] Error resolving hand: %v", err)
		http.Error(w, fmt.Sprintf("Failed to resolve: %v", err), http.StatusInternalServerError)
		return
	}

	// Get final state
	state := engine.GetState()

	log.Printf("[PostStand] Hand complete: phase=%s, outcome=%s, payout=%s",
		state.Phase, state.Outcome, state.Payout)

	resp := map[string]interface{}{
		"handId":      req.HandID,
		"phase":       state.Phase,
		"phaseDetail": state.PhaseDetail,
		"dealerHand":  state.DealerHand,
		"playerHand":  state.PlayerHand,
		"outcome":     state.Outcome,
		"payout":      state.Payout,
		"message":     fmt.Sprintf("Hand complete - %s", state.Outcome),
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
