package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"
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
	var req struct {
		Amount float64 `json:"amount"`
		Token  string  `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Deal initial hands
	dealerHand, playerHand := dealInitialHands()

	// Generate hand ID
	handID := int(time.Now().Unix())

	resp := GameState{
		HandID:     handID,
		DealerHand: dealerHand,
		PlayerHand: playerHand,
		Tokens:     req.Amount,
		Message:    "Cards dealt",
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
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Cash out - return tokens to player
	resp := map[string]any{
		"handId":  req.HandID,
		"message": "Tokens cashed out",
		"ok":      true,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}


