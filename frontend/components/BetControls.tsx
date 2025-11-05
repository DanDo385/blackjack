'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useBalance } from 'wagmi'
import { showTokensBroughtToTableAlert } from '@/lib/alerts'
import { useStore } from '@/lib/store'
import { placeBet, playerHit, playerStand, playerDouble, playerSplit } from '@/lib/api'
import { shouldShowActionButtons, shouldShowDealButton } from '@/lib/types'
import ReDealPrompt from './ReDealPrompt'

/**
 * BetControls Component - UNIFIED Betting & Game Actions
 *
 * This consolidated component handles ALL betting and game action phases:
 *
 * PHASE 1: Betting Interface (before chips at table)
 * - Multi-token wallet support (USDC, ETH, wETH, wBTC, USDT)
 * - 5% bankroll cap enforcement
 * - Game rules enforcement (min/max, growth cap)
 * - "Bring to Table" button commits chips
 *
 * PHASE 2: Deal & Play (after chips at table)
 * - Deal button (when phase allows dealing)
 * - Hit/Stand/Double/Split buttons (during PLAYER_TURN phase)
 * - Cash Out button (always available)
 * - Wager control between hands
 * - Re-deal prompt handling
 *
 * Rules:
 * - Max bet = min(wallet * 5%, game max, growth cap)
 * - Min bet = max(table min, anchor / spread)
 * - Growth cap: max increase vs last bet
 */

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const
const WBTC_ADDRESS = '0x053ba9b206e4fb2d196a13f7b5b0a186c0469605' as const
const USDT_ADDRESS = '0xfde4c96c1286fba3ac151be17a5c5f2db85cbe72' as const

const TOKENS = [
  { symbol: 'USDC', address: USDC_ADDRESS, decimals: 6 },
  { symbol: 'ETH', address: undefined, decimals: 18 },
  { symbol: 'wETH', address: WETH_ADDRESS, decimals: 18 },
  { symbol: 'wBTC', address: WBTC_ADDRESS, decimals: 8 },
  { symbol: 'USDT', address: USDT_ADDRESS, decimals: 6 },
] as const

type TokenSymbol = typeof TOKENS[number]['symbol']

