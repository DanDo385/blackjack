'use client'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useBalance } from 'wagmi'
import { showTokensBroughtToTableAlert } from '@/lib/alerts'
import { useStore } from '@/lib/store'
import { postJSON } from '@/lib/api'

/**
 * BetControls Component
 *
 * Smart betting interface that:
 * - Respects wallet balance (USDC)
 * - Enforces 5% bankroll cap
 * - Enforces game rules (min/max, growth cap)
 * - Warns on dramatic wagers
 *
 * Rules:
 * - Max bet = min(wallet * 5%, game max, growth cap)
 * - Min bet = max(table min, anchor / spread)
 * - Growth cap: max 33% (Standard) or 40% (Premier) vs last bet
 */

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const BANKROLL_CAP_PCT = 0.05 // 5% max per hand
const DRAMATIC_WAGER_PCT = 0.5 // Warn if >= 50% of bankroll

interface BetControlsProps {
  anchor: number
  spreadNum: number
  lastBet: number
  growthCapBps: number
  tableMin: number
  tableMax: number
}

export default function BetControls({
  anchor,
  spreadNum,
  lastBet,
  growthCapBps,
  tableMin,
  tableMax,
}: BetControlsProps) {
  const { address, isConnected } = useAccount()
  const [inputValue, setInputValue] = useState<string>('')

  // Fetch USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  })

  // Calculate max bet based on rules
  const maxBetByRules = useMemo(() => {
    // Game rules
    const baseMin = Math.max(anchor / spreadNum, tableMin)
    const baseMax = Math.min(anchor * spreadNum, tableMax)
    const growthMax = lastBet ? lastBet * (1 + growthCapBps / 10000) : baseMax
    const gameMax = Math.min(baseMax, growthMax)

    // Wallet balance rule
    const walletUSDC = usdcBalance ? Number(usdcBalance.formatted) : 0
    const bankrollMax = Math.floor(walletUSDC * BANKROLL_CAP_PCT)

    // Final max is the minimum of all constraints
    return {
      baseMin: Math.max(baseMin, 1),
      gameMax,
      bankrollMax,
      effective: Math.min(gameMax, bankrollMax),
      walletUSDC,
    }
  }, [anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax, usdcBalance])

  const step = Math.max(1, Math.round(anchor * 0.05))

  // Parse user input
  const betAmount = inputValue === '' ? 0 : Number(inputValue)

  // Clamp bet to valid range
  const clampedBet = Math.max(
    maxBetByRules.baseMin,
    Math.min(maxBetByRules.effective, betAmount)
  )

  // Validation checks
  const isConnectedWarning = !isConnected
  const isInsufficientBalance = betAmount > maxBetByRules.effective && betAmount > 0
  const isDramaticWager = betAmount >= maxBetByRules.walletUSDC * DRAMATIC_WAGER_PCT
  const isValid =
    isConnected &&
    inputValue !== '' &&
    betAmount > 0 &&
    betAmount <= maxBetByRules.effective

  // Suggest max bet button
  const handleSuggestMax = () => {
    setInputValue(maxBetByRules.effective.toString())
  }

  // Place bet handler
  const handlePlaceBet = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (inputValue === '') {
      toast.error('Please enter a bet amount')
      return
    }

    const finalBet = clampedBet

    // Warn if auto-adjusted
    if (finalBet !== betAmount) {
      toast('Bet auto-adjusted to legal size', { icon: '⚠️' })
    }

    // Warn if dramatic wager
    if (isDramaticWager) {
      toast(`Dramatic wager: ${finalBet} USDC (≥ 50% bankroll) 🔥`, {
        icon: '🎭',
        duration: 4000,
      })
    }

    try {
      await postJSON('/api/engine/bet', {
        amount: finalBet,
        token: 'USDC',
      })

      // Show success alert
      showTokensBroughtToTableAlert({
        amount: finalBet,
        token: 'USDC',
      })

      // Update store with last bet
      useStore.setState({ lastBet: finalBet })

      // Reset input
      setInputValue('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Bet failed: ${message}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Wallet Status */}
      {!isConnected ? (
        <div className="p-3 bg-amber-900/30 border border-amber-600 rounded-lg text-sm text-amber-100">
          ⚠️ Connect your wallet to place bets
        </div>
      ) : (
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-400">USDC Balance</span>
            <span className="font-mono text-white">
              {maxBetByRules.walletUSDC.toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Max per hand (5% cap)</span>
            <span className="font-mono text-white">
              {maxBetByRules.bankrollMax.toFixed(0)} USDC
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Game rules limit</span>
            <span className="font-mono text-white">{maxBetByRules.gameMax.toFixed(0)} USDC</span>
          </div>
        </div>
      )}

      {/* Bet Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Bet Amount</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isConnected
                ? `Min: ${maxBetByRules.baseMin} • Max: ${maxBetByRules.effective}`
                : 'Connect wallet'
            }
            disabled={!isConnected}
            step={step}
            min={0}
            className={`flex-1 border rounded-lg px-3 py-2 font-mono ${
              isConnected
                ? 'bg-black text-white border-neutral-600 focus:border-neutral-400'
                : 'bg-neutral-900 text-neutral-500 border-neutral-700 cursor-not-allowed'
            }`}
          />
          <button
            onClick={handleSuggestMax}
            disabled={!isConnected}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isConnected
                ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Max
          </button>
        </div>

        {/* Validation Messages */}
        {inputValue !== '' && (
          <div className="text-xs space-y-1">
            {isInsufficientBalance && (
              <div className="text-red-400">
                ⚠️ Bet exceeds bankroll limit ({maxBetByRules.effective} USDC max)
              </div>
            )}
            {isDramaticWager && !isInsufficientBalance && (
              <div className="text-amber-400">
                🔥 Dramatic wager: {betAmount} ≥ 50% of your bankroll
              </div>
            )}
            {!isInsufficientBalance && clampedBet !== betAmount && betAmount > 0 && (
              <div className="text-blue-400">
                ℹ️ Auto-adjust: {betAmount} → {clampedBet} USDC
              </div>
            )}
            {isValid && !isDramaticWager && (
              <div className="text-green-400">✓ Valid bet</div>
            )}
          </div>
        )}
      </div>

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={!isValid}
        className={`w-full px-4 py-3 rounded-xl font-semibold transition ${
          isValid
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
        }`}
      >
        {!isConnected ? 'Connect Wallet' : 'Place Bet'}
      </button>
    </div>
  )
}


