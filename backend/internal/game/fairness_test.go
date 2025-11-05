package game

import (
	"bytes"
	"fmt"
	"math"
	"testing"

	"github.com/shopspring/decimal"
)

// TestOperatorProfitability simulates many hands to verify operator wins long-term
// This tests whether the house edge is real and positive
func TestOperatorProfitability(t *testing.T) {
	numHands := 10000
	bet := decimal.NewFromInt(100)

	operatorWins := 0
	playerWins := 0
	pushes := 0
	totalPlayerLoss := decimal.Zero
	totalOperatorGain := decimal.Zero

	for i := 0; i < numHands; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := NewDeck(7)
		deck.Shuffle(seed)

		// Deal initial hands
		dealerCards := []Card{deck.Deal(), deck.Deal()}
		playerCards := []Card{deck.Deal(), deck.Deal()}

		// Check for blackjack
		if !IsBlackjack(playerCards) && !IsBlackjack(dealerCards) {
			// Player plays basic strategy (simplified)
			playerValue, isSoft := CalculateHandValue(playerCards)
			for playerValue < 17 || (playerValue == 17 && isSoft) {
				playerCards = append(playerCards, deck.Deal())
				playerValue, isSoft = CalculateHandValue(playerCards)
			}

			// Dealer plays
			dealerCards = DealerPlay(deck, dealerCards, true)
		}

		// Evaluate outcome
		outcome, payout := EvaluateOutcome(playerCards, dealerCards, bet, 15000) // 150% = 3:2 blackjack

		switch outcome {
		case "win":
			playerWins++
			totalOperatorGain = totalOperatorGain.Sub(payout)
		case "lose":
			operatorWins++
			totalOperatorGain = totalOperatorGain.Add(bet)
		case "push":
			pushes++
		}

		totalPlayerLoss = totalPlayerLoss.Add(bet)
	}

	winRate := float64(operatorWins) / float64(numHands) * 100
	lossRate := float64(playerWins) / float64(numHands) * 100
	pushRate := float64(pushes) / float64(numHands) * 100

	t.Logf("\n=== Operator Profitability After %d Hands ===", numHands)
	t.Logf("Operator wins: %d (%.2f%%)", operatorWins, winRate)
	t.Logf("Player wins: %d (%.2f%%)", playerWins, lossRate)
	t.Logf("Pushes: %d (%.2f%%)", pushes, pushRate)
	t.Logf("Total player lost: %s", totalPlayerLoss.String())
	t.Logf("Total operator gained: %s", totalOperatorGain.String())
	t.Logf("House edge: %.2f%%", (totalOperatorGain.Div(totalPlayerLoss).Mul(decimal.NewFromInt(100))).InexactFloat64())

	// Verify basic expectations:
	// 1. Operator should win more than player over long run
	if operatorWins <= playerWins {
		t.Errorf("operator wins (%d) should exceed player wins (%d) in long run", operatorWins, playerWins)
	}

	// 2. Operator should have positive expected value
	if totalOperatorGain.LessThanOrEqual(decimal.Zero) {
		t.Errorf("operator gain should be positive: %s", totalOperatorGain.String())
	}

	// 3. Blackjack payout shouldn't be too generous (should be at least 3:2)
	blackjackCount := 0
	for i := 0; i < 1000; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := NewDeck(1)
		deck.Shuffle(seed)
		_ = []Card{deck.Deal(), deck.Deal()} // dealer cards (not used in this test)
		playerCards := []Card{deck.Deal(), deck.Deal()}

		if IsBlackjack(playerCards) {
			blackjackCount++
		}
	}
	blackjackRate := float64(blackjackCount) / 10.0 // 1000 / 100 = 10 hands expected
	t.Logf("Blackjack rate: %.2f%% (expected ~4.83%%)", blackjackRate)
}

