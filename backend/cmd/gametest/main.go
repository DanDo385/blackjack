package main

import (
	"bytes"
	"flag"
	"fmt"
	"strings"
	"time"

	"github.com/DanDo385/blackjack/backend/internal/game"
	"github.com/shopspring/decimal"
)

func main() {
	// Parse command line flags
	numHands := flag.Int("hands", 10000, "Number of hands to simulate")
	testShuffle := flag.Bool("shuffle", false, "Test shuffle randomness")
	testFairness := flag.Bool("fairness", false, "Test game fairness")
	testOperator := flag.Bool("operator", false, "Test operator profitability (default)")
	betAmount := flag.Float64("bet", 100.0, "Bet amount per hand")
	verbose := flag.Bool("v", false, "Verbose output")

	flag.Parse()

	// Default to operator test if no test specified
	if !*testShuffle && !*testFairness && !*testOperator {
		*testOperator = true
	}

	if *testShuffle {
		testShuffleRandomness(*numHands, *verbose)
	}

	if *testFairness {
		testGameFairness(*numHands, *verbose)
	}

	if *testOperator {
		testOperatorProfitability(*numHands, *betAmount, *verbose)
	}
}

// testOperatorProfitability simulates many hands and shows operator profit/loss
func testOperatorProfitability(numHands int, betAmount float64, verbose bool) {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("OPERATOR PROFITABILITY TEST")
	fmt.Println(strings.Repeat("=", 70))
	fmt.Printf("Simulating %d hands with $%.2f bet per hand\n\n", numHands, betAmount)

	bet := decimal.NewFromFloat(betAmount)

	operatorWins := 0
	playerWins := 0
	pushes := 0
	totalPot := decimal.Zero
	operatorProfit := decimal.Zero

	blackjackCount := 0
	bustCount := 0

	start := time.Now()

	for i := 0; i < numHands; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := game.NewDeck(7)
		deck.Shuffle(seed)

		// Deal initial hands
		dealerCards := []game.Card{deck.Deal(), deck.Deal()}
		playerCards := []game.Card{deck.Deal(), deck.Deal()}

		totalPot = totalPot.Add(bet)

		if game.IsBlackjack(playerCards) && !game.IsBlackjack(dealerCards) {
			blackjackCount++
		}

		// Check for immediate blackjacks
		if !game.IsBlackjack(playerCards) && !game.IsBlackjack(dealerCards) {
			// Player plays basic strategy
			for {
				value, isSoft := game.CalculateHandValue(playerCards)
				if game.IsBust(playerCards) {
					bustCount++
					break
				}

				// Basic strategy simplified: hit on soft 17, hit on hard 16
				if (value < 17) || (value == 17 && isSoft) {
					playerCards = append(playerCards, deck.Deal())
				} else {
					break
				}
			}

			// If player didn't bust, dealer plays
			if !game.IsBust(playerCards) {
				dealerCards = game.DealerPlay(deck, dealerCards, true)
			}
		}

		// Evaluate outcome
		outcome, payout := game.EvaluateOutcome(playerCards, dealerCards, bet, 15000)

		switch outcome {
		case "win":
			playerWins++
			operatorProfit = operatorProfit.Sub(payout)
		case "lose":
			operatorWins++
			operatorProfit = operatorProfit.Add(bet)
		case "push":
			pushes++
		}

		// Print progress every 1000 hands
		if verbose && (i+1)%1000 == 0 {
			fmt.Printf("Processed %d hands...\n", i+1)
		}
	}

	elapsed := time.Since(start)

	// Calculate statistics
	winRate := float64(operatorWins) / float64(numHands) * 100
	lossRate := float64(playerWins) / float64(numHands) * 100
	pushRate := float64(pushes) / float64(numHands) * 100
	blackjackRate := float64(blackjackCount) / float64(numHands) * 100
	houseEdgeDecimal := operatorProfit.Div(totalPot).Mul(decimal.NewFromInt(100))
	houseEdge := houseEdgeDecimal.InexactFloat64()

	fmt.Println("\nRESULTS:")
	fmt.Println(strings.Repeat("-", 70))
	fmt.Printf("Operator Wins:     %6d (%.2f%%)\n", operatorWins, winRate)
	fmt.Printf("Player Wins:       %6d (%.2f%%)\n", playerWins, lossRate)
	fmt.Printf("Pushes:            %6d (%.2f%%)\n", pushes, pushRate)
	fmt.Printf("Player Blackjacks: %6d (%.2f%%)\n", blackjackCount, blackjackRate)
	fmt.Printf("Player Busts:      %6d (%.2f%%)\n\n", bustCount, float64(bustCount)/float64(numHands)*100)

	fmt.Printf("Total Pot:         %s\n", totalPot.StringFixed(2))
	fmt.Printf("Operator Profit:   %s\n", operatorProfit.StringFixed(2))
	fmt.Printf("House Edge:        %.4f%%\n\n", houseEdge)

	fmt.Printf("Hands/sec:         %.0f\n", float64(numHands)/elapsed.Seconds())
	fmt.Printf("Total Time:        %v\n", elapsed)

	// Validate results
	fmt.Println("\nVALIDATION:")
	fmt.Println(strings.Repeat("-", 70))

	if operatorWins > playerWins {
		fmt.Printf("✓ Operator wins more hands than player (%d > %d)\n", operatorWins, playerWins)
	} else {
		fmt.Printf("✗ FAIL: Player wins more hands than operator (%d > %d)\n", playerWins, operatorWins)
	}

	if houseEdge > 0 {
		fmt.Printf("✓ Operator has positive expected value (%.4f%%)\n", houseEdge)
	} else {
		fmt.Printf("✗ FAIL: Operator has negative expected value (%.4f%%)\n", houseEdge)
	}

	if blackjackRate > 4.5 && blackjackRate < 5.0 {
		fmt.Printf("✓ Blackjack rate is correct (~4.83%%): %.2f%%\n", blackjackRate)
	} else {
		fmt.Printf("⚠ Blackjack rate unusual: %.2f%% (expected ~4.83%%)\n", blackjackRate)
	}

	expectedBustRate := 28.0 // Approximate player bust rate with basic strategy
	actualBustRate := float64(bustCount) / float64(numHands) * 100
	if actualBustRate > expectedBustRate-5 && actualBustRate < expectedBustRate+5 {
		fmt.Printf("✓ Bust rate reasonable: %.2f%% (expected ~28%%)\n", actualBustRate)
	} else {
		fmt.Printf("⚠ Bust rate unusual: %.2f%% (expected ~28%%)\n", actualBustRate)
	}

	fmt.Println("\n" + strings.Repeat("=", 70))
}

