package game

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"

	"github.com/shopspring/decimal"
)

// Card represents a playing card
type Card struct {
	Suit  string // C, D, H, S
	Value string // A, 2-10, J, Q, K
}

// HandResult represents the outcome of a resolved hand
type HandResult struct {
	HandID       int64
	PlayerAddr   string
	DealerCards  []string // Card image paths
	PlayerCards  [][]string // Multiple hands for splits
	Outcome      string   // win, lose, push
	Payout       decimal.Decimal
	FeeLink      decimal.Decimal
	FeeNickelRef decimal.Decimal
}

// Deck represents a shuffled deck of cards
type Deck struct {
	cards []Card
	index int
}

// NewDeck creates a new deck with the specified number of decks
func NewDeck(numDecks int) *Deck {
	suits := []string{"C", "D", "H", "S"}
	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

	cards := make([]Card, 0, numDecks*52)
	for i := 0; i < numDecks; i++ {
		for _, suit := range suits {
			for _, value := range values {
				cards = append(cards, Card{Suit: suit, Value: value})
			}
		}
	}

	return &Deck{cards: cards, index: 0}
}

// Shuffle deterministically shuffles the deck using a seed
// Uses Fisher-Yates shuffle with seed-derived randomness
func (d *Deck) Shuffle(seed []byte) {
	// Create a deterministic RNG from seed
	rng := newSeedRNG(seed)

	// Fisher-Yates shuffle
	for i := len(d.cards) - 1; i > 0; i-- {
		j := rng.NextInt(i + 1)
		d.cards[i], d.cards[j] = d.cards[j], d.cards[i]
	}

	d.index = 0
}

// Deal deals the next card from the deck
func (d *Deck) Deal() Card {
	if d.index >= len(d.cards) {
		// Deck exhausted - in production, trigger reshuffle
		panic("deck exhausted")
	}
	card := d.cards[d.index]
	d.index++
	return card
}

// seedRNG provides deterministic randomness from a seed
type seedRNG struct {
	state []byte
	pos   int
}

func newSeedRNG(seed []byte) *seedRNG {
	// Use SHA256 to extend seed if needed
	hash := sha256.Sum256(seed)
	return &seedRNG{state: hash[:], pos: 0}
}

func (r *seedRNG) NextInt(max int) int {
	if r.pos+4 > len(r.state) {
		// Extend state by hashing
		hash := sha256.Sum256(r.state)
		r.state = hash[:]
		r.pos = 0
	}

	val := binary.BigEndian.Uint32(r.state[r.pos : r.pos+4])
	r.pos += 4
	return int(val) % max
}

// CardToImagePath converts a card to its image path
func CardToImagePath(card Card) string {
	return fmt.Sprintf("/cards/%s-%s.png", card.Value, card.Suit)
}

// CalculateHandValue calculates the total value of a hand
// Returns (value, isSoft) where isSoft indicates if hand has usable Ace
func CalculateHandValue(cards []Card) (int, bool) {
	total := 0
	aces := 0

	for _, card := range cards {
		switch card.Value {
		case "A":
			aces++
			total += 11
		case "J", "Q", "K":
			total += 10
		default:
			val := 0
			fmt.Sscanf(card.Value, "%d", &val)
			total += val
		}
	}

	// Adjust for aces
	isSoft := aces > 0 && total <= 21
	for total > 21 && aces > 0 {
		total -= 10
		aces--
	}

	return total, isSoft
}

// IsBlackjack checks if a hand is a natural blackjack (Ace + 10-value card)
func IsBlackjack(cards []Card) bool {
	if len(cards) != 2 {
		return false
	}
	hasAce := false
	hasTen := false

	for _, card := range cards {
		if card.Value == "A" {
			hasAce = true
		}
		if card.Value == "10" || card.Value == "J" || card.Value == "Q" || card.Value == "K" {
			hasTen = true
		}
	}

	return hasAce && hasTen
}

// IsBust checks if a hand value exceeds 21
func IsBust(cards []Card) bool {
	value, _ := CalculateHandValue(cards)
	return value > 21
}