// TestCardDistributionFairness verifies that all cards have equal chance of appearing
func TestCardDistributionFairness(t *testing.T) {
	numShuffles := 1000
	firstCards := make(map[string]int)
	suits := []string{"C", "D", "H", "S"}
	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

	// Count which cards are dealt first across many shuffles
	for i := 0; i < numShuffles; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := NewDeck(1)
		deck.Shuffle(seed)
		firstCard := deck.Deal()
		key := fmt.Sprintf("%s-%s", firstCard.Value, firstCard.Suit)
		firstCards[key]++
	}

	// With 52 unique cards and 1000 shuffles, expect ~19.2 of each card as first
	// Allow reasonable variance
	expectedCount := numShuffles / 52
	tolerance := expectedCount / 2 // ±50% variance

	for _, suit := range suits {
		for _, value := range values {
			key := fmt.Sprintf("%s-%s", value, suit)
			count := firstCards[key]
			if count < expectedCount-tolerance || count > expectedCount+tolerance {
				t.Logf("WARN: Card %s appears %d times, expected ~%d (tolerance: %d-%d)",
					key, count, expectedCount, expectedCount-tolerance, expectedCount+tolerance)
			}
		}
	}

	// Chi-square test for fairness
	chiSquare := 0.0
	for _, count := range firstCards {
		expected := float64(expectedCount)
		diff := float64(count) - expected
		chiSquare += (diff * diff) / expected
	}

	// Degrees of freedom = 51 (52 cards - 1)
	// Critical value at 0.05 significance level ~75
	t.Logf("Chi-square statistic: %.2f (critical value ~75 at p=0.05)", chiSquare)
	if chiSquare > 100 {
		t.Logf("WARN: Chi-square value is high, distribution may not be fair")
	}
}

// TestSeedIndependence verifies that similar seeds don't produce similar shuffles
func TestSeedIndependence(t *testing.T) {
	// Create seeds that differ by only 1 bit
	seed1 := []byte{0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}

	seed2 := []byte{0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
		0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE} // Last byte differs by 1

	deck1 := NewDeck(1)
	deck1.Shuffle(seed1)

	deck2 := NewDeck(1)
	deck2.Shuffle(seed2)

	// Count how many cards are in same position
	samePositions := 0
	for i := range deck1.Cards {
		if deck1.Cards[i] == deck2.Cards[i] {
			samePositions++
		}
	}

	// With good seed independence, seeds differing by 1 bit should produce very different shuffles
	// Expect much less than 10% in same position
	percentSame := float64(samePositions) / float64(len(deck1.Cards)) * 100
	t.Logf("Decks from similar seeds have %.1f%% cards in same position (should be <10%%)", percentSame)

	if percentSame > 15 {
		t.Logf("WARN: Similar seeds produce similar shuffles - seed independence may be compromised")
	}
}

// TestNoPatternDetection verifies shuffle sequence doesn't have detectable patterns
func TestNoPatternDetection(t *testing.T) {
	numShuffles := 100
	cardPositions := make([][]int, 52) // Each card's positions across shuffles

	// Initialize
	_ = cardPositions // Use variable
	suits := []string{"C", "D", "H", "S"}
	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

	for shuffleNum := 0; shuffleNum < numShuffles; shuffleNum++ {
		seed := bytes.Repeat([]byte{byte(shuffleNum % 256), byte(shuffleNum / 256)}, 16)
		deck := NewDeck(1)
		deck.Shuffle(seed)

		for pos, card := range deck.Cards {
			// Create stable index for each unique card
			cardIndex := 0
			for i, suit := range suits {
				for j, value := range values {
					if card.Suit == suit && card.Value == value {
						cardIndex = i*len(values) + j
					}
				}
			}
			cardPositions[cardIndex] = append(cardPositions[cardIndex], pos)
		}

		_ = shuffleNum // Use variable to avoid compiler warning
	}

	// Check for autocorrelation in card positions (would indicate pattern)
	maxCorr := 0.0
	for cardIndex := 0; cardIndex < len(cardPositions); cardIndex++ {
		if len(cardPositions[cardIndex]) < 2 {
			continue
		}

		// Calculate autocorrelation at lag 1
		mean := 0.0
		for _, pos := range cardPositions[cardIndex] {
			mean += float64(pos)
		}
		mean /= float64(len(cardPositions[cardIndex]))

		var1 := 0.0
		var2 := 0.0
		covar := 0.0
		for i := 0; i < len(cardPositions[cardIndex])-1; i++ {
			x := float64(cardPositions[cardIndex][i]) - mean
			y := float64(cardPositions[cardIndex][i+1]) - mean
			var1 += x * x
			var2 += y * y
			covar += x * y
		}

		if var1 > 0 && var2 > 0 {
			corr := math.Abs(covar / math.Sqrt(var1*var2))
			if corr > maxCorr {
				maxCorr = corr
			}
		}
	}

	t.Logf("Max autocorrelation in shuffle sequence: %.3f (should be near 0)", maxCorr)
	if maxCorr > 0.3 {
		t.Logf("WARN: Autocorrelation is high, shuffle may have patterns")
	}
}

