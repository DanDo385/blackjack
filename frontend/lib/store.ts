import { create } from 'zustand'
import type { GamePhase, GameOutcome } from './types'

/**
 * Game state store using Zustand
 *
 * Tracks:
 * - Game metrics: trueCount, shoePct (shoe percentage dealt)
 * - Betting parameters: anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax
 * - Raw card counting: cardsDealt, runningCount (for computing true count)
 * - Phase tracking: current game phase (WAITING_FOR_DEAL, SHUFFLING, etc.)
 */
export type GameState = {
  // Phase tracking (new state machine)
  phase: GamePhase
  phaseDetail: string

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

  // Wager controls (for UX)
  lastWager: number    // Persisted default wager
  wager: number        // Current wager input
  wagerStep: number    // Increment step for +/- buttons

  // Game state
  tokensInPlay: number
  tokenInPlay: string // Token symbol (ETH, USDC, etc.)
  selectedToken: string // Currently selected token for betting
  gameActive: boolean
  dealerHand: string[] // Card image paths
  playerHand: string[] // Card image paths
  handId: number | null
  showReDealPrompt: boolean // Show re-deal prompt after hand ends
  handDealt: boolean // Whether cards have been dealt

  // Outcome
  outcome: GameOutcome
  payout: string

  // Actions
  newShoe: () => void
  resetCounting: () => void
  setTokensInPlay: (amount: number, token: string) => void
  cashOut: () => void
  setGameState: (dealerHand: string[], playerHand: string[], handId: number) => void
  setWager: (value: number) => void
  setWagerStep: (value: number) => void
  setLastWager: (value: number) => void
  endHand: () => void // Ends hand and shows re-deal prompt
  closeReDealPrompt: () => void
  resetHand: () => void // Resets hand state for new deal
}

const INITIAL_STATE: Omit<GameState, 'newShoe' | 'resetCounting' | 'setTokensInPlay' | 'cashOut' | 'setGameState' | 'setWager' | 'setWagerStep' | 'setLastWager' | 'endHand' | 'closeReDealPrompt' | 'resetHand'> = {
  // Phase tracking
  phase: 'WAITING_FOR_DEAL',
  phaseDetail: 'Waiting for player to place bet and deal',

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

  // Wager controls (loaded from localStorage if available)
  lastWager: 1,
  wager: 1,
  wagerStep: 1,

  // Game state
  tokensInPlay: 0,
  tokenInPlay: '',
  selectedToken: 'USDC',
  gameActive: false,
  dealerHand: [],
  playerHand: [],
  handId: null,
  showReDealPrompt: false,
  handDealt: false,

  // Outcome
  outcome: '',
  payout: '0',
}

export const useStore = create<GameState>((set, get) => {
  // Hydrate lastWager from localStorage on client
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('lastWager')
      if (stored != null) {
        const parsed = Number(stored)
        if (Number.isFinite(parsed) && parsed > 0) {
          INITIAL_STATE.lastWager = parsed
          INITIAL_STATE.wager = parsed
        }
      }
    } catch (error) {
      console.warn('Failed to hydrate lastWager from localStorage:', error)
    }
  }

  return {
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
      selectedToken: token,
      gameActive: amount > 0,
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
      handDealt: false,
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
      handDealt: true,
    }),

  /**
   * Set current wager value
   */
  setWager: (value: number) =>
    set({
      wager: Math.max(0, value),
    }),

  /**
   * Set wager increment step
   */
  setWagerStep: (value: number) =>
    set({
      wagerStep: Math.max(0.0001, value),
    }),

  /**
   * Set last wager (persisted default)
   */
  setLastWager: (value: number) => {
    set({ lastWager: value })
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lastWager', String(value))
      } catch (error) {
        console.warn('Failed to save lastWager to localStorage:', error)
      }
    }
  },

  /**
   * End hand and show re-deal prompt
   */
  endHand: () =>
    set({
      gameActive: false,
      handDealt: false,
      showReDealPrompt: true,
    }),

    /**
     * Close re-deal prompt
     */
    closeReDealPrompt: () =>
      set({
        showReDealPrompt: false,
      }),

    /**
     * Reset hand state for new deal
     */
    resetHand: () =>
      set({
        dealerHand: [],
        playerHand: [],
        handId: null,
        handDealt: false,
      }),
  }
})

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

