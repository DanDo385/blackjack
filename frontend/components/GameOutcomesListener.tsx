'use client'

import { useGameOutcomes, useShuffleAlerts } from '@/lib/gameOutcomes'

/**
 * GameOutcomesListener Component
 *
 * This component initializes game outcome detection and shuffle alerts.
 * It should be included once in the app hierarchy (e.g., in the main layout or provider).
 *
 * The hooks inside are responsible for:
 * - useGameOutcomes: Polling for settled hands and showing win/loss alerts
 * - useShuffleAlerts: Detecting deck reshuffles and showing shuffle alerts
 *
 * NOTE: useGameOutcomes is currently disabled while backend APIs are being implemented.
 * The polling requires /api/user/hands and /api/user/summary endpoints.
 * Once those endpoints are ready, uncomment useGameOutcomes() below.
 *
 * Returns null (invisible component), only runs side effects
 */
export function GameOutcomesListener() {
  // TODO: Uncomment when backend APIs are ready
  // Initialize game outcomes tracking
  // useGameOutcomes()

  // Initialize shuffle detection
  useShuffleAlerts()

  // This component is invisible - only runs hooks
  return null
}
