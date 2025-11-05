import { create } from 'zustand'
import type { GamePhase, GameOutcome } from './types'
import { getPhaseDescription } from './types'

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

  // Game state - Token tracking
  // Note: Three related fields with distinct purposes:
  // - tokensInPlay: Amount of tokens brought to the table (number)
  // - tokenInPlay: Symbol of the token actually in play (e.g., "USDC", "ETH")
  // - selectedToken: Token symbol selected in UI for betting (before bringing to table)
  tokensInPlay: number         // Amount of tokens at the table
  tokenInPlay: string          // Token symbol currently in play ("USDC", "ETH", etc.)
  selectedToken: string        // Token selected in betting UI (default: "USDC")
  chipsAtTable: number         // Amount of chips/tokens available for play
  gameActive: boolean
  dealerHand: string[] // Card image paths
  playerHand: string[] // Card image paths
  handId: number | null
  showReDealPrompt: boolean // Show re-deal prompt after hand ends
  handDealt: boolean // Whether cards have been dealt

  // Outcome
  outcome: GameOutcome
  payout: string

  // Scoreboard metrics
  playerWinnings: number
  playerLosses: number
  dealerWins: number

  // Actions
  newShoe: () => void
  resetCounting: () => void
  setTokensInPlay: (amount: number, token: string) => void
  setChipsAtTable: (amount: number) => void
  updateChipsAtTable: (delta: number) => void // Update chips when hand is won/lost
  cashOut: () => void
  setGameState: (update: {
    dealerHand?: string[]
    playerHand?: string[]
    handId?: number | null
    phase?: GamePhase
    phaseDetail?: string
    outcome?: GameOutcome
    payout?: string
  }) => void
  setWager: (value: number) => void
  setWagerStep: (value: number) => void
  setLastWager: (value: number) => void
  setBettingParams: (params: {
    anchor?: number
    spreadNum?: number
    growthCapBps?: number
    tableMin?: number
    tableMax?: number
    lastBet?: number
  }) => void
  endHand: () => void // Ends hand and shows re-deal prompt
  closeReDealPrompt: () => void
  resetHand: () => void
  updateChipsAfterHand: (payout: number, wagerLost: number, outcome: string) => void
}

const INITIAL_STATE: Omit<GameState, 'newShoe' | 'resetCounting' | 'setTokensInPlay' | 'setChipsAtTable' | 'updateChipsAtTable' | 'cashOut' | 'setGameState' | 'setWager' | 'setWagerStep' | 'setLastWager' | 'setBettingParams' | 'endHand' | 'closeReDealPrompt' | 'resetHand' | 'updateChipsAfterHand'> = {
  // Phase tracking
  phase: 'WAITING_FOR_DEAL',
  phaseDetail: '',

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
  wagerStep: 10, // Default to 10 chips

  // Game state
  tokensInPlay: 0,
  tokenInPlay: '',
  selectedToken: 'USDC',
  chipsAtTable: 0, // Amount checked in with
  gameActive: false,
  dealerHand: [],
  playerHand: [],
  handId: null,
  showReDealPrompt: false,
  handDealt: false,

  // Outcome
  outcome: '',
  payout: '0',

  // Scoreboard metrics
  playerWinnings: 0,
  playerLosses: 0,
  dealerWins: 0,
}