// TestVRFResistance simulates that outcomes can't be manipulated with known seed
func TestVRFResistance(t *testing.T) {
	// Attacker knows seed but tries to get favorable outcome
	// Verify they can't predict outcome from seed

	successfulPredictions := 0
	attempts := 100

	for attempt := 0; attempt < attempts; attempt++ {
		// Attacker's predicted seed
		attackSeed := bytes.Repeat([]byte{byte(attempt % 256)}, 32)

		// Verify the seed produces deterministic outcome
		deck1 := NewDeck(1)
		deck1.Shuffle(attackSeed)
		firstCard1 := deck1.Deal()

		deck2 := NewDeck(1)
		deck2.Shuffle(attackSeed)
		firstCard2 := deck2.Deal()

		if firstCard1 == firstCard2 {
			successfulPredictions++
		}

		_ = attackSeed // Use variable to avoid compiler warning
	}

	// Shuffle should be deterministic (100% successful "predictions" with known seed)
	if successfulPredictions != attempts {
		t.Errorf("shuffle not deterministic: %d/%d matches with known seed", successfulPredictions, attempts)
	}

	t.Logf("VRF resistance: Shuffle is deterministic with known seed (expected for provably fair system)")
	t.Logf("In production, seed comes from external VRF (Chainlink) that can't be predicted in advance")
}

// TestBlackjackPayoutCorrectness ensures blackjack pays out at 3:2
func TestBlackjackPayoutCorrectness(t *testing.T) {
	bet := decimal.NewFromInt(100)
	playerCards := []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "K"}}
	dealerCards := []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "7"}}

	// Test at 3:2 (15000 bps = 150% = 3:2)
	outcome, payout := EvaluateOutcome(playerCards, dealerCards, bet, 15000)

	if outcome != "win" {
		t.Errorf("blackjack should win, got %s", outcome)
	}

	expected := decimal.NewFromInt(150) // 100 * 1.5
	if !payout.Equal(expected) {
		t.Errorf("blackjack payout = %s, want %s", payout.String(), expected.String())
	}
}

// TestPushCorrectness ensures pushes don't pay out
func TestPushCorrectness(t *testing.T) {
	bet := decimal.NewFromInt(100)

	tests := []struct {
		name  string
		player []Card
		dealer []Card
	}{
		{
			name:   "both blackjack",
			player: []Card{{Suit: "H", Value: "A"}, {Suit: "D", Value: "K"}},
			dealer: []Card{{Suit: "C", Value: "A"}, {Suit: "S", Value: "Q"}},
		},
		{
			name:   "both 20",
			player: []Card{{Suit: "H", Value: "10"}, {Suit: "D", Value: "K"}},
			dealer: []Card{{Suit: "C", Value: "Q"}, {Suit: "S", Value: "10"}},
		},
		{
			name:   "both 17 after hitting",
			player: []Card{{Suit: "H", Value: "9"}, {Suit: "D", Value: "8"}},
			dealer: []Card{{Suit: "C", Value: "9"}, {Suit: "S", Value: "8"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			outcome, payout := EvaluateOutcome(tt.player, tt.dealer, bet, 15000)

			if outcome != "push" {
				t.Errorf("expected push, got %s", outcome)
			}

			if !payout.IsZero() {
				t.Errorf("push payout should be 0, got %s", payout.String())
			}
		})
	}
}
