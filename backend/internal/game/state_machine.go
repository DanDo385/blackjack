package game

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/shopspring/decimal"
)

// GamePhase represents the current phase of the game
type GamePhase string

const (
	// PhaseWaitingForDeal - Initial state, waiting for player to click Deal
	PhaseWaitingForDeal GamePhase = "WAITING_FOR_DEAL"

	// PhaseShuffling - Deck is being created and shuffled
	PhaseShuffling GamePhase = "SHUFFLING"

	// PhaseDealing - Initial cards are being dealt
	PhaseDealing GamePhase = "DEALING"

	// PhasePlayerTurn - Player is making decisions (Hit, Stand, Double, Split)
	PhasePlayerTurn GamePhase = "PLAYER_TURN"

	// PhaseDealerTurn - Dealer is playing according to rules
	PhaseDealerTurn GamePhase = "DEALER_TURN"

	// PhaseResolution - Hand is being resolved and payout calculated
	PhaseResolution GamePhase = "RESOLUTION"

	// PhaseComplete - Hand is complete, waiting for next hand
	PhaseComplete GamePhase = "COMPLETE"
)

// EngineState represents the complete state of the game engine
type EngineState struct {
	// Phase tracking
	Phase       GamePhase `json:"phase"`
	PhaseDetail string    `json:"phaseDetail"` // Human-readable phase description

	// Game state
	HandID      int64    `json:"handId"`
	PlayerAddr  string   `json:"playerAddr"`
	TokenAddr   string   `json:"tokenAddr"`
	BetAmount   string   `json:"betAmount"` // In wei as string

	// Deck state
	Deck            *Deck  `json:"-"` // Not serialized
	DeckInitialized bool   `json:"deckInitialized"`
	CardsDealt      int    `json:"cardsDealt"`
	TotalCards      int    `json:"totalCards"`

	// Hand state
	DealerCards []Card   `json:"dealerCards"`
	PlayerCards []Card   `json:"playerCards"`
	DealerHand  []string `json:"dealerHand"` // Image paths
	PlayerHand  []string `json:"playerHand"` // Image paths

	// Outcome
	Outcome        string `json:"outcome"`        // win, lose, push
	Payout         string `json:"payout"`         // In wei as string
	FeeLink        string `json:"feeLink"`        // In wei as string
	FeeNickelRef   string `json:"feeNickelRef"`   // In wei as string

	// Counting metrics (for display)
	TrueCount      float64 `json:"trueCount"`
	ShoePct        int     `json:"shoePct"`
	RunningCount   int     `json:"runningCount"`

	// Table parameters
	Anchor         float64 `json:"anchor"`
	SpreadNum      float64 `json:"spreadNum"`
	LastBet        float64 `json:"lastBet"`
	GrowthCapBps   int     `json:"growthCapBps"`
	TableMin       float64 `json:"tableMin"`
	TableMax       float64 `json:"tableMax"`

	// Metadata
	CreatedAt      time.Time `json:"createdAt"`
	LastUpdated    time.Time `json:"lastUpdated"`
}

// GlobalEngine holds the global game state (singleton pattern)
type GlobalEngine struct {
	mu    sync.RWMutex
	state *EngineState
}

var (
	globalEngine     *GlobalEngine
	globalEngineOnce sync.Once
)

// GetEngine returns the singleton game engine instance
// Always returns a valid engine with safe default state
func GetEngine() *GlobalEngine {
	globalEngineOnce.Do(func() {
		globalEngine = &GlobalEngine{
			state: newDefaultState(),
		}
		log.Println("Game engine initialized with default state")
	})
	return globalEngine
}

// newDefaultState creates a new default engine state
func newDefaultState() *EngineState {
	return &EngineState{
		Phase:          PhaseWaitingForDeal,
		PhaseDetail:    "Waiting for player to place bet and deal",
		DeckInitialized: false,
		CardsDealt:     0,
		TotalCards:     0,
		DealerCards:    []Card{},
		PlayerCards:    []Card{},
		DealerHand:     []string{},
		PlayerHand:     []string{},
		Outcome:        "",
		Payout:         "0",
		FeeLink:        "0",
		FeeNickelRef:   "0",
		TrueCount:      0.0,
		ShoePct:        0,
		RunningCount:   0,
		Anchor:         100.0,
		SpreadNum:      4.0,
		LastBet:        0.0,
		GrowthCapBps:   3300,
		TableMin:       5.0,
		TableMax:       5000.0,
		CreatedAt:      time.Now(),
		LastUpdated:    time.Now(),
	}
}

// GetState returns a copy of the current state (thread-safe)
func (e *GlobalEngine) GetState() *EngineState {
	e.mu.RLock()
	defer e.mu.RUnlock()

	// Return a copy to prevent external modification
	stateCopy := *e.state
	return &stateCopy
}

// Reset resets the engine to default state
func (e *GlobalEngine) Reset() {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.state = newDefaultState()
	log.Println("Engine state reset to default")
}