export const useStore = create<GameState>((set, get) => {
  // Hydrate persisted values from localStorage on client
  if (typeof window !== 'undefined') {
    try {
      // Load lastWager
      const storedWager = localStorage.getItem('lastWager')
      if (storedWager != null) {
        const parsed = Number(storedWager)
        if (Number.isFinite(parsed) && parsed > 0) {
          INITIAL_STATE.lastWager = parsed
          INITIAL_STATE.wager = parsed
        }
      }

      // Load betting parameters
      const storedBetting = localStorage.getItem('bettingParams')
      if (storedBetting != null) {
        const parsed = JSON.parse(storedBetting)
        if (typeof parsed === 'object' && parsed !== null) {
          if (typeof parsed.anchor === 'number' && parsed.anchor > 0) {
            INITIAL_STATE.anchor = parsed.anchor
          }
          if (typeof parsed.spreadNum === 'number' && parsed.spreadNum > 0) {
            INITIAL_STATE.spreadNum = parsed.spreadNum
          }
          if (typeof parsed.growthCapBps === 'number' && parsed.growthCapBps > 0) {
            INITIAL_STATE.growthCapBps = parsed.growthCapBps
          }
          if (typeof parsed.tableMin === 'number' && parsed.tableMin > 0) {
            INITIAL_STATE.tableMin = parsed.tableMin
          }
          if (typeof parsed.tableMax === 'number' && parsed.tableMax > 0) {
            INITIAL_STATE.tableMax = parsed.tableMax
          }
          if (typeof parsed.wagerStep === 'number' && parsed.wagerStep > 0) {
            INITIAL_STATE.wagerStep = parsed.wagerStep
          }
          if (typeof parsed.lastBet === 'number' && parsed.lastBet >= 0) {
            INITIAL_STATE.lastBet = parsed.lastBet
          }
        }
      }
    } catch (error) {
      console.warn('Failed to hydrate from localStorage:', error)
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
   * Set chips at table (amount checked in with)
   */
  setChipsAtTable: (amount: number) =>
    set({
      chipsAtTable: Math.max(0, amount),
    }),

  /**
   * Update chips at table (for wins/losses)
   */
  updateChipsAtTable: (delta: number) =>
    set((state) => ({
      chipsAtTable: Math.max(0, state.chipsAtTable + delta),
    })),

  /**
   * Cash out - reset tokens and return to betting phase
   */
  cashOut: () =>
    set({
      tokensInPlay: 0,
      tokenInPlay: '',
      chipsAtTable: 0,
      gameActive: false,
      dealerHand: [],
      playerHand: [],
      handId: null,
      handDealt: false,
      phase: 'WAITING_FOR_DEAL',
      phaseDetail: '',
    }),

  /**
   * Update game state with dealer/player hands
   */
  setGameState: (update) =>
    set((state) => ({
      dealerHand: update.dealerHand ?? state.dealerHand,
      playerHand: update.playerHand ?? state.playerHand,
      handId: update.handId ?? state.handId,
      phase: update.phase ?? state.phase,
      phaseDetail:
        update.phaseDetail ??
        (update.phase ? getPhaseDescription(update.phase) : state.phaseDetail),
      outcome: update.outcome ?? state.outcome,
      payout: update.payout ?? state.payout,
      gameActive: true,
      handDealt: true,
    })),

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
  setWagerStep: (value: number) => {
    set({
      wagerStep: Math.max(0.0001, value),
    })
    // Persist betting params after wager step change
    if (typeof window !== 'undefined') {
      try {
        const state = get()
        const bettingParams = {
          anchor: state.anchor,
          spreadNum: state.spreadNum,
          growthCapBps: state.growthCapBps,
          tableMin: state.tableMin,
          tableMax: state.tableMax,
          wagerStep: state.wagerStep,
        }
        localStorage.setItem('bettingParams', JSON.stringify(bettingParams))
      } catch (error) {
        console.warn('Failed to save bettingParams to localStorage:', error)
      }
    }
  },

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
   * Set betting parameters (anchor, spreadNum, tableMin, tableMax, lastBet, etc.)
   * Automatically persists to localStorage
   */
  setBettingParams: (params: {
    anchor?: number
    spreadNum?: number
    growthCapBps?: number
    tableMin?: number
    tableMax?: number
    lastBet?: number
  }) => {
    set((state) => ({
      anchor: params.anchor ?? state.anchor,
      spreadNum: params.spreadNum ?? state.spreadNum,
      growthCapBps: params.growthCapBps ?? state.growthCapBps,
      tableMin: params.tableMin ?? state.tableMin,
      tableMax: params.tableMax ?? state.tableMax,
      lastBet: params.lastBet ?? state.lastBet,
    }))
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        const state = get()
        const bettingParams = {
          anchor: state.anchor,
          spreadNum: state.spreadNum,
          growthCapBps: state.growthCapBps,
          tableMin: state.tableMin,
          tableMax: state.tableMax,
          lastBet: state.lastBet,
          wagerStep: state.wagerStep,
        }
        localStorage.setItem('bettingParams', JSON.stringify(bettingParams))
      } catch (error) {
        console.warn('Failed to save bettingParams to localStorage:', error)
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
      phase: 'COMPLETE',
      phaseDetail: getPhaseDescription('COMPLETE'),
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
        phase: 'WAITING_FOR_DEAL',
        phaseDetail: '',
      }),

    /**
     * Update chips and scoreboard metrics after a hand completes
     */
    updateChipsAfterHand: (payout: number, wagerLost: number, outcome: string) =>
      set((state) => {
        const newTotals = {
          chipsAtTable: state.chipsAtTable + payout - wagerLost,
          playerWinnings: state.playerWinnings,
          playerLosses: state.playerLosses,
          dealerWins: state.dealerWins,
        }
        if (outcome === 'win') newTotals.playerWinnings += payout
        if (outcome === 'lose') newTotals.playerLosses += wagerLost
        if (outcome === 'lose' || outcome === 'push') newTotals.dealerWins += 1 // Dealer wins on loss or push
        return newTotals
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
