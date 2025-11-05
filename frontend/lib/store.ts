import { create } from 'zustand'
import type { GameOutcome, GamePhase } from './types'

/**
 * Central Zustand store for blackjack game state.
 *
 * The store keeps track of:
 * - Game phase information (phase + human readable detail)
 * - Shoe metrics (true count, shoe penetration)
 * - Betting configuration and user wager controls
 * - The active hand (dealer/player cards, chips on table, etc.)
 */
export type GameState = {
  phase: GamePhase
  phaseDetail: string
  trueCount: number
  shoePct: number

  // Betting configuration
  anchor: number
  spreadNum: number
  lastBet: number
  growthCapBps: number
  tableMin: number
  tableMax: number

  // Counting helpers
  cardsDealt: number
  runningCount: number
  decks: number

  // Wager controls
  lastWager: number
  wager: number
  wagerStep: number

  // Active hand state
  chipsAtTable: number
  tokenInPlay: string
  selectedToken: string
  gameActive: boolean
  dealerHand: string[]
  playerHand: string[]
  handId: number | null
  showReDealPrompt: boolean
  handDealt: boolean
  outcome: GameOutcome
  payout: string

  // Actions
  newShoe: () => void
  resetCounting: () => void
  setChipsAtTable: (amount: number, token?: string) => void
  updateChipsAfterHand: (payout: number, outcome: GameOutcome) => void
  cashOut: () => void
  setGameState: (dealerHand: string[], playerHand: string[], handId: number) => void
  setWager: (value: number) => void
  setWagerStep: (value: number) => void
  setLastWager: (value: number) => void
  setBettingParams: (params: {
    anchor?: number
    spreadNum?: number
    growthCapBps?: number
    tableMin?: number
    tableMax?: number
  }) => void
  endHand: () => void
  closeReDealPrompt: () => void
  resetHand: () => void
}

const DEFAULT_STATE: Omit<
  GameState,
  |
    'newShoe'
    | 'resetCounting'
    | 'setChipsAtTable'
    | 'updateChipsAfterHand'
    | 'cashOut'
    | 'setGameState'
    | 'setWager'
    | 'setWagerStep'
    | 'setLastWager'
    | 'setBettingParams'
    | 'endHand'
    | 'closeReDealPrompt'
    | 'resetHand'
> = {
  phase: 'WAITING_FOR_DEAL',
  phaseDetail: 'Waiting for player to place bet and deal',
  trueCount: 0,
  shoePct: 0,
  anchor: 100,
  spreadNum: 4,
  lastBet: 0,
  growthCapBps: 3300,
  tableMin: 5,
  tableMax: 5000,
  cardsDealt: 0,
  runningCount: 0,
  decks: 7,
  lastWager: 1,
  wager: 1,
  wagerStep: 10,
  chipsAtTable: 0,
  tokenInPlay: '',
  selectedToken: 'USDC',
  gameActive: false,
  dealerHand: [],
  playerHand: [],
  handId: null,
  showReDealPrompt: false,
  handDealt: false,
  outcome: '',
  payout: '0',
}

// Hydrate persisted preferences before creating the store (client-side only)
if (typeof window !== 'undefined') {
  try {
    const storedWager = localStorage.getItem('lastWager')
    if (storedWager != null) {
      const parsed = Number(storedWager)
      if (Number.isFinite(parsed) && parsed > 0) {
        DEFAULT_STATE.lastWager = parsed
        DEFAULT_STATE.wager = parsed
      }
    }

    const storedBetting = localStorage.getItem('bettingParams')
    if (storedBetting != null) {
      const parsed = JSON.parse(storedBetting)
      if (typeof parsed === 'object' && parsed !== null) {
        if (typeof parsed.anchor === 'number' && parsed.anchor > 0) {
          DEFAULT_STATE.anchor = parsed.anchor
        }
        if (typeof parsed.spreadNum === 'number' && parsed.spreadNum > 0) {
          DEFAULT_STATE.spreadNum = parsed.spreadNum
        }
        if (typeof parsed.growthCapBps === 'number' && parsed.growthCapBps > 0) {
          DEFAULT_STATE.growthCapBps = parsed.growthCapBps
        }
        if (typeof parsed.tableMin === 'number' && parsed.tableMin > 0) {
          DEFAULT_STATE.tableMin = parsed.tableMin
        }
        if (typeof parsed.tableMax === 'number' && parsed.tableMax > 0) {
          DEFAULT_STATE.tableMax = parsed.tableMax
        }
        if (typeof parsed.wagerStep === 'number' && parsed.wagerStep > 0) {
          DEFAULT_STATE.wagerStep = parsed.wagerStep
        }
      }
    }
  } catch (error) {
    console.warn('Failed to hydrate betting preferences:', error)
  }
}

