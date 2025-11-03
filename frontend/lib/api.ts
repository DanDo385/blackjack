import type { GameState } from '@/lib/store'

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
// Use absolute URLs in server-side contexts
const getBaseUrl = () => {
  // In browser, use relative URL (proxied via Next.js rewrites)
  if (typeof window !== 'undefined') {
    return ''
  }
  // Server-side: use absolute URL
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
}

const BASE_URL = getBaseUrl()

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
 */
export async function getJSON<T>(path: string): Promise<T> {
  try {
    const url = `${BASE_URL}${path}`
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
 */
export async function postJSON<T>(path: string, body: any): Promise<T> {
  try {
    const url = `${BASE_URL}${path}`
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
 */
export async function putJSON<T>(path: string, body: any): Promise<T> {
  try {
    const url = `${BASE_URL}${path}`
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
export async function getEngineState(): Promise<Partial<GameState>> {
  try {
    return await getJSON<Partial<GameState>>('/api/engine/state')
  } catch (error) {
    console.warn('Engine state unavailable, using defaults:', error)
    // Return sensible defaults when backend is down
    return {
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
    }
  }
}

/**
 * Place a bet
 */
export async function placeBet(amount: number) {
  return postJSON('/api/engine/bet', { amount })
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