const BANKROLL_CAP_PCT = 0.05 // 5% max per hand

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
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC')
  const [isLoading, setIsLoading] = useState(false)

  const {
    phase,
    phaseDetail,
    chipsAtTable,
    tokenInPlay,
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

  // Fetch balances for all tokens
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  })
  const { data: ethBalance } = useBalance({
    address,
  })
  const { data: wethBalance } = useBalance({
    address,
    token: WETH_ADDRESS,
  })
  const { data: wbtcBalance } = useBalance({
    address,
    token: WBTC_ADDRESS,
  })
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
  })

  const tokenBalances = useMemo(
    () => ({
      USDC: usdcBalance,
      ETH: ethBalance,
      wETH: wethBalance,
      wBTC: wbtcBalance,
      USDT: usdtBalance,
    }),
    [usdcBalance, ethBalance, wethBalance, wbtcBalance, usdtBalance]
  )

  const selectedBalance = tokenBalances[selectedToken]

  // Calculate max bet based on rules
  const maxBetByRules = useMemo(() => {
    const baseMin = Math.max(anchor / spreadNum, tableMin)
    const baseMax = Math.min(anchor * spreadNum, tableMax)
    const growthMax = lastBet ? lastBet * (1 + growthCapBps / 10000) : baseMax
    const gameMax = Math.min(baseMax, growthMax)

    const walletBalance = selectedBalance
      ? parseFloat(selectedBalance.value.toString()) / Math.pow(10, selectedBalance.decimals)
      : 0
    const bankrollMax = Math.floor(walletBalance * BANKROLL_CAP_PCT)

    return {
      baseMin: Math.max(baseMin, 1),
      gameMax,
      bankrollMax,
      effective: Math.min(gameMax, bankrollMax),
      walletBalance,
    }
  }, [anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax, selectedBalance])

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
  // PHASE 1: Bring to Table Handler
  // ========================================================================
  const handleBringToTable = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (wager <= 0) {
      toast.error('Please enter a valid wager amount')
      return
    }

    setIsLoading(true)

    try {
      // Update store with chips at table
      setChipsAtTable(wager)

      // Update token in play via game state
      setGameState({
        playerHand: [],
        dealerHand: [],
      })

      // Persist lastWager for next deal
      setLastWager(wager)

      // Show success alert
      showTokensBroughtToTableAlert({
        amount: wager,
        token: selectedToken,
      })

      toast.success('Chips brought to table ✅')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bring chips'
      toast.error(`Failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

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
        token: selectedToken,
      })

      if (!response) {
        toast.error('Deal failed: No response from server')
        return
      }

      if (response.handId) {
        // Animate card dealing: show cards one at a time with 3.33 second delays
        const CARD_DEAL_DELAY = 3333 // 3.33 seconds in milliseconds

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

        // Update lastBet for betting limits
        setBettingParams({ lastBet: wager })

        // Persist wager for next hand
        setLastWager(wager)

        toast.success('Cards dealt ✅')
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
  if (chipsAtTable && chipsAtTable > 0) {
    return (
      <>
        <ReDealPrompt
          isOpen={showReDealPrompt}
          lastWager={lastWager}
          token={selectedToken}
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

          {/* Deal Button - Only show when phase allows */}
          {canDeal && (
            <button
              type="button"
              disabled={!isConnected || wager <= 0 || wager > chipsAtTable || isLoading}
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
  // PHASE 1: Show betting interface - no chips at table yet
  // ========================================================================

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-amber-900/30 border border-amber-600 rounded-lg text-sm text-amber-100">
          ⚠️ Connect your wallet to place bets
        </div>
      </div>
    )
  }

  return (
    <>
      <ReDealPrompt
        isOpen={showReDealPrompt}
        lastWager={lastWager}
        token={selectedToken}
        onAccept={handleReDeal}
        onDecline={handleDeclineReDeal}
      />

      <div className="space-y-4">
        {/* Wager Controls Row */}
        <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-700 rounded-lg flex-wrap">
          <span className="text-sm text-neutral-400 font-medium">Wager</span>

          <button
            type="button"
            aria-label="decrease wager"
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
            onClick={() => setWager(Math.max(0, roundToStep(wager - wagerStep, wagerStep)))}
            disabled={isLoading}
          >
            –
          </button>

          <input
            type="number"
            inputMode="decimal"
            className="w-28 px-3 py-2 rounded-xl bg-black border border-neutral-600 text-white font-mono focus:border-neutral-400 transition disabled:opacity-50"
            value={String(wager)}
            onChange={(e) => {
              const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
              setWager(Number.isFinite(v) ? v : 0)
            }}
            disabled={isLoading}
          />

          <button
            type="button"
            aria-label="increase wager"
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
            onClick={() => setWager(roundToStep(wager + wagerStep, wagerStep))}
            disabled={isLoading}
          >
            +
          </button>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-neutral-400">Step</span>
            <input
              type="number"
              inputMode="decimal"
              className="w-20 px-3 py-2 rounded-xl bg-black border border-neutral-600 text-white font-mono focus:border-neutral-400 transition disabled:opacity-50"
              value={String(wagerStep)}
              onChange={(e) => {
                const s = Number(e.target.value.replace(/[^0-9.]/g, '')) || 1
                setWagerStep(Math.max(0.0001, s))
              }}
              title="Increment for +/- buttons"
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            className="ml-auto bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-2 rounded-2xl font-semibold transition"
            disabled={!wager || wager <= 0 || isLoading}
            onClick={handleBringToTable}
          >
            {isLoading ? 'Processing…' : 'Bring to Table'}
          </button>
        </div>

        {/* Multi-token balance display */}
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm space-y-2">
          <div className="font-semibold text-neutral-300 mb-2">Your Balances</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">ETH</span>
              <span className="font-mono text-white">
                {(ethBalance ? parseFloat(ethBalance.value.toString()) / Math.pow(10, ethBalance.decimals) : 0).toFixed(4)}{' '}
                ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">wETH</span>
              <span className="font-mono text-white">
                {(wethBalance ? parseFloat(wethBalance.value.toString()) / Math.pow(10, wethBalance.decimals) : 0).toFixed(4)}{' '}
                wETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">wBTC</span>
              <span className="font-mono text-white">
                {(wbtcBalance ? parseFloat(wbtcBalance.value.toString()) / Math.pow(10, wbtcBalance.decimals) : 0).toFixed(6)}{' '}
                wBTC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">USDC</span>
              <span className="font-mono text-white">
                {(usdcBalance ? parseFloat(usdcBalance.value.toString()) / Math.pow(10, usdcBalance.decimals) : 0).toFixed(2)}{' '}
                USDC
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">USDT</span>
              <span className="font-mono text-white">
                {(usdtBalance ? parseFloat(usdtBalance.value.toString()) / Math.pow(10, usdtBalance.decimals) : 0).toFixed(2)}{' '}
                USDT
              </span>
            </div>
          </div>
        </div>

        {/* Wager token selector and max bet info */}
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg space-y-2">
          <label className="text-sm font-medium text-white block">Wager Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
            className="w-full border border-neutral-600 bg-black text-white rounded-lg px-3 py-2 text-sm font-medium focus:border-neutral-400 transition"
          >
            {TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>

          <div className="text-xs space-y-1 pt-2 border-t border-neutral-700">
            <div className="flex justify-between text-neutral-400">
              <span>Max per hand (5% cap)</span>
              <span className="font-mono text-white">
                {maxBetByRules.bankrollMax.toFixed(6)} {selectedToken}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
