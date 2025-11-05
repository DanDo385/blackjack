import type { EngineState, BetRequest, BetResponse, ActionResponse } from '@/lib/types'
import { validateEngineState, validateBetResponse, validateActionResponse } from '@/lib/validation'

/**
 * API Client Module - Blackjack Game API
 *
 * CRITICAL DESIGN DECISIONS:
 * 1. Client-side only - all relative URLs (proxied by Next.js)
 * 2. No SSR - throws if called server-side to prevent deploymentId errors
 * 3. Graceful fallbacks - returns null/empty responses on error instead of throwing
 * 4. Deal button protection - prevents double-dealing with request-level blocking
 * 5. Simple error handling - minimal logging, maximum stability
 */

// ============================================================================
// STATE MANAGEMENT - Prevent double-dealing
// ============================================================================

let activeDealRequest = false

function isDealInProgress(): boolean {
  return activeDealRequest
}

function resetDealState() {
  activeDealRequest = false
}

// ============================================================================
// BASE URL - Always relative (client-side only)
// ============================================================================

const BASE_URL = ''

// ============================================================================
// CORE HTTP METHODS
// ============================================================================

/**
 * GET request with minimal error handling
 * Returns null on error instead of throwing
 */
export async function getJSON<T>(path: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    console.warn('[API] getJSON called server-side, returning null')
    return null
  }

  try {
    const url = BASE_URL + path
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    // If not ok, return null
    if (!res.ok) {
      console.warn(`[API] GET ${path} failed: ${res.status} ${res.statusText}`)
      return null
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T
    }

    // Parse and return
    try {
      const data = await res.json()
      return data as T
    } catch {
      console.warn(`[API] GET ${path} - failed to parse JSON`)
      return null
    }
  } catch (error) {
    console.warn(`[API] GET ${path} error:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * POST request with minimal error handling
 * Returns null on error instead of throwing
 */
export async function postJSON<T>(path: string, body: any): Promise<T | null> {
  if (typeof window === 'undefined') {
    console.warn('[API] postJSON called server-side, returning null')
    return null
  }

  try {
    const url = BASE_URL + path
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // If not ok, return null
    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.warn(`[API] POST ${path} failed: ${res.status} ${res.statusText}`, errorText)
      return null
    }

    // Parse and return
    try {
      const data = await res.json()
      return data as T
    } catch {
      console.warn(`[API] POST ${path} - failed to parse JSON`)
      return null
    }
  } catch (error) {
    console.warn(`[API] POST ${path} error:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * PUT request with minimal error handling
 * Returns null on error instead of throwing
 */
export async function putJSON<T>(path: string, body: any): Promise<T | null> {
  if (typeof window === 'undefined') {
    console.warn('[API] putJSON called server-side, returning null')
    return null
  }

  try {
    const url = BASE_URL + path
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.warn(`[API] PUT ${path} failed: ${res.status} ${res.statusText}`, errorText)
      return null
    }

    try {
      const data = await res.json()
      return data as T
    } catch {
      console.warn(`[API] PUT ${path} - failed to parse JSON`)
      return null
    }
  } catch (error) {
    console.warn(`[API] PUT ${path} error:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

// ============================================================================
// GAME ENGINE FUNCTIONS
// ============================================================================

/**
 * Get current game engine state
 * Safe to call frequently (polling, etc.)
 * Returns null if API fails
 */
export async function getEngineState(): Promise<EngineState | null> {
  const response = await getJSON<any>('/api/engine/state')

  if (!response) {
    return null
  }

  // Validate response structure
  if (!validateEngineState(response)) {
    console.warn('[API] Invalid engine state structure')
    return null
  }

  return response
}

/**
 * Place a bet and deal initial cards
 * Prevents double-dealing by tracking active requests
 */
export async function placeBet(request: BetRequest): Promise<BetResponse | null> {
  // Prevent double-dealing
  if (isDealInProgress()) {
    console.warn('[API] Deal already in progress')
    return null
  }

  activeDealRequest = true

  try {
    const response = await postJSON<any>('/api/engine/bet', request)

    if (!response) {
      console.warn('[API] placeBet - no response from server')
      return null
    }

    // Validate response
    if (!validateBetResponse(response)) {
      console.warn('[API] placeBet - invalid response structure')
      return null
    }

    return response
  } finally {
    resetDealState()
  }
}

/**
 * Player hit action
 */
export async function playerHit(handId: number): Promise<ActionResponse | null> {
  if (!handId || handId <= 0) {
    console.warn('[API] Invalid handId for hit:', handId)
    return null
  }

  const response = await postJSON<any>('/api/game/hit', { handId })

  if (!response) {
    return null
  }

  if (!validateActionResponse(response)) {
    console.warn('[API] playerHit - invalid response structure')
    return null
  }

  return response
}

/**
 * Player stand action
 */
export async function playerStand(handId: number): Promise<ActionResponse | null> {
  if (!handId || handId <= 0) {
    console.warn('[API] Invalid handId for stand:', handId)
    return null
  }

  const response = await postJSON<any>('/api/game/stand', { handId })

  if (!response) {
    return null
  }

  if (!validateActionResponse(response)) {
    console.warn('[API] playerStand - invalid response structure')
    return null
  }

  return response
}

/**
 * Player double down action
 */
export async function playerDouble(handId: number): Promise<ActionResponse | null> {
  if (!handId || handId <= 0) {
    console.warn('[API] Invalid handId for double:', handId)
    return null
  }

  const response = await postJSON<any>('/api/game/double', { handId })

  if (!response) {
    return null
  }

  if (!validateActionResponse(response)) {
    console.warn('[API] playerDouble - invalid response structure')
    return null
  }

  return response
}

/**
 * Player split action
 */
export async function playerSplit(handId: number): Promise<ActionResponse | null> {
  if (!handId || handId <= 0) {
    console.warn('[API] Invalid handId for split:', handId)
    return null
  }

  const response = await postJSON<any>('/api/game/split', { handId })

  if (!response) {
    return null
  }

  if (!validateActionResponse(response)) {
    console.warn('[API] playerSplit - invalid response structure')
    return null
  }

  return response
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

/**
 * Get user hand history
 */
export async function getUserHands(playerAddress: string, limit = 100): Promise<any[] | null> {
  if (!playerAddress) {
    console.warn('[API] Invalid playerAddress for getUserHands')
    return null
  }

  const response = await getJSON<any[]>(`/api/user/hands?player=${encodeURIComponent(playerAddress)}&limit=${limit}`)
  return response
}

/**
 * Get user summary statistics
 */
export async function getUserSummary(playerAddress: string): Promise<any | null> {
  if (!playerAddress) {
    console.warn('[API] Invalid playerAddress for getUserSummary')
    return null
  }

  const response = await getJSON<any>(`/api/user/summary?player=${encodeURIComponent(playerAddress)}`)
  return response
}

// ============================================================================
// TREASURY FUNCTIONS
// ============================================================================

/**
 * Get treasury overview data
 */
export async function getTreasuryOverview(): Promise<any | null> {
  const response = await getJSON<any>('/api/treasury/overview')
  return response
}