// testShuffleRandomness checks that shuffle produces random-looking results
func testShuffleRandomness(numShuffles int, verbose bool) {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("SHUFFLE RANDOMNESS TEST")
	fmt.Println(strings.Repeat("=", 70))
	fmt.Printf("Shuffling deck %d times and analyzing card distribution\n\n", numShuffles)

	// Track where each card appears across shuffles
	cardPositions := make(map[string][]int)

	start := time.Now()

	for i := 0; i < numShuffles; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := game.NewDeck(1)
		deck.Shuffle(seed)

		// Track first 10 card positions
		for pos := 0; pos < 10 && pos < len(deck.Cards); pos++ {
			card := deck.Cards[pos]
			key := fmt.Sprintf("%s-%s", card.Value, card.Suit)
			cardPositions[key] = append(cardPositions[key], pos)
		}

		if verbose && (i+1)%1000 == 0 {
			fmt.Printf("Shuffled %d times...\n", i+1)
		}
	}

	elapsed := time.Since(start)

	fmt.Println("\nFIRST-CARD DISTRIBUTION (52 shuffles expected per card across 10 positions):")
	fmt.Println(strings.Repeat("-", 70))

	varianceSum := 0.0
	cardCount := 0

	for key, positions := range cardPositions {
		if len(positions) > 5 { // Only show cards that appeared at least 5 times
			cardCount++
			// Expected: numShuffles / 52 per card, distributed across 10 positions = numShuffles / 52 / 10 per position
			expectedPerPosition := float64(numShuffles) / 52.0 / 10.0
			observed := float64(len(positions))
			variance := (observed - expectedPerPosition) / expectedPerPosition
			if variance < 0 {
				variance = -variance
			}
			varianceSum += variance

			if verbose {
				fmt.Printf("%-10s: %3d occurrences (expected ~%.1f)\n", key, len(positions), expectedPerPosition)
			}
		}
	}

	avgVariance := varianceSum / float64(cardCount)

	fmt.Println("\nSTATISTICS:")
	fmt.Println(strings.Repeat("-", 70))
	fmt.Printf("Avg variance from expected: %.2f%%\n", avgVariance*100)
	fmt.Printf("Shuffles/sec: %.0f\n", float64(numShuffles)/elapsed.Seconds())
	fmt.Printf("Total time: %v\n\n", elapsed)

	if avgVariance < 0.3 {
		fmt.Println("✓ Shuffle shows good randomness")
	} else if avgVariance < 0.5 {
		fmt.Println("⚠ Shuffle randomness acceptable but could be better")
	} else {
		fmt.Println("✗ Shuffle randomness is poor")
	}

	fmt.Println(strings.Repeat("=", 70))
}