// DealerPlay simulates dealer play according to rules
// Dealer hits on soft 17, stands on hard 17+
func DealerPlay(deck *Deck, dealerCards []Card, hitSoft17 bool) []Card {
	for {
		value, isSoft := CalculateHandValue(dealerCards)
		
		// Dealer must hit on 16 or less
		if value < 17 {
			dealerCards = append(dealerCards, deck.Deal())
			continue
		}

		// Dealer hits on soft 17 if rule allows
		if value == 17 && isSoft && hitSoft17 {
			dealerCards = append(dealerCards, deck.Deal())
			continue
		}

		// Dealer stands on 17+ (or hard 17)
		break
	}

	return dealerCards
}

// EvaluateOutcome evaluates the outcome of a blackjack hand
// Returns outcome (win/lose/push) and payout amount
func EvaluateOutcome(playerCards []Card, dealerCards []Card, betAmount decimal.Decimal, blackjackPayoutBps int) (string, decimal.Decimal) {
	playerValue, _ := CalculateHandValue(playerCards)
	dealerValue, _ := CalculateHandValue(dealerCards)

	playerBJ := IsBlackjack(playerCards)
	dealerBJ := IsBlackjack(dealerCards)

	// Both blackjack = push
	if playerBJ && dealerBJ {
		return "push", decimal.Zero
	}

	// Player blackjack = win (pays 3:2 or configured)
	if playerBJ {
		payout := betAmount.Mul(decimal.NewFromInt(int64(blackjackPayoutBps)).Div(decimal.NewFromInt(10000)))
		return "win", payout
	}

	// Dealer blackjack = lose
	if dealerBJ {
		return "lose", decimal.Zero
	}

	// Player bust = lose
	if IsBust(playerCards) {
		return "lose", decimal.Zero
	}

	// Dealer bust = win
	if IsBust(dealerCards) {
		return "win", betAmount
	}

	// Compare values
	if playerValue > dealerValue {
		return "win", betAmount
	} else if playerValue < dealerValue {
		return "lose", decimal.Zero
	} else {
		return "push", decimal.Zero
	}
}

// ResolveHand resolves a hand using the VRF seed
// This is the main entry point for resolving a hand
func ResolveHand(handID int64, playerAddr, tokenAddr, amountStr string, seed []byte) (*HandResult, error) {
	// Parse bet amount
	betAmount, err := decimal.NewFromString(amountStr)
	if err != nil {
		return nil, fmt.Errorf("invalid bet amount: %w", err)
	}

	// Create and shuffle deck (7 decks standard)
	deck := NewDeck(7)
	deck.Shuffle(seed)

	// Deal initial hands
	dealerCards := []Card{deck.Deal(), deck.Deal()}
	playerCards := []Card{deck.Deal(), deck.Deal()}

	// Check for blackjack
	if IsBlackjack(playerCards) || IsBlackjack(dealerCards) {
		// No further play needed
	} else {
		// Player actions would be handled by frontend/API
		// For now, dealer plays automatically
		dealerCards = DealerPlay(deck, dealerCards, true) // hitSoft17 = true
	}

	// Convert cards to image paths
	dealerCardPaths := make([]string, len(dealerCards))
	for i, card := range dealerCards {
		if i == 1 && len(dealerCards) == 2 && !IsBlackjack(dealerCards) {
			// Second dealer card is face-down initially
			dealerCardPaths[i] = "/cards/back.png"
		} else {
			dealerCardPaths[i] = CardToImagePath(card)
		}
	}

	playerCardPaths := [][]string{
		make([]string, len(playerCards)),
	}
	for i, card := range playerCards {
		playerCardPaths[0][i] = CardToImagePath(card)
	}

	// Evaluate outcome
	outcome, payout := EvaluateOutcome(playerCards, dealerCards, betAmount, 14000) // 140% = 3:2 blackjack

	// Calculate fees (simplified)
	feeLink := decimal.Zero // Chainlink VRF fee already paid
	feeNickelRef := betAmount.Mul(decimal.NewFromInt(5)).Div(decimal.NewFromInt(10000)) // 0.05%

	return &HandResult{
		HandID:       handID,
		PlayerAddr:   playerAddr,
		DealerCards:  dealerCardPaths,
		PlayerCards:  playerCardPaths,
		Outcome:      outcome,
		Payout:       payout,
		FeeLink:      feeLink,
		FeeNickelRef: feeNickelRef,
	}, nil
}

