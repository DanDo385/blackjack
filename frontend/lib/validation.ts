/**
 * Runtime validation helpers for API responses
 *
 * These validators ensure that API responses match expected types
 * before they're used by the application.
 */

import type { EngineState, BetResponse, ActionResponse } from './types'

/**
 * Validate EngineState response
 * Ensures all required fields are present and have correct types
 */
export function validateEngineState(data: unknown): data is EngineState {
  if (!data || typeof data !== 'object') return false

  const obj = data as Record<string, unknown>

  // Check required fields
  return (
    typeof obj.phase === 'string' &&
    typeof obj.phaseDetail === 'string' &&
    typeof obj.handId === 'number' &&
    typeof obj.deckInitialized === 'boolean' &&
    typeof obj.cardsDealt === 'number' &&
    typeof obj.totalCards === 'number' &&
    Array.isArray(obj.dealerHand) &&
    Array.isArray(obj.playerHand) &&
    typeof obj.outcome === 'string' &&
    typeof obj.payout === 'string' &&
    typeof obj.trueCount === 'number' &&
    typeof obj.shoePct === 'number' &&
    typeof obj.runningCount === 'number' &&
    typeof obj.anchor === 'number' &&
    typeof obj.spreadNum === 'number' &&
    typeof obj.lastBet === 'number' &&
    typeof obj.growthCapBps === 'number' &&
    typeof obj.tableMin === 'number' &&
    typeof obj.tableMax === 'number' &&
    typeof obj.lastUpdated === 'number'
  )
}

/**
 * Validate BetResponse
 */
export function validateBetResponse(data: unknown): data is BetResponse {
  if (!data || typeof data !== 'object') return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.handId === 'number' &&
    (obj.status === 'dealt' || obj.status === 'pending') &&
    typeof obj.phase === 'string' &&
    typeof obj.phaseDetail === 'string' &&
    Array.isArray(obj.dealerHand) &&
    Array.isArray(obj.playerHand) &&
    typeof obj.message === 'string'
  )
}

/**
 * Validate ActionResponse
 */
export function validateActionResponse(data: unknown): data is ActionResponse {
  if (!data || typeof data !== 'object') return false

  const obj = data as Record<string, unknown>

  return (
    typeof obj.handId === 'number' &&
    typeof obj.phase === 'string' &&
    typeof obj.phaseDetail === 'string' &&
    Array.isArray(obj.dealerHand) &&
    Array.isArray(obj.playerHand) &&
    typeof obj.outcome === 'string' &&
    typeof obj.payout === 'string' &&
    typeof obj.message === 'string'
  )
}

/**
 * Log validation error with helpful debugging info
 */
export function logValidationError(
  functionName: string,
  data: unknown,
  expectedType: string
): void {
  console.warn(
    `Validation failed in ${functionName}: ` +
    `expected ${expectedType} but got ${typeof data}`,
    data
  )
}
