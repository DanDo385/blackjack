'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAccount } from 'wagmi'
import { useStore } from '@/lib/store'
import { placeBet, playerHit, playerStand, playerDouble, playerSplit } from '@/lib/api'
import { shouldShowActionButtons, shouldShowDealButton } from '@/lib/types'
import ReDealPrompt from './ReDealPrompt'

/**
 * BetControls Component - Game Actions & Betting Controls
 *
 * This component handles game actions and betting controls AFTER chips are at the table.
 * Token selection and check-in is handled on the /checkin page.
 *
 * Features:
 * - Deal button (always visible, disabled when appropriate)
 * - Hit/Stand/Double/Split buttons (during PLAYER_TURN phase)
 * - Cash Out button (always available)
 * - Wager control between hands
 * - Re-deal prompt handling
 *
 * Note: When chipsAtTable is 0 or missing, this component returns null.
 * The /play page shows a Check In button instead.
 */

// Token selection and check-in are now handled on /checkin page only

interface BetControlsProps {
  anchor?: number
  spreadNum?: number
  lastBet?: number
  growthCapBps?: number
  tableMin?: number
  tableMax?: number
}

export default function BetControls({
  anchor = 100,
  spreadNum = 4,
  lastBet = 0,
  growthCapBps = 3300,
  tableMin = 1,
  tableMax = 10000,
}: BetControlsProps) {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  const {
    phase,
    phaseDetail,
    chipsAtTable,
    tokenInPlay,
    selectedToken,
    handDealt,
    handId,
    playerHand,
    wager,
    wagerStep,
    lastWager,
    showReDealPrompt,
    setWager,
    setWagerStep,
    setLastWager,
    setChipsAtTable,
    setGameState,
    closeReDealPrompt,
    resetHand,
    endHand,
    cashOut,
    updateChipsAfterHand,
    setBettingParams,
  } = useStore()

  // Check if action buttons should be shown
  const canShowActions = shouldShowActionButtons(phase)
  const canDeal = shouldShowDealButton(phase)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize wager to 10% of chipsAtTable on first visit when chipsAtTable is set
  // Only initialize if wager is 0 or greater than chipsAtTable (stale value)
  // and we're not in an active hand
  useEffect(() => {
    if (
      chipsAtTable > 0 &&
      (wager === 0 || wager > chipsAtTable) &&
      (phase === 'WAITING_FOR_DEAL' || phase === 'COMPLETE')
    ) {
      const defaultWager = Math.ceil(chipsAtTable * 0.10)
      if (defaultWager > 0 && defaultWager <= chipsAtTable) {
        setWager(defaultWager)
      }
    }
  }, [chipsAtTable, wager, phase, setWager])

  // Token selection is now handled on /checkin page only
  // Use selectedToken from store (set during check-in)

  // Helper: Round to step
  const roundToStep = (value: number, stepVal: number) => {
    return Math.round(value / stepVal) * stepVal
  }

  const applyWager = useCallback(
    (value: number) => {
      const numeric = Number.isFinite(value) ? value : 0
      const positive = Math.max(0, numeric)
      const capped = Math.min(positive, chipsAtTable || 0)
      setWager(capped)
    },
    [chipsAtTable, setWager]
  )

  // ========================================================================
  // PHASE 2: Deal Handler - Starts a new hand with animated card dealing
  // ========================================================================
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

    setIsLoading(true)

    try {
      const response = await placeBet({
        amount: wager,
        token: selectedToken || tokenInPlay || 'ETH',
      })

      if (!response) {
        toast.error('Deal failed: No response from server')
        return
      }

      if (response.handId) {
        // Deduct wager from chipsAtTable after successful deal
        setChipsAtTable(chipsAtTable - wager)
        // Animate card dealing: show cards one at a time with 3.33 second delays
        const CARD_DEAL_DELAY = 3333 // 3.33 seconds in milliseconds

        // Check if hand was auto-resolved (blackjack detected)
        const isAutoResolved = response.phase === 'RESOLUTION' || response.phase === 'COMPLETE'

        if (isAutoResolved) {
          // Blackjack detected - show both cards immediately and resolve
          setGameState({
            dealerHand: response.dealerHand || [],
            playerHand: response.playerHand || [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: response.phaseDetail,
          })

          // Auto-handle the outcome
          if (response.phase === 'RESOLUTION' || response.phase === 'COMPLETE') {
            // Wait a moment then show the resolved message
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Automatically end the hand and show the re-deal prompt
            // The outcome calculation is done by the backend
            endHand()
            toast.success('Blackjack! Hand automatically resolved ✅')
          }
        } else {
          // Normal deal animation
          // Start with empty hands
          setGameState({
            dealerHand: [],
            playerHand: [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: 'Dealing cards...',
          })

          // Wait a moment before starting the deal animation
          await new Promise(resolve => setTimeout(resolve, 500))

          // Deal Dealer's first card (face down - back.png)
          setGameState({
            dealerHand: ['/cards/back.png'],
            playerHand: [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: 'Dealing cards...',
          })

          // Wait before dealing Player's first card
          await new Promise(resolve => setTimeout(resolve, CARD_DEAL_DELAY))

          // Deal Player's first card
          setGameState({
            dealerHand: ['/cards/back.png'],
            playerHand: response.playerHand?.slice(0, 1) || [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: 'Dealing cards...',
          })

          // Wait before dealing Dealer's second card
          await new Promise(resolve => setTimeout(resolve, CARD_DEAL_DELAY))

          // Deal Dealer's second card (face down - back.png)
          setGameState({
            dealerHand: ['/cards/back.png', '/cards/back.png'],
            playerHand: response.playerHand?.slice(0, 1) || [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: 'Dealing cards...',
          })

          // Wait before dealing Player's second card
          await new Promise(resolve => setTimeout(resolve, CARD_DEAL_DELAY))

          // Deal Player's second card and complete the deal
          setGameState({
            dealerHand: ['/cards/back.png', '/cards/back.png'],
            playerHand: response.playerHand || [],
            handId: response.handId,
            phase: response.phase,
            phaseDetail: response.phaseDetail,
          })

          toast.success('Cards dealt ✅')
        }

        // Update lastBet for betting limits
        setBettingParams({ lastBet: wager })

        // Persist wager for next hand
        setLastWager(wager)
      } else {
        toast.error('Deal failed: Invalid response from server')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ========================================================================
  // PHASE 2: Game Action Handlers (Hit, Stand, Double, Split)
  // ========================================================================

  const updateChipsAndNotify = (outcome?: string, payout?: string, isDouble: boolean = false) => {
    if (outcome && payout) {
      const payoutAmount = parseFloat(payout)
      const wagerLost = isDouble ? wager * 2 : wager
      updateChipsAfterHand(payoutAmount, wagerLost, outcome)
      toast.success(`${outcome.toUpperCase()}! ${outcome === 'win' ? `Payout: ${payout}` : ''}`)
    }
  }

  const handleHit = async () => {
    if (!handId || handId <= 0) {
      toast.error('No active hand')
      return
    }

    setIsLoading(true)
    try {
      const response = await playerHit(handId)

      if (!response) {
        toast.error('Hit failed: No response from server')
        return
      }

      if (response.dealerHand && response.playerHand) {
        setGameState({
          dealerHand: response.dealerHand,
          playerHand: response.playerHand,
          handId: response.handId,
          phase: response.phase,
          phaseDetail: response.phaseDetail,
          outcome: response.outcome,
          payout: response.payout,
        })
      }

      if (response.message) {
        toast.success(response.message)
      }

      if (response.phase === 'COMPLETE') {
        updateChipsAndNotify(response.outcome, response.payout)
        endHand()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStand = async () => {
    if (!handId || handId <= 0) {
      toast.error('No active hand')
      return
    }

    setIsLoading(true)
    try {
      const response = await playerStand(handId)

      if (!response) {
        toast.error('Stand failed: No response from server')
        return
      }

      if (response.dealerHand && response.playerHand) {
        setGameState({
          dealerHand: response.dealerHand,
          playerHand: response.playerHand,
          handId: response.handId,
          phase: response.phase,
          phaseDetail: response.phaseDetail,
          outcome: response.outcome,
          payout: response.payout,
        })
      }

      updateChipsAndNotify(response.outcome, response.payout)
      endHand()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSplit = async () => {
    if (!handId || handId <= 0) {
      toast.error('No active hand')
      return
    }

    setIsLoading(true)
    try {
      const response = await playerSplit(handId)

      if (!response) {
        toast.error('Split failed: No response from server')
        return
      }

      if (response.dealerHand && response.playerHand) {
        setGameState({
          dealerHand: response.dealerHand,
          playerHand: response.playerHand,
          handId: response.handId,
          phase: response.phase,
          phaseDetail: response.phaseDetail,
          outcome: response.outcome,
          payout: response.payout,
        })
      }

      if (response.message) {
        toast.success(response.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDouble = async () => {
    if (!handId || handId <= 0) {
      toast.error('No active hand')
      return
    }

    setIsLoading(true)
    try {
      const response = await playerDouble(handId)

      if (!response) {
        toast.error('Double failed: No response from server')
        return
      }

      if (response.dealerHand && response.playerHand) {
        setGameState({
          dealerHand: response.dealerHand,
          playerHand: response.playerHand,
          handId: response.handId,
          phase: response.phase,
          phaseDetail: response.phaseDetail,
          outcome: response.outcome,
          payout: response.payout,
        })
      }

      updateChipsAndNotify(response.outcome, response.payout, true)
      endHand()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCashOut = async () => {
    setIsLoading(true)
    try {
      cashOut()
      toast.success(`Cashed out ${chipsAtTable?.toFixed(6)} ${tokenInPlay}`)
      // Note: Should navigate to /checkin on frontend route
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cash out failed'
      toast.error(`Cash out failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReDeal = async (amount: number) => {
    closeReDealPrompt()
    resetHand()
    setWager(amount)
  }

  const handleDeclineReDeal = () => {
    closeReDealPrompt()
    resetHand()
  }

  // Render placeholder during SSR
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-400 text-center">
          Loading...
        </div>
      </div>
    )
  }

  // ========================================================================
  // PHASE 2: Game in progress - show action buttons
  // ========================================================================
  // Only render when chipsAtTable exists and is > 0
  // When chipsAtTable is 0, the /play page shows a Check In button instead
  if (chipsAtTable && chipsAtTable > 0) {
    return (
      <>
        <ReDealPrompt
          isOpen={showReDealPrompt}
          lastWager={lastWager}
          token={selectedToken || tokenInPlay || 'ETH'}
          onAccept={handleReDeal}
          onDecline={handleDeclineReDeal}
        />

        <div className="space-y-4">
          {/* Wager Control */}
          <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-xl space-y-3">
            <div className="text-sm text-neutral-400 font-medium">Current Wager</div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="decrease wager"
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
                onClick={() => applyWager(Math.max(0, roundToStep(wager - wagerStep, wagerStep)))}
                disabled={isLoading || handDealt}
              >
                −
              </button>

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

              <button
                type="button"
                aria-label="increase wager"
                className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
                onClick={() => applyWager(Math.min(roundToStep(wager + wagerStep, wagerStep), chipsAtTable))}
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
          </div>

          {/* Phase Status */}
          {phaseDetail && (
            <div className="p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-sm text-neutral-300 text-center">
              {phaseDetail}
            </div>
          )}

          {/* Deal Button - Always visible, disabled when appropriate */}
          <button
            type="button"
            disabled={
              !isConnected ||
              chipsAtTable <= 0 ||
              wager <= 0 ||
              wager > chipsAtTable ||
              !canDeal ||
              isLoading
            }
            onClick={handleDeal}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-bold text-lg transition"
          >
            {isLoading ? '⏳ Dealing…' : '🃏 Deal'}
          </button>

          {/* Game In Progress Message */}
          {!canDeal && (
            <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg text-sm text-green-100 text-center">
              Hand in progress - use action buttons below to play
            </div>
          )}

          {/* Game action buttons - only show when phase is PLAYER_TURN */}
          {canShowActions && (
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleHit}
                disabled={!canShowActions || isLoading}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  canShowActions && !isLoading
                    ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? '...' : 'Hit'}
              </button>

              <button
                onClick={handleStand}
                disabled={!canShowActions || isLoading}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  canShowActions && !isLoading
                    ? 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? '...' : 'Stand'}
              </button>

              <button
                onClick={handleSplit}
                disabled={!canShowActions || playerHand.length !== 2 || isLoading}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  canShowActions && playerHand.length === 2 && !isLoading
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? '...' : 'Split'}
              </button>

              <button
                onClick={handleDouble}
                disabled={!canShowActions || playerHand.length !== 2 || isLoading}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                  canShowActions && playerHand.length === 2 && !isLoading
                    ? 'bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? '...' : 'Double'}
              </button>
            </div>
          )}

          {/* Cash Out button - always available */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCashOut}
              disabled={isLoading}
              className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-900 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold transition"
            >
              {isLoading ? '...' : 'Cash Out'}
            </button>
          </div>
        </div>
      </>
    )
  }

  // ========================================================================
  // PHASE 1: No chips at table - Check In handled on /play page
  // ========================================================================
  // When chipsAtTable is 0 or missing, the /play page shows a Check In button
  // BetControls should not render the mini check-in form anymore
  // Return null to let /play page handle the Check In UI
  return null
}
