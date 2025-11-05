'use client'

import { useEffect } from 'react'
import { setBetAgainCallback } from '@/lib/alerts'

/**
 * BetAgainHandler Component
 *
 * Manages the "bet again" callback when players choose to repeat their last bet.
 * This component wraps the alert callback system to trigger a parent callback (onDeal).
 *
 * @param onDeal - Callback function to execute when player confirms betting again
 */
export function BetAgainHandler({ onDeal }: { onDeal: () => void }) {
  useEffect(() => {
    setBetAgainCallback((confirmed: boolean) => {
      if (confirmed) {
        onDeal()
      }
    })

    return () => {
      setBetAgainCallback(() => {})
    }
  }, [onDeal])

  return null
}
