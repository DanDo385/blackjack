'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { playerHit, playerStand, playerDouble, playerSplit } from '@/lib/api'
import { shouldShowActionButtons } from '@/lib/types'

/**
 * GameActions Component
 *
 * Displays blackjack action buttons based on game phase
 * Only shows action buttons when phase is PLAYER_TURN
 * Color-coded: Green (Hit), Red (Stand), Yellow (Split), Purple (Double), Gray (Cash Out)
 */
export default function GameActions() {
  const router = useRouter()
  const {
    phase,
    chipsAtTable,
    tokenInPlay,
    handId,
    playerHand,
    wager,
    cashOut,
    endHand,
    setGameState,
    updateChipsAfterHand,
  } = useStore()
  const [loading, setLoading] = useState<string | null>(null)

  // Check if action buttons should be shown based on phase
  const canShowActions = shouldShowActionButtons(phase)

  const handleHit = async () => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading('hit')
    try {
      const response = await playerHit(handId)

      // Update game state with response
      if (response.dealerHand && response.playerHand) {
        setGameState(
          response.dealerHand,
          response.playerHand,
          response.handId
        )
      }

      if (response.message) {
        toast.success(response.message)
      }

      // Check if hand is complete
      if (response.phase === 'COMPLETE') {
        if (response.outcome && response.payout) {
          const payoutAmount = parseFloat(response.payout)
          updateChipsAfterHand(payoutAmount, response.outcome)
          toast.success(`${response.outcome.toUpperCase()}! Payout: ${response.payout}`)
        }
        endHand()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to hit: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleStand = async () => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading('stand')
    try {
      const response = await playerStand(handId)

      // Update game state with response
      if (response.dealerHand && response.playerHand) {
        setGameState(
          response.dealerHand,
          response.playerHand,
          response.handId
        )
      }

      if (response.outcome && response.payout) {
        const payoutAmount = parseFloat(response.payout)
        updateChipsAfterHand(payoutAmount, response.outcome)
        toast.success(`${response.outcome.toUpperCase()}! Payout: ${response.payout}`)
      }

      // End hand and show re-deal prompt
      endHand()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to stand: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleSplit = async () => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading('split')
    try {
      const response = await playerSplit(handId)

      // Update game state with response
      if (response.dealerHand && response.playerHand) {
        setGameState(
          response.dealerHand,
          response.playerHand,
          response.handId
        )
      }

      if (response.message) {
        toast.success(response.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to split: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDouble = async () => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading('double')
    try {
      const response = await playerDouble(handId)

      // Update game state with response
      if (response.dealerHand && response.playerHand) {
        setGameState(
          response.dealerHand,
          response.playerHand,
          response.handId
        )
      }

      if (response.outcome && response.payout) {
        const payoutAmount = parseFloat(response.payout)
        updateChipsAfterHand(payoutAmount, response.outcome)
        toast.success(`${response.outcome.toUpperCase()}! Payout: ${response.payout}`)
      }

      // End hand after double (automatic stand)
      endHand()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to double: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleCashOut = async () => {
    setLoading('cashout')
    try {
      // Note: Backend cashout endpoint may not exist yet
      // For now, just clear the local state and redirect
      cashOut()
      toast.success(`Cashed out ${chipsAtTable.toFixed(6)} ${tokenInPlay}`)
      router.push('/checkin')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cash out failed'
      toast.error(`Cash out failed: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  // Helper to determine if action is available
  const canHit = canShowActions && !loading
  const canStand = canShowActions && !loading
  const canSplit = canShowActions && playerHand.length === 2 && !loading // Only on initial deal
  const canDouble = canShowActions && playerHand.length === 2 && !loading // Only on initial deal
  const canCashOut = !loading

  // Don't render anything if not at table
  if (!chipsAtTable || chipsAtTable <= 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Game action buttons - only show when phase is PLAYER_TURN */}
      {canShowActions && (
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleHit}
            disabled={!canHit}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              canHit
                ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading === 'hit' ? '...' : 'Hit'}
          </button>

          <button
            onClick={handleStand}
            disabled={!canStand}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              canStand
                ? 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading === 'stand' ? '...' : 'Stand'}
          </button>

          <button
            onClick={handleSplit}
            disabled={!canSplit}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              canSplit
                ? 'bg-yellow-400 hover:bg-yellow-500 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading === 'split' ? '...' : 'Split'}
          </button>

          <button
            onClick={handleDouble}
            disabled={!canDouble}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              canDouble
                ? 'bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading === 'double' ? '...' : 'Double'}
          </button>
        </div>
      )}

      {/* Cash Out button - always available */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleCashOut}
          disabled={!canCashOut}
          className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-900 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'cashout' ? '...' : 'Cash Out'}
        </button>
      </div>
    </div>
  )
}