// testGameFairness checks various fairness properties
func testGameFairness(numHands int, verbose bool) {
	fmt.Println("\n" + strings.Repeat("=", 70))
	fmt.Println("GAME FAIRNESS TEST")
	fmt.Println(strings.Repeat("=", 70))
	fmt.Printf("Simulating %d hands to check fairness properties\n\n", numHands)

	dealerBustCount := 0

	cardValueFrequency := make(map[string]int)

	start := time.Now()

	for i := 0; i < numHands; i++ {
		seed := bytes.Repeat([]byte{byte(i % 256), byte(i / 256)}, 16)
		deck := game.NewDeck(7)
		deck.Shuffle(seed)

		// Deal initial hands
		dealerCards := []game.Card{deck.Deal(), deck.Deal()}
		playerCards := []game.Card{deck.Deal(), deck.Deal()}

		// Track first cards
		cardValueFrequency[playerCards[0].Value]++

		// Dealer plays
		dealerCards = game.DealerPlay(deck, dealerCards, true)

		if game.IsBust(dealerCards) {
			dealerBustCount++
		}

		if verbose && (i+1)%1000 == 0 {
			fmt.Printf("Processed %d hands...\n", i+1)
		}
	}

	elapsed := time.Since(start)

	fmt.Println("CARD VALUE DISTRIBUTION (first card dealt):")
	fmt.Println(strings.Repeat("-", 70))

	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}
	expectedFreq := numHands / 13

	for _, value := range values {
		freq := cardValueFrequency[value]
		variance := float64(freq-expectedFreq) / float64(expectedFreq) * 100
		bar := ""
		barLen := freq * 20 / numHands
		for j := 0; j < barLen; j++ {
			bar += "█"
		}
		fmt.Printf("%2s: %5d (%+6.1f%%) %s\n", value, freq, variance, bar)
	}

	fmt.Println("\nDEALER STATISTICS:")
	fmt.Println(strings.Repeat("-", 70))
	dealerBustRate := float64(dealerBustCount) / float64(numHands) * 100
	fmt.Printf("Dealer busts: %d (%.2f%%) (expected ~28%%)\n\n", dealerBustCount, dealerBustRate)
	fmt.Printf("Hands/sec: %.0f\n", float64(numHands)/elapsed.Seconds())
	fmt.Printf("Total time: %v\n", elapsed)

	fmt.Println("\n" + strings.Repeat("=", 70))
}
