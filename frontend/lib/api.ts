import type { GameState } from '@/lib/store'
import type { EngineState, BetRequest, BetResponse, ActionRequest, ActionResponse } from '@/lib/types'

/**
 * API client with error handling
 *
 * Usage:
 * - getJSON<T>(path) - GET request
 * - postJSON<T>(path, body) - POST request with JSON body
 * - putJSON<T>(path, body) - PUT request with JSON body
 *
 * All requests include proper error handling and logging.
 */

// Use relative URLs in browser (proxied via Next.js rewrites) to avoid CORS
// Always use relative URLs for client-side requests to avoid SSR issues
const getBaseUrl = () => {
  // Always use relative URL in browser (proxied via Next.js rewrites)
  // This prevents SSR issues and deploymentId errors
  if (typeof window !== 'undefined') {
    return ''
  }
  // Server-side: use absolute URL (only if needed for SSR/API routes)
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
}

/**
 * Helper to check if response is ok, throw otherwise
 */
function throwIfNotOk(res: Response) {
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
}

/**
 * Generic GET request
 * Client-side only - uses relative URLs proxied by Next.js
 */
export async function getJSON<T>(path: string): Promise<T> {
  // Ensure this only runs client-side to avoid SSR/deploymentId issues
  if (typeof window === 'undefined') {
    throw new Error('getJSON can only be called from client-side code')
  }
  
  try {
    const url = getBaseUrl() + path
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    throwIfNotOk(res)
    return await res.json()
  } catch (error) {
    console.error(`GET ${path} failed:`, error)
    throw error
  }
}

/**
 * Generic POST request
 * Client-side only - uses relative URLs proxied by Next.js
 */
export async function postJSON<T>(path: string, body: any): Promise<T> {
  // Ensure this only runs client-side to avoid SSR/deploymentId issues
  if (typeof window === 'undefined') {
    throw new Error('postJSON can only be called from client-side code')
  }
  
  try {
    const url = getBaseUrl() + path
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    throwIfNotOk(res)
    return await res.json()
  } catch (error) {
    console.error(`POST ${path} failed:`, error)
    throw error
  }
}

/**
 * Generic PUT request
 * Client-side only - uses relative URLs proxied by Next.js
 */
export async function putJSON<T>(path: string, body: any): Promise<T> {
  // Ensure this only runs client-side to avoid SSR/deploymentId issues
  if (typeof window === 'undefined') {
    throw new Error('putJSON can only be called from client-side code')
  }
  
  try {
    const url = getBaseUrl() + path
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    throwIfNotOk(res)
    return await res.json()
  } catch (error) {
    console.error(`PUT ${path} failed:`, error)
    throw error
  }
}

/**
 * Get current engine state
 * Falls back to default state if API is unavailable
 */
export async function getEngineState(): Promise<Partial<EngineState>> {
  try {
    return await getJSON<EngineState>('/api/engine/state')
  } catch (error) {
    console.warn('Engine state unavailable, using defaults:', error)
    // Return sensible defaults when backend is down
    return {
      phase: 'WAITING_FOR_DEAL',
      phaseDetail: 'Waiting for player to place bet and deal',
      handId: 0,
      deckInitialized: false,
      cardsDealt: 0,
      totalCards: 0,
      dealerHand: [],
      playerHand: [],
      outcome: '',
      payout: '0',
      trueCount: 0,
      shoePct: 0,
      runningCount: 0,
      anchor: 100,
      spreadNum: 4,
      lastBet: 0,
      growthCapBps: 3300,
      tableMin: 5,
      tableMax: 5000,
      lastUpdated: Date.now() / 1000,
    }
  }
}

/**
 * Place a bet and deal cards
 */
export async function placeBet(request: BetRequest): Promise<BetResponse> {
  return postJSON<BetResponse>('/api/engine/bet', request)
}

/**
 * Player hits (requests another card)
 */
export async function playerHit(handId: number): Promise<ActionResponse> {
  return postJSON<ActionResponse>('/api/game/hit', { handId })
}

/**
 * Player stands (ends their turn)
 */
export async function playerStand(handId: number): Promise<ActionResponse> {
  return postJSON<ActionResponse>('/api/game/stand', { handId })
}

/**
 * Player doubles down
 */
export async function playerDouble(handId: number): Promise<ActionResponse> {
  return postJSON<ActionResponse>('/api/game/double', { handId })
}

/**
 * Player splits their hand
 */
export async function playerSplit(handId: number): Promise<ActionResponse> {
  return postJSON<ActionResponse>('/api/game/split', { handId })
}

/**
 * Player buys/declines insurance
 */
export async function playerInsurance(handId: number, buyInsurance: boolean): Promise<ActionResponse> {
  return postJSON<ActionResponse>('/api/game/insurance', { handId, buyInsurance })
}

/**
 * Get user hands/history
 */
export async function getUserHands(playerAddress: string, limit = 100) {
  return getJSON(`/api/user/hands?player=${playerAddress}&limit=${limit}`)
}

/**
 * Get user summary stats
 */
export async function getUserSummary(playerAddress: string) {
  return getJSON(`/api/user/summary?player=${playerAddress}`)
}

/**
 * Get treasury overview
 */
export async function getTreasuryOverview() {
  return getJSON('/api/treasury/overview')
}


