import { create } from 'zustand'

/**
 * Game state store using Zustand
 *
 * Tracks:
 * - Game metrics: trueCount, shoePct (shoe percentage dealt)
 * - Betting parameters: anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax
 * - Raw card counting: cardsDealt, runningCount (for computing true count)
 */
export type GameState = {
  // Display metrics
  trueCount: number
  shoePct: number

  // Betting parameters
  anchor: number
  spreadNum: number
  lastBet: number
  growthCapBps: number
  tableMin: number
  tableMax: number

  // Derived from card counting (internal)
  cardsDealt: number
  runningCount: number
  decks: number

  // Game state
  tokensInPlay: number
  tokenInPlay: string // Token symbol (ETH, USDC, etc.)
  gameActive: boolean
  dealerHand: string[] // Card image paths
  playerHand: string[] // Card image paths
  handId: number | null

  // Actions
  newShoe: () => void
  resetCounting: () => void
  setTokensInPlay: (amount: number, token: string) => void
  cashOut: () => void
  setGameState: (dealerHand: string[], playerHand: string[], handId: number) => void
}

const INITIAL_STATE: Omit<GameState, 'newShoe' | 'resetCounting' | 'setTokensInPlay' | 'cashOut' | 'setGameState'> = {
  // Start with 0% shoe dealt, 0 true count
  trueCount: 0,
  shoePct: 0,

  // Betting defaults
  anchor: 100,
  spreadNum: 4,
  lastBet: 0,
  growthCapBps: 3300,
  tableMin: 5,
  tableMax: 5000,

  // Card counting always starts fresh
  cardsDealt: 0,
  runningCount: 0,
  decks: 7,

  // Game state
  tokensInPlay: 0,
  tokenInPlay: '',
  gameActive: false,
  dealerHand: [],
  playerHand: [],
  handId: null,
}

export const useStore = create<GameState>((set) => ({
  ...INITIAL_STATE,

  /**
   * Reset to a new shoe (called at start or after reshuffle at 67%)
   */
  newShoe: () =>
    set({
      cardsDealt: 0,
      runningCount: 0,
      trueCount: 0,
      shoePct: 0,
      // Keep betting params
    }),

  /**
   * Reset counting without changing betting state
   */
  resetCounting: () =>
    set({
      cardsDealt: 0,
      runningCount: 0,
      trueCount: 0,
      shoePct: 0,
    }),

  /**
   * Set tokens brought to table
   */
  setTokensInPlay: (amount: number, token: string) =>
    set({
      tokensInPlay: amount,
      tokenInPlay: token,
      gameActive: true,
    }),

  /**
   * Cash out - reset tokens and return to betting phase
   */
  cashOut: () =>
    set({
      tokensInPlay: 0,
      tokenInPlay: '',
      gameActive: false,
      dealerHand: [],
      playerHand: [],
      handId: null,
    }),

  /**
   * Update game state with dealer/player hands
   */
  setGameState: (dealerHand: string[], playerHand: string[], handId: number) =>
    set({
      dealerHand,
      playerHand,
      handId,
      gameActive: true,
    }),
}))

/**
 * Derived selector: True Count
 * Computed as runningCount / decksRemaining (clamped to avoid division errors)
 */
export const useTrueCount = () => {
  const { decks, cardsDealt, runningCount } = useStore((s) => ({
    decks: s.decks,
    cardsDealt: s.cardsDealt,
    runningCount: s.runningCount,
  }))

  const decksRemaining = Math.max((decks * 52 - cardsDealt) / 52, 0.25)
  return Number((runningCount / decksRemaining).toFixed(1))
}

/**
 * Derived selector: Shoe Dealt Percentage
 * Shows 0 if cardsDealt is 0 (no cards dealt yet)
 */
export const useShoeDealtPct = () => {
  const { decks, cardsDealt } = useStore((s) => ({
    decks: s.decks,
    cardsDealt: s.cardsDealt,
  }))

  if (cardsDealt === 0) return 0
  return Math.round((cardsDealt / (decks * 52)) * 100)
}


