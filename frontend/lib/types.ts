/**
 * TypeScript type definitions for the YOLO Blackjack game engine
 * These types match the backend state machine implementation
 */

/**
 * GamePhase represents the current phase of the game
 * Phases follow a deterministic state machine:
 * WAITING_FOR_DEAL → SHUFFLING → DEALING → PLAYER_TURN → DEALER_TURN → RESOLUTION → COMPLETE
 */
export type GamePhase =
  | 'WAITING_FOR_DEAL'  // Initial state, waiting for player to click Deal
  | 'SHUFFLING'         // Deck is being created and shuffled
  | 'DEALING'           // Initial cards are being dealt
  | 'PLAYER_TURN'       // Player is making decisions (Hit, Stand, Double, Split)
  | 'DEALER_TURN'       // Dealer is playing according to rules
  | 'RESOLUTION'        // Hand is being resolved and payout calculated
  | 'COMPLETE'          // Hand is complete, waiting for next hand

/**
 * GameOutcome represents the result of a hand
 */
export type GameOutcome = 'win' | 'lose' | 'push' | ''

/**
 * EngineState represents the complete state of the game engine
 * This is the shape returned by the backend /api/engine/state endpoint
 */
export interface EngineState {
  // Phase tracking
  phase: GamePhase
  phaseDetail: string  // Human-readable phase description

  // Game state
  handId: number
  deckInitialized: boolean
  cardsDealt: number
  totalCards: number

  // Hand state (card image paths)
  dealerHand: string[]
  playerHand: string[]

  // Outcome
  outcome: GameOutcome
  payout: string  // In wei as string

  // Counting metrics
  trueCount: number
  shoePct: number
  runningCount: number

  // Table parameters
  anchor: number
  spreadNum: number
  lastBet: number
  growthCapBps: number
  tableMin: number
  tableMax: number

  // Metadata
  lastUpdated: number  // Unix timestamp
}

/**
 * BetRequest represents a bet placement request
 */
export interface BetRequest {
  amount: number
  token?: string
  usdcRef?: string
  quoteId?: string
}

/**
 * BetResponse represents the response from placing a bet
 */
export interface BetResponse {
  handId: number
  status: 'dealt' | 'pending'
  phase: GamePhase
  phaseDetail: string
  dealerHand: string[]
  playerHand: string[]
  message: string
}

/**
 * ActionRequest represents a game action request
 *
 * Note: Currently unused - actions are sent via specific endpoints (hit, stand, double, split, insurance)
 * rather than through a generic action endpoint. Kept for reference/future refactoring.
 */
export interface ActionRequest {
  handId: number
  action?: string
  buyInsurance?: boolean
  amount?: number
}

/**
 * ActionResponse represents the response from a game action
 */
export interface ActionResponse {
  handId: number
  phase: GamePhase
  phaseDetail: string
  dealerHand: string[]
  playerHand: string[]
  outcome: GameOutcome
  payout: string
  message: string
}

/**
 * Helper function to check if cards should be visible
 * Cards should only be visible after DEALING phase or later
 */
export function shouldShowCards(phase: GamePhase): boolean {
  return phase !== 'WAITING_FOR_DEAL' && phase !== 'SHUFFLING'
}

/**
 * Helper function to check if Deal button should be shown
 * Deal button should only be shown in WAITING_FOR_DEAL or COMPLETE phase
 */
export function shouldShowDealButton(phase: GamePhase): boolean {
  return phase === 'WAITING_FOR_DEAL' || phase === 'COMPLETE'
}

/**
 * Helper function to check if action buttons should be shown
 * Action buttons (Hit, Stand, etc.) should only be shown in PLAYER_TURN phase
 */
export function shouldShowActionButtons(phase: GamePhase): boolean {
  return phase === 'PLAYER_TURN'
}

/**
 * Helper function to check if hand is complete
 * Hand is complete when in COMPLETE phase
 *
 * Note: Currently unused - can be used for state validation
 */
export function isHandComplete(phase: GamePhase): boolean {
  return phase === 'COMPLETE'
}

/**
 * Helper function to check if game is in progress
 * Game is in progress when not in WAITING_FOR_DEAL or COMPLETE phase
 *
 * Note: Currently unused - can be used for UI state management
 */
export function isGameInProgress(phase: GamePhase): boolean {
  return phase !== 'WAITING_FOR_DEAL' && phase !== 'COMPLETE'
}

/**
 * Phase transition validation
 * Returns true if the transition from 'from' to 'to' is valid
 *
 * Note: Currently unused - backend enforces state machine transitions.
 * Can be used for client-side validation or debug assertions.
 */
export function isValidTransition(from: GamePhase, to: GamePhase): boolean {
  const validTransitions: Record<GamePhase, GamePhase[]> = {
    WAITING_FOR_DEAL: ['SHUFFLING'],
    SHUFFLING: ['DEALING'],
    DEALING: ['PLAYER_TURN', 'RESOLUTION'], // Direct to resolution for blackjack
    PLAYER_TURN: ['DEALER_TURN', 'RESOLUTION'], // Direct to resolution for bust
    DEALER_TURN: ['RESOLUTION'],
    RESOLUTION: ['COMPLETE'],
    COMPLETE: ['WAITING_FOR_DEAL', 'SHUFFLING'],
  }

  return validTransitions[from]?.includes(to) ?? false
}

/**
 * Get user-friendly phase description
 */
export function getPhaseDescription(phase: GamePhase): string {
  const descriptions: Record<GamePhase, string> = {
    WAITING_FOR_DEAL: 'Place your bet and click Deal to start',
    SHUFFLING: 'Shuffling deck...',
    DEALING: 'Dealing cards...',
    PLAYER_TURN: 'Your turn - choose an action',
    DEALER_TURN: 'Dealer is playing...',
    RESOLUTION: 'Resolving hand...',
    COMPLETE: 'Hand complete',
  }

  return descriptions[phase] ?? phase
}
