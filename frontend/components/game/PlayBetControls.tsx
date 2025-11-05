'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import { useStore } from '@/lib/store'
import { placeBet } from '@/lib/api'
import { shouldShowDealButton } from '@/lib/types'

/**
 * PlayBetControls Component
 *
 * Shown on /play page after tokens are brought to table.
 * Displays:
 * - Current wager at table
 * - Deal button to start a hand (only when phase allows)
 * - Bet amount control with increment/decrement
 */

export default function PlayBetControls() {
  const [mounted, setMounted] = useState(false)
  const { isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const {
    phase,
    phaseDetail,
    chipsAtTable,
    handDealt,
    wager,
    wagerStep,
    selectedToken,
    lastBet,
    anchor,
    spreadNum,
    tableMin,
    tableMax,
    growthCapBps,
    setWager,
    setWagerStep,
    setLastWager,
    setGameState,
  } = useStore()

  // Check if Deal button should be visible based on phase
  const canDeal = shouldShowDealButton(phase)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate min and max based on game rules
  const bettingLimits = useMemo(() => {
    const baseMin = Math.max(anchor / spreadNum, tableMin)
    const baseMax = Math.min(anchor * spreadNum, tableMax)
    const growthMax = lastBet ? lastBet * (1 + growthCapBps / 10000) : baseMax

    return {
      min: Math.max(baseMin, 1),
      max: Math.min(baseMax, growthMax),
    }
  }, [anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax])

  const step = Math.max(1, Math.round(anchor * 0.05))

  // Helper: Round to step
  const roundToStep = (value: number, stepVal: number) => {
    return Math.round(value / stepVal) * stepVal
  }

  const applyWager = useCallback(
    (value: number) => {
      const numeric = Number.isFinite(value) ? value : 0
      const positive = Math.max(0, numeric)
      const capped = Math.min(positive, bettingLimits.max)

      setWager(capped)
    },
    [bettingLimits.max, setWager]
  )

  // No automatic wager reset - preserve wager across hands

  // Deal handler
  const handleDeal = async () => {
    if (!canDeal) {
      toast.error('Cannot deal at this time')
      return
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (chipsAtTable <= 0) {
      toast.error('No chips at table')
      return
    }

    if (wager <= 0) {
      toast.error('Please set a wager')
      return
    }

    if (wager > chipsAtTable) {
      toast.error(`Wager exceeds chips at table (${chipsAtTable.toFixed(2)})`)
      return
    }

    if (wager < bettingLimits.min || wager > bettingLimits.max) {
      toast.error(
        `Wager must be between ${bettingLimits.min.toFixed(2)} and ${bettingLimits.max.toFixed(2)}`
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await placeBet({
        amount: wager,
        token: selectedToken,
      })

      if (response.handId) {
        // Update store with dealt cards
        setGameState(
          response.dealerHand || [],
          response.playerHand || [],
          response.handId
        )
        
        // Persist wager and wagerStep for next hand
        setLastWager(wager)
        // wagerStep is already in state, no need to persist separately
      }

      toast.success('Cards dealt ✅')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deal'
      toast.error(`Deal failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-400 text-center">
        Loading...
      </div>
    )
  }

  if (!chipsAtTable || chipsAtTable <= 0) {
    return (
      <div className="p-3 bg-amber-900/30 border border-amber-600 rounded-lg text-sm text-amber-100 text-center">
        ⚠️ Go to <a href="/checkin" className="underline font-semibold hover:no-underline">Check In</a> to bring chips to table
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Chips at Table Status */}
      <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-neutral-400">Chips at Table</div>
            <div className="text-lg font-mono font-semibold text-green-400">
              {chipsAtTable.toFixed(6)} {selectedToken}
            </div>
          </div>
          <a
            href="/checkin"
            className="text-xs px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          >
            Change →
          </a>
        </div>
      </div>

      {/* Wager Control */}
      <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-xl space-y-3">
        <div className="text-sm text-neutral-400 font-medium">Current Wager</div>

        <div className="flex items-center gap-2">
          {/* Decrease button */}
          <button
            type="button"
            aria-label="decrease wager"
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
            onClick={() =>
              applyWager(Math.max(0, roundToStep(wager - wagerStep, wagerStep)))
            }
            disabled={isLoading || handDealt}
          >
            −
          </button>

          {/* Wager input */}
          <input
            type="number"
            inputMode="decimal"
            className="flex-1 px-3 py-2 rounded-lg bg-black border border-neutral-600 text-white font-mono focus:border-neutral-400 transition disabled:opacity-50"
            value={String(wager)}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
              applyWager(Number.isFinite(v) ? v : 0)
            }}
            disabled={isLoading || handDealt}
          />

          {/* Increase button */}
          <button
            type="button"
            aria-label="increase wager"
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
            onClick={() =>
              applyWager(Math.min(roundToStep(wager + wagerStep, wagerStep), bettingLimits.max))
            }
            disabled={isLoading || handDealt}
          >
            +
          </button>
        </div>

        {/* Step Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Step</span>
          <input
            type="number"
            inputMode="decimal"
            className="w-20 px-2 py-1 rounded-lg bg-black border border-neutral-600 text-white font-mono text-xs focus:border-neutral-400 transition disabled:opacity-50"
            value={String(wagerStep)}
            onChange={(e) => {
              const s = Number(e.target.value.replace(/[^0-9.]/g, '')) || 1
              setWagerStep(Math.max(0.0001, s))
            }}
            disabled={isLoading || handDealt}
          />
        </div>

        {/* Betting limits info */}
        <div className="text-xs space-y-1 pt-3 border-t border-neutral-700">
          <div className="flex justify-between text-neutral-400">
            <span>Min bet</span>
            <span className="font-mono">{bettingLimits.min.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Max bet</span>
            <span className="font-mono">{bettingLimits.max.toFixed(2)}</span>
          </div>
          {wager < bettingLimits.min && wager > 0 && (
            <div className="text-red-400">⚠️ Wager below minimum</div>
          )}
          {wager > bettingLimits.max && (
            <div className="text-red-400">⚠️ Wager exceeds maximum</div>
          )}
        </div>
      </div>

      {/* Phase Status */}
      {phaseDetail && (
        <div className="p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-sm text-neutral-300 text-center">
          {phaseDetail}
        </div>
      )}

      {/* Deal Button - Only show when phase allows */}
      {canDeal && (
        <button
          type="button"
          disabled={
            !isConnected ||
            wager <= 0 ||
            wager < bettingLimits.min ||
            wager > bettingLimits.max ||
            isLoading
          }
          onClick={handleDeal}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-bold text-lg transition"
        >
          {isLoading ? '⏳ Dealing…' : '🃏 Deal'}
        </button>
      )}

      {/* Game In Progress Message */}
      {!canDeal && (
        <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg text-sm text-green-100 text-center">
          Hand in progress - use action buttons below to play
        </div>
      )}
    </div>
  )
}