// StartHand initializes a new hand with bet information
// Transitions: WAITING_FOR_DEAL → SHUFFLING
func (e *GlobalEngine) StartHand(handID int64, playerAddr, tokenAddr, betAmount string, betAmountFloat float64) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Validate current phase
	if e.state.Phase != PhaseWaitingForDeal && e.state.Phase != PhaseComplete {
		return fmt.Errorf("cannot start hand in phase %s, must be WAITING_FOR_DEAL or COMPLETE", e.state.Phase)
	}

	// Initialize new hand
	e.state.Phase = PhaseShuffling
	e.state.PhaseDetail = "Creating and shuffling deck..."
	e.state.HandID = handID
	e.state.PlayerAddr = playerAddr
	e.state.TokenAddr = tokenAddr
	e.state.BetAmount = betAmount
	e.state.LastBet = betAmountFloat
	e.state.DealerCards = []Card{}
	e.state.PlayerCards = []Card{}
	e.state.DealerHand = []string{}
	e.state.PlayerHand = []string{}
	e.state.Outcome = ""
	e.state.Payout = "0"
	e.state.LastUpdated = time.Now()

	log.Printf("Hand started: handID=%d, player=%s, amount=%s", handID, playerAddr, betAmount)
	return nil
}

// ShuffleAndDeal creates deck, shuffles with seed, and deals initial cards
// Transitions: SHUFFLING → DEALING → PLAYER_TURN
func (e *GlobalEngine) ShuffleAndDeal(seed []byte) error {
	e.mu.Lock()
	defer e.mu.Unlock()

	// Validate current phase
	if e.state.Phase != PhaseShuffling {
		return fmt.Errorf("cannot shuffle in phase %s, must be SHUFFLING", e.state.Phase)
	}

	// Create and shuffle deck (7 decks standard)
	deck := NewDeck(7)
	deck.Shuffle(seed)

	e.state.Deck = deck
	e.state.DeckInitialized = true
	e.state.TotalCards = len(deck.cards)
	e.state.CardsDealt = 0

	// Update phase to dealing
	e.state.Phase = PhaseDealing
	e.state.PhaseDetail = "Dealing initial cards..."
	e.state.LastUpdated = time.Now()

	// Deal initial hands (dealer-player-dealer-player pattern)
	e.state.DealerCards = []Card{deck.Deal(), deck.Deal()}
	e.state.PlayerCards = []Card{deck.Deal(), deck.Deal()}
	e.state.CardsDealt = 4

	// Convert to image paths
	e.state.DealerHand = []string{
		CardToImagePath(e.state.DealerCards[0]),
		"/cards/back.png", // Second dealer card is face-down
	}

	e.state.PlayerHand = []string{
		CardToImagePath(e.state.PlayerCards[0]),
		CardToImagePath(e.state.PlayerCards[1]),
	}

	// Check for blackjack
	playerBJ := IsBlackjack(e.state.PlayerCards)
	dealerBJ := IsBlackjack(e.state.DealerCards)

	if playerBJ || dealerBJ {
		// Skip to resolution
		e.state.Phase = PhaseResolution
		e.state.PhaseDetail = "Resolving blackjack..."
		// Reveal dealer's hole card
		e.state.DealerHand[1] = CardToImagePath(e.state.DealerCards[1])
	} else {
		// Move to player's turn
		e.state.Phase = PhasePlayerTurn
		e.state.PhaseDetail = "Player's turn - choose action"
	}

	e.state.LastUpdated = time.Now()
	log.Printf("Cards dealt: dealer=%v, player=%v, phase=%s", e.state.DealerCards, e.state.PlayerCards, e.state.Phase)

	return nil
}

// PlayerHit adds a card to player's hand
// Stays in: PLAYER_TURN (or moves to DEALER_TURN if bust)
func (e *GlobalEngine) PlayerHit() error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.state.Phase != PhasePlayerTurn {
		return fmt.Errorf("cannot hit in phase %s, must be PLAYER_TURN", e.state.Phase)
	}

	if e.state.Deck == nil {
		return fmt.Errorf("deck not initialized")
	}

	// Deal one card to player
	card := e.state.Deck.Deal()
	e.state.PlayerCards = append(e.state.PlayerCards, card)
	e.state.PlayerHand = append(e.state.PlayerHand, CardToImagePath(card))
	e.state.CardsDealt++

	// Check for bust
	if IsBust(e.state.PlayerCards) {
		e.state.Phase = PhaseResolution
		e.state.PhaseDetail = "Player bust - resolving hand..."
		// Reveal dealer's hole card
		e.state.DealerHand[1] = CardToImagePath(e.state.DealerCards[1])
	}

	e.state.LastUpdated = time.Now()
	log.Printf("Player hit: card=%v, total cards=%d, bust=%v", card, len(e.state.PlayerCards), IsBust(e.state.PlayerCards))

	return nil
}

