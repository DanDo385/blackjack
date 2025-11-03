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
 * Color-coded: Green (Hit), Red (Stand), Yellow (Split), Purple (Double), Gray (Cash Out)
 */
export default function GameActions() {
  const router = useRouter()
  const { tokensInPlay, tokenInPlay, handId, cashOut } = useStore()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (action: string) => {
    if (!handId) {
      toast.error('No active hand')
      return
    }

    setLoading(action)
    try {
      const response = await postJSON(`/api/game/${action}`, {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action failed'
      toast.error(`Failed to ${action}: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleCashOut = async () => {
    setLoading('cashout')
    try {
      await postJSON('/api/game/cashout', {
        handId,
      })
      
      cashOut()
      toast.success('Tokens cashed out successfully')
      router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cash out failed'
      toast.error(`Cash out failed: ${message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tokens at table display */}
      <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
        <div className="text-sm text-green-100 font-semibold">
          Tokens at table: {tokensInPlay.toFixed(6)} {tokenInPlay}
        </div>
      </div>

      {/* Game action buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleAction('hit')}
          disabled={!!loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'hit' ? '...' : 'Hit'}
        </button>

        <button
          onClick={() => handleAction('stand')}
          disabled={!!loading}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'stand' ? '...' : 'Stand'}
        </button>

        <button
          onClick={() => handleAction('split')}
          disabled={!!loading}
          className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'split' ? '...' : 'Split'}
        </button>

        <button
          onClick={() => handleAction('double')}
          disabled={!!loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'double' ? '...' : 'Double'}
        </button>

        <button
          onClick={handleCashOut}
          disabled={!!loading}
          className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-900 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
        >
          {loading === 'cashout' ? '...' : 'Cash Out'}
        </button>
      </div>
    </div>
  )
}

