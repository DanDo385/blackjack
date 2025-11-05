'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useStore } from '@/lib/store'
import { postJSON } from '@/lib/api'

/**
 * GameActions Component
 *
 * Displays blackjack action buttons after tokens are brought to table
 * Color-coded: Teal (Deal), Green (Hit), Red (Stand), Yellow (Split), Purple (Double), Gray (Cash Out)
 */
export default function GameActions() {
  const router = useRouter()
  const { 
    tokensInPlay, 
    tokenInPlay, 
    handId, 
    handDealt,
    dealerHand,
    playerHand,
    cashOut, 
    endHand,
    setGameState,
    resetHand
  } = useStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading(action)
    try {
      const response: any = await postJSON(`/api/game/${action}`, {
        handId,
        action,
      })
      
      // Update game state with response
      if (response.dealerHand && response.playerHand) {
        useStore.getState().setGameState(
          response.dealerHand,
          response.playerHand,
          response.handId
        )
      }

      if (response.message) {
        toast.success(response.message)
      }

      // Check if hand is complete (Stand action)
      if (action === 'stand') {
        // End hand and show re-deal prompt
        endHand()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to ${action}: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDeal = async () => {
    setLoading('deal')
    try {
      // Call backend to deal hand
      const response = await postJSON<{
        handId?: number
        dealerHand?: string[]
        playerHand?: string[]
        message?: string
      }>('/api/engine/bet', {
        amount: tokensInPlay,
        token: tokenInPlay,
      })

      // Start game by dealing cards
      if (response.handId) {
        setGameState(
          response.dealerHand || [],
          response.playerHand || [],
          response.handId
        )
      }

      toast.success('Cards dealt ✅')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deal'
      toast.error(`Deal failed: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleCashOut = async () => {
    setLoading('cashout')
    try {
      // Try to call backend cash out endpoint, but don't fail if it's not available
      try {
        await postJSON('/api/game/cashout', {
          handId,
        })
      } catch (err) {
        // Backend endpoint may not exist, just continue with local state
        console.log('Backend cashout not available, proceeding with local state reset')
      }

      cashOut()
      toast.success('Tokens cashed out successfully')
      router.push('/checkin')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cash out failed'
      toast.error(`Cash out failed: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  // Helper to determine if action is available
  const canHit = handDealt && !loading
  const canStand = handDealt && !loading
  const canSplit = handDealt && playerHand.length === 2 && !loading // Only on initial deal
  const canDouble = handDealt && playerHand.length === 2 && !loading // Only on initial deal
  const canDeal = !handDealt && !loading
  const canCashOut = !loading

  return (
    <div className="space-y-4">
      {/* Tokens at table display */}
      <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
        <div className="text-sm text-green-100 font-semibold">
          Tokens at table: {tokensInPlay.toFixed(6)} {tokenInPlay}
        </div>
      </div>

      {/* Deal button - appears when no hand is dealt */}
      {!handDealt && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleDeal}
            disabled={!canDeal}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105"
          >
            {loading === 'deal' ? 'Dealing...' : 'Deal'}
          </button>
        </div>
      )}

      {/* Game action buttons - appear after cards are dealt */}
      {handDealt && (
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => handleAction('hit')}
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
            onClick={() => handleAction('stand')}
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
            onClick={() => handleAction('split')}
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
            onClick={() => handleAction('double')}
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

