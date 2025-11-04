package game

import (
	"bytes"
	"testing"

	"github.com/shopspring/decimal"
)

func TestDeckShuffleDeterministic(t *testing.T) {
	seed := bytes.Repeat([]byte{0xAB}, 32)

	original := NewDeck(1)
	deckA := NewDeck(1)
	deckB := NewDeck(1)

	deckA.Shuffle(seed)
	deckB.Shuffle(seed)

	if len(deckA.cards) != len(original.cards) {
		t.Fatalf("shuffled deck length %d, want %d", len(deckA.cards), len(original.cards))
	}

	for i := range deckA.cards {
		if deckA.cards[i] != deckB.cards[i] {
			t.Fatalf("shuffle not deterministic at position %d: %+v vs %+v", i, deckA.cards[i], deckB.cards[i])
		}
	}

	cardCounts := make(map[Card]int, len(original.cards))
	for _, card := range original.cards {
		cardCounts[card]++
	}

	for _, card := range deckA.cards {
		cardCounts[card]--
		if cardCounts[card] < 0 {
			t.Fatalf("card %+v appears more times than expected after shuffle", card)
		}
	}

	for card, remaining := range cardCounts {
		if remaining != 0 {
			t.Fatalf("card %+v missing from shuffled deck", card)
		}
	}
}

func TestDeckDealOrder(t *testing.T) {
	expected := []Card{
		{Suit: "H", Value: "A"},
		{Suit: "S", Value: "10"},
		{Suit: "D", Value: "5"},
	}
	deck := &Deck{cards: append([]Card(nil), expected...), index: 0}

	for i, want := range expected {
		got := deck.Deal()
		if got != want {
			t.Fatalf("deal %d: got %+v, want %+v", i, got, want)
		}
	}

	if deck.index != len(expected) {
		t.Fatalf("deck index = %d, want %d after dealing all cards", deck.index, len(expected))
	}

	defer func() {
		if r := recover(); r == nil {
			t.Fatal("expected panic when dealing past end of deck")
		}
	}()
	deck.Deal()
}

func TestDealerPlay(t *testing.T) {
	tests := []struct {
		name         string
		start        []Card
		deckCards    []Card
		hitSoft17    bool
		wantTotal    int
		wantNumCards int
	}{
		{
			name:         "hard 16 hits once",
			start:        []Card{{Suit: "H", Value: "9"}, {Suit: "S", Value: "7"}},
			deckCards:    []Card{{Suit: "C", Value: "5"}},
			hitSoft17:    true,
			wantTotal:    21,
			wantNumCards: 3,
		},
		{
			name:         "soft 17 hits when allowed",
			start:        []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "6"}},
			deckCards:    []Card{{Suit: "C", Value: "2"}},
			hitSoft17:    true,
			wantTotal:    19,
			wantNumCards: 3,
		},
		{
			name:         "soft 17 stands when not allowed to hit",
			start:        []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "6"}},
			deckCards:    []Card{{Suit: "C", Value: "9"}},
			hitSoft17:    false,
			wantTotal:    17,
			wantNumCards: 2,
		},
		{
			name:         "already over threshold stands",
			start:        []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "8"}},
			deckCards:    []Card{{Suit: "C", Value: "2"}},
			hitSoft17:    true,
			wantTotal:    18,
			wantNumCards: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			deck := &Deck{cards: append([]Card(nil), tt.deckCards...), index: 0}
			start := append([]Card(nil), tt.start...)

			result := DealerPlay(deck, start, tt.hitSoft17)

			if len(result) != tt.wantNumCards {
				t.Fatalf("got %d cards, want %d", len(result), tt.wantNumCards)
			}

			total, _ := CalculateHandValue(result)
			if total != tt.wantTotal {
				t.Fatalf("hand total = %d, want %d", total, tt.wantTotal)
			}
		})
	}
}