export const useStore = create<GameState>((set, get) => ({
  ...DEFAULT_STATE,

  newShoe: () =>
    set({
      cardsDealt: 0,
      runningCount: 0,
      trueCount: 0,
      shoePct: 0,
    }),

  resetCounting: () =>
    set({
      cardsDealt: 0,
      runningCount: 0,
      trueCount: 0,
      shoePct: 0,
    }),

  setChipsAtTable: (amount: number, token?: string) =>
    set((state) => ({
      chipsAtTable: Math.max(0, amount),
      tokenInPlay: token ?? state.tokenInPlay,
      selectedToken: token ?? state.selectedToken,
      gameActive: amount > 0 ? state.gameActive : false,
    })),

  updateChipsAfterHand: (payout: number, outcome: GameOutcome) =>
    set((state) => {
      let chips = state.chipsAtTable
      const wager = state.wager

      if (outcome === 'win') {
        chips += payout
      } else if (outcome === 'lose') {
        chips = Math.max(0, chips - wager)
      }

      return {
        chipsAtTable: Math.max(0, chips),
        payout: payout.toString(),
        outcome,
      }
    }),

  cashOut: () =>
    set({
      chipsAtTable: 0,
      tokenInPlay: '',
      gameActive: false,
      dealerHand: [],
      playerHand: [],
      handId: null,
      handDealt: false,
      showReDealPrompt: false,
    }),

  setGameState: (dealerHand: string[], playerHand: string[], handId: number) =>
    set({
      dealerHand,
      playerHand,
      handId,
      gameActive: true,
      handDealt: true,
    }),

  setWager: (value: number) =>
    set({
      wager: Math.max(0, value),
    }),

  setWagerStep: (value: number) => {
    set({
      wagerStep: Math.max(0.0001, value),
    })

    if (typeof window !== 'undefined') {
      try {
        const state = get()
        const bettingParams = {
          anchor: state.anchor,
          spreadNum: state.spreadNum,
          growthCapBps: state.growthCapBps,
          tableMin: state.tableMin,
          tableMax: state.tableMax,
          wagerStep: Math.max(0.0001, value),
        }
        localStorage.setItem('bettingParams', JSON.stringify(bettingParams))
      } catch (error) {
        console.warn('Failed to persist wager step:', error)
      }
    }
  },

  setLastWager: (value: number) => {
    set({ lastWager: value })
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lastWager', String(value))
      } catch (error) {
        console.warn('Failed to persist last wager:', error)
      }
    }
  },

  setBettingParams: (params) => {
    set((state) => ({
      anchor: params.anchor ?? state.anchor,
      spreadNum: params.spreadNum ?? state.spreadNum,
      growthCapBps: params.growthCapBps ?? state.growthCapBps,
      tableMin: params.tableMin ?? state.tableMin,
      tableMax: params.tableMax ?? state.tableMax,
    }))

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
        console.warn('Failed to persist betting params:', error)
      }
    }
  },

  endHand: () =>
    set({
      gameActive: false,
      handDealt: false,
      showReDealPrompt: true,
    }),

  closeReDealPrompt: () =>
    set({
      showReDealPrompt: false,
    }),

  resetHand: () =>
    set({
      dealerHand: [],
      playerHand: [],
      handId: null,
      handDealt: false,
    }),
}))

/**
 * Derived selector: True Count (running count / decks remaining)
 */
export const useTrueCount = () => {
  const { decks, cardsDealt, runningCount } = useStore((state) => ({
    decks: state.decks,
    cardsDealt: state.cardsDealt,
    runningCount: state.runningCount,
  }))

  const decksRemaining = Math.max((decks * 52 - cardsDealt) / 52, 0.25)
  return Number((runningCount / decksRemaining).toFixed(1))
}

/**
 * Derived selector: percentage of shoe dealt
 */
export const useShoeDealtPct = () => {
  const { decks, cardsDealt } = useStore((state) => ({
    decks: state.decks,
    cardsDealt: state.cardsDealt,
  }))

  if (cardsDealt === 0) return 0
  return Math.round((cardsDealt / (decks * 52)) * 100)
}