// PlayerStand ends player's turn and starts dealer's turn
// Transitions: PLAYER_TURN → DEALER_TURN
func (e *GlobalEngine) PlayerStand() error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.state.Phase != PhasePlayerTurn {
		return fmt.Errorf("cannot stand in phase %s, must be PLAYER_TURN", e.state.Phase)
	}

	e.state.Phase = PhaseDealerTurn
	e.state.PhaseDetail = "Dealer's turn..."
	e.state.LastUpdated = time.Now()

	// Reveal dealer's hole card
	e.state.DealerHand[1] = CardToImagePath(e.state.DealerCards[1])

	log.Println("Player stands, dealer's turn begins")
	return nil
}

// DealerPlay executes dealer's turn according to rules
// Transitions: DEALER_TURN → RESOLUTION
func (e *GlobalEngine) DealerPlay() error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.state.Phase != PhaseDealerTurn {
		return fmt.Errorf("cannot dealer play in phase %s, must be DEALER_TURN", e.state.Phase)
	}

	if e.state.Deck == nil {
		return fmt.Errorf("deck not initialized")
	}

	// Dealer plays according to rules
	e.state.DealerCards = DealerPlay(e.state.Deck, e.state.DealerCards, true) // hitSoft17 = true

	// Update dealer hand display
	e.state.DealerHand = make([]string, len(e.state.DealerCards))
	for i, card := range e.state.DealerCards {
		e.state.DealerHand[i] = CardToImagePath(card)
	}

	e.state.CardsDealt += len(e.state.DealerCards) - 2 // Count additional cards

	e.state.Phase = PhaseResolution
	e.state.PhaseDetail = "Resolving hand outcome..."
	e.state.LastUpdated = time.Now()

	log.Printf("Dealer played: cards=%v, total=%d", e.state.DealerCards, len(e.state.DealerCards))
	return nil
}

// ResolveHand calculates outcome and payout
// Transitions: RESOLUTION → COMPLETE
func (e *GlobalEngine) ResolveHand() error {
	e.mu.Lock()
	defer e.mu.Unlock()

	if e.state.Phase != PhaseResolution {
		return fmt.Errorf("cannot resolve in phase %s, must be RESOLUTION", e.state.Phase)
	}

	// Parse bet amount
	betAmount, err := decimal.NewFromString(e.state.BetAmount)
	if err != nil {
		return fmt.Errorf("invalid bet amount: %w", err)
	}

	// Evaluate outcome
	outcome, payout := EvaluateOutcome(e.state.PlayerCards, e.state.DealerCards, betAmount, 14000) // 140% = 3:2 blackjack

	// Calculate fees
	feeLink := decimal.Zero
	feeNickelRef := betAmount.Mul(decimal.NewFromInt(5)).Div(decimal.NewFromInt(10000)) // 0.05%

	e.state.Outcome = outcome
	e.state.Payout = payout.String()
	e.state.FeeLink = feeLink.String()
	e.state.FeeNickelRef = feeNickelRef.String()

	e.state.Phase = PhaseComplete
	e.state.PhaseDetail = fmt.Sprintf("Hand complete - %s", outcome)
	e.state.LastUpdated = time.Now()

	log.Printf("Hand resolved: outcome=%s, payout=%s", outcome, payout.String())
	return nil
}

// UpdateCounting updates the card counting metrics
func (e *GlobalEngine) UpdateCounting(runningCount int) {
	e.mu.Lock()
	defer e.mu.Unlock()

	e.state.RunningCount = runningCount

	if e.state.DeckInitialized && e.state.TotalCards > 0 {
		cardsRemaining := e.state.TotalCards - e.state.CardsDealt
		decksRemaining := float64(cardsRemaining) / 52.0

		if decksRemaining > 0 {
			e.state.TrueCount = float64(runningCount) / decksRemaining
		} else {
			e.state.TrueCount = 0
		}

		e.state.ShoePct = (e.state.CardsDealt * 100) / e.state.TotalCards
	}

	e.state.LastUpdated = time.Now()
}

// ValidateTransition checks if a phase transition is valid
func ValidateTransition(from, to GamePhase) error {
	validTransitions := map[GamePhase][]GamePhase{
		PhaseWaitingForDeal: {PhaseShuffling},
		PhaseShuffling:      {PhaseDealing},
		PhaseDealing:        {PhasePlayerTurn, PhaseResolution}, // Direct to resolution for blackjack
		PhasePlayerTurn:     {PhaseDealerTurn, PhaseResolution}, // Direct to resolution for bust
		PhaseDealerTurn:     {PhaseResolution},
		PhaseResolution:     {PhaseComplete},
		PhaseComplete:       {PhaseWaitingForDeal, PhaseShuffling},
	}

	allowed, exists := validTransitions[from]
	if !exists {
		return fmt.Errorf("invalid phase: %s", from)
	}

	for _, valid := range allowed {
		if valid == to {
			return nil
		}
	}

	return fmt.Errorf("invalid transition from %s to %s", from, to)
}