func TestEvaluateOutcome(t *testing.T) {
	bet := decimal.NewFromInt(100)

	tests := []struct {
		name            string
		player          []Card
		dealer          []Card
		wantOutcome     string
		wantPayout      decimal.Decimal
		blackjackPayout int
	}{
		{
			name:            "player blackjack",
			player:          []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "K"}},
			dealer:          []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "7"}},
			wantOutcome:     "win",
			wantPayout:      decimal.NewFromInt(140),
			blackjackPayout: 14000,
		},
		{
			name:            "both blackjack push",
			player:          []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "K"}},
			dealer:          []Card{{Suit: "C", Value: "A"}, {Suit: "S", Value: "Q"}},
			wantOutcome:     "push",
			wantPayout:      decimal.Zero,
			blackjackPayout: 14000,
		},
		{
			name:            "dealer blackjack",
			player:          []Card{{Suit: "H", Value: "9"}, {Suit: "D", Value: "7"}},
			dealer:          []Card{{Suit: "C", Value: "A"}, {Suit: "S", Value: "K"}},
			wantOutcome:     "lose",
			wantPayout:      decimal.Zero,
			blackjackPayout: 14000,
		},
		{
			name:            "player busts",
			player:          []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "9"}, {Suit: "S", Value: "5"}},
			dealer:          []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "7"}},
			wantOutcome:     "lose",
			wantPayout:      decimal.Zero,
			blackjackPayout: 14000,
		},
		{
			name:            "dealer busts",
			player:          []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "7"}},
			dealer:          []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "7"}, {Suit: "H", Value: "8"}},
			wantOutcome:     "win",
			wantPayout:      bet,
			blackjackPayout: 14000,
		},
		{
			name:            "player higher total wins",
			player:          []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "8"}},
			dealer:          []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "7"}},
			wantOutcome:     "win",
			wantPayout:      bet,
			blackjackPayout: 14000,
		},
		{
			name:            "dealer higher total wins",
			player:          []Card{{Suit: "H", Value: "9"}, {Suit: "D", Value: "7"}},
			dealer:          []Card{{Suit: "C", Value: "10"}, {Suit: "S", Value: "8"}},
			wantOutcome:     "lose",
			wantPayout:      decimal.Zero,
			blackjackPayout: 14000,
		},
		{
			name:            "equal totals push",
			player:          []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "8"}},
			dealer:          []Card{{Suit: "C", Value: "Q"}, {Suit: "S", Value: "8"}},
			wantOutcome:     "push",
			wantPayout:      decimal.Zero,
			blackjackPayout: 14000,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			outcome, payout := EvaluateOutcome(tt.player, tt.dealer, bet, tt.blackjackPayout)

			if outcome != tt.wantOutcome {
				t.Fatalf("outcome = %s, want %s", outcome, tt.wantOutcome)
			}

			if !payout.Equal(tt.wantPayout) {
				t.Fatalf("payout = %s, want %s", payout.String(), tt.wantPayout.String())
			}
		})
	}
}

// TestShuffleRandomness verifies the Fisher-Yates shuffle produces randomization
// Ensures cards are well distributed across positions after multiple shuffles
func TestShuffleRandomness(t *testing.T) {
	numIterations := 1000
	deckSize := 52

	// Track which cards appear at each position across many shuffles
	positionDistribution := make([]map[Card]int, deckSize)
	for i := range positionDistribution {
		positionDistribution[i] = make(map[Card]int)
	}

	// Shuffle many times with different seeds
	for i := 0; i < numIterations; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256)}, 32)
		deck := NewDeck(1)
		deck.Shuffle(seed)

		for pos, card := range deck.cards {
			positionDistribution[pos][card]++
		}
	}

	// Verify distribution: most cards should appear at most positions
	// With deterministic RNG, we just verify basic sanity - no position dominated by one card
	for pos := 0; pos < deckSize; pos++ {
		cardCount := len(positionDistribution[pos])
		// Should see at least 30+ unique cards at each position
		if cardCount < 30 {
			t.Errorf("position %d: only %d unique cards seen, want at least 30", pos, cardCount)
		}

		// Check no single card dominates a position
		maxFreq := 0
		for _, freq := range positionDistribution[pos] {
			if freq > maxFreq {
				maxFreq = freq
			}
		}

		// No card should appear at same position more than 30% of the time
		if maxFreq > numIterations/3 {
			t.Errorf("position %d: max frequency %d is too high (%.1f%% of shuffles)",
				pos, maxFreq, float64(maxFreq)*100/float64(numIterations))
		}
	}
}

// TestShuffleUniqueAcrossSeeds verifies different seeds produce different shuffles
func TestShuffleUniqueAcrossSeeds(t *testing.T) {
	seed1 := bytes.Repeat([]byte{0xAA}, 32)
	seed2 := bytes.Repeat([]byte{0xBB}, 32)
	seed3 := bytes.Repeat([]byte{0xCC}, 32)

	deck1 := NewDeck(1)
	deck1.Shuffle(seed1)

	deck2 := NewDeck(1)
	deck2.Shuffle(seed2)

	deck3 := NewDeck(1)
	deck3.Shuffle(seed3)

	// Decks with different seeds should be different
	if compareDecks(deck1, deck2) {
		t.Error("deck1 and deck2 should be different with different seeds")
	}

	if compareDecks(deck2, deck3) {
		t.Error("deck2 and deck3 should be different with different seeds")
	}

	if compareDecks(deck1, deck3) {
		t.Error("deck1 and deck3 should be different with different seeds")
	}
}

// TestMultiDeckShuffle verifies shuffling works correctly with multiple decks (7-deck shoe)
func TestMultiDeckShuffle(t *testing.T) {
	seed := bytes.Repeat([]byte{0x42}, 32)
	deck := NewDeck(7) // 7-deck shoe

	expectedSize := 7 * 52
	if len(deck.cards) != expectedSize {
		t.Fatalf("new deck size = %d, want %d", len(deck.cards), expectedSize)
	}

	deck.Shuffle(seed)

	if len(deck.cards) != expectedSize {
		t.Fatalf("shuffled deck size = %d, want %d", len(deck.cards), expectedSize)
	}

	// Verify all cards are still present
	cardCounts := make(map[Card]int)
	for _, card := range NewDeck(7).cards {
		cardCounts[card]++
	}

	for _, card := range deck.cards {
		cardCounts[card]--
		if cardCounts[card] < 0 {
			t.Fatalf("card %+v appears too many times after shuffle", card)
		}
	}

	for card, count := range cardCounts {
		if count != 0 {
			t.Fatalf("card %+v count = %d after shuffle", card, count)
		}
	}
}

// TestShuffleChangesOrder verifies shuffle actually changes the card order
func TestShuffleChangesOrder(t *testing.T) {
	seed := bytes.Repeat([]byte{0x99}, 32)
	original := NewDeck(7)
	shuffled := NewDeck(7)
	shuffled.Shuffle(seed)

	differentPositions := 0
	for i := range original.cards {
		if original.cards[i] != shuffled.cards[i] {
			differentPositions++
		}
	}

	// With 7 decks (364 cards), expect vast majority to be in different positions
	// If less than 90% changed, shuffle isn't working properly
	threshold := len(original.cards) / 10 * 9
	if differentPositions < threshold {
		t.Errorf("only %d cards changed position, want at least %d out of %d",
			differentPositions, threshold, len(original.cards))
	}
}

// TestDealingSequenceAfterShuffle verifies dealing sequence is correct after shuffle
func TestDealingSequenceAfterShuffle(t *testing.T) {
	seed := bytes.Repeat([]byte{0x77}, 32)
	deck := NewDeck(1)
	original := make([]Card, len(deck.cards))
	copy(original, deck.cards)

	deck.Shuffle(seed)

	// Deal all cards and verify order matches shuffled deck
	for i := 0; i < len(deck.cards); i++ {
		dealt := deck.Deal()
		if dealt != deck.cards[i] {
			// This shouldn't happen - cards should be dealt in order
			t.Fatalf("deal %d: got %+v, expected %+v", i, dealt, deck.cards[i])
		}
	}

	if deck.index != len(deck.cards) {
		t.Fatalf("index = %d, want %d", deck.index, len(deck.cards))
	}
}

// TestStatisticalDistribution verifies rank positions are spread throughout deck
func TestStatisticalDistribution(t *testing.T) {
	numShuffles := 500
	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

	// For each rank, track how many appear in different thirds of the deck
	rankDistribution := make(map[string][3]int) // [first third, middle third, last third]
	for _, v := range values {
		rankDistribution[v] = [3]int{}
	}

	for shuffleNum := 0; shuffleNum < numShuffles; shuffleNum++ {
		seed := bytes.Repeat([]byte{byte(shuffleNum % 256)}, 32)
		deck := NewDeck(1)
		deck.Shuffle(seed)

		thirdSize := len(deck.cards) / 3

		for pos, card := range deck.cards {
			third := pos / thirdSize
			if third > 2 {
				third = 2 // Last card goes to third section
			}
			dist := rankDistribution[card.Value]
			dist[third]++
			rankDistribution[card.Value] = dist
		}
	}

	// Verify each rank is reasonably distributed across the three thirds
	// Expected: ~33% in each third per rank, per shuffle
	// With 500 shuffles and 4 suits, ~667 cards per rank total
	expectedPerThird := (numShuffles * 4) / 3
	tolerance := expectedPerThird / 2 // Allow ±50% variance

	for _, value := range values {
		dist := rankDistribution[value]
		for i, count := range dist {
			if count < expectedPerThird-tolerance || count > expectedPerThird+tolerance {
				t.Errorf("rank %s third %d: got %d, want ~%d (range: %d-%d)",
					value, i, count, expectedPerThird,
					expectedPerThird-tolerance, expectedPerThird+tolerance)
			}
		}
	}
}

// Helper: compare two decks for equality
func compareDecks(d1, d2 *Deck) bool {
	if len(d1.cards) != len(d2.cards) {
		return false
	}
	for i := range d1.cards {
		if d1.cards[i] != d2.cards[i] {
			return false
		}
	}
	return true
}
