'use client'
import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useBalance } from 'wagmi'
import { showTokensBroughtToTableAlert } from '@/lib/alerts'
import { useStore } from '@/lib/store'
import { postJSON } from '@/lib/api'
import GameActions from './GameActions'

/**
 * BetControls Component
 *
 * Smart betting interface that:
 * - Respects wallet balance (multiple tokens)
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
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006' as const
const WBTC_ADDRESS = '0x053ba9b206e4fb2d196a13f7b5b0a186c0469605' as const
const USDT_ADDRESS = '0xfde4c96c1286fba3ac151be17a5c5f2db85cbe72' as const

const TOKENS = [
  { symbol: 'USDC', address: USDC_ADDRESS, decimals: 6 },
  { symbol: 'ETH', address: undefined, decimals: 18 }, // Native
  { symbol: 'wETH', address: WETH_ADDRESS, decimals: 18 },
  { symbol: 'wBTC', address: WBTC_ADDRESS, decimals: 8 },
  { symbol: 'USDT', address: USDT_ADDRESS, decimals: 6 },
] as const

type TokenSymbol = typeof TOKENS[number]['symbol']

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
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const [inputValue, setInputValue] = useState<string>('')
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC')
  const { tokensInPlay, gameActive } = useStore()

  // Prevent hydration mismatch with wallet hooks
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

  const tokenBalances = useMemo(() => ({
    USDC: usdcBalance,
    ETH: ethBalance,
    wETH: wethBalance,
    wBTC: wbtcBalance,
    USDT: usdtBalance,
  }), [usdcBalance, ethBalance, wethBalance, wbtcBalance, usdtBalance])

  const selectedBalance = tokenBalances[selectedToken]

  // Calculate max bet based on rules
  const maxBetByRules = useMemo(() => {
    // Game rules
    const baseMin = Math.max(anchor / spreadNum, tableMin)
    const baseMax = Math.min(anchor * spreadNum, tableMax)
    const growthMax = lastBet ? lastBet * (1 + growthCapBps / 10000) : baseMax
    const gameMax = Math.min(baseMax, growthMax)

    // Wallet balance rule
    const walletBalance = selectedBalance ? Number(selectedBalance.formatted) : 0
    const bankrollMax = Math.floor(walletBalance * BANKROLL_CAP_PCT)

    // Final max is the minimum of all constraints
    return {
      baseMin: Math.max(baseMin, 1),
      gameMax,
      bankrollMax,
      effective: Math.min(gameMax, bankrollMax),
      walletBalance,
    }
  }, [anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax, selectedBalance])

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
  const isDramaticWager = betAmount >= maxBetByRules.walletBalance * DRAMATIC_WAGER_PCT
  const isValid =
    isConnected &&
    inputValue !== '' &&
    betAmount > 0 &&
    betAmount <= maxBetByRules.effective

  // Suggest max bet button
  const handleSuggestMax = () => {
    setInputValue(maxBetByRules.effective.toString())
  }

  // Place bet handler - Phase 1: Bring tokens to table
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
      toast(`Dramatic wager: ${finalBet} ${selectedToken} (≥ 50% bankroll) 🔥`, {
        icon: '🎭',
        duration: 4000,
      })
    }

    try {
      // Call backend to bring tokens to table
      const response = await postJSON<{
        handId?: number
        dealerHand?: string[]
        playerHand?: string[]
        message?: string
      }>('/api/engine/bet', {
        amount: finalBet,
        token: selectedToken,
      })

      // Update store with tokens in play
      useStore.getState().setTokensInPlay(finalBet, selectedToken)

      // Update store with last bet
      useStore.setState({ lastBet: finalBet })

      // Show success alert
      showTokensBroughtToTableAlert({
        amount: finalBet,
        token: selectedToken,
      })

      // Start game by dealing cards
      if (response.handId) {
        useStore.getState().setGameState(
          response.dealerHand || [],
          response.playerHand || [],
          response.handId
        )
      }

      // Reset input
      setInputValue('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Bet failed: ${message}`)
    }
  }

  // Render placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-neutral-400 text-center">
          Loading...
        </div>
      </div>
    )
  }

  // Phase 2: Show game actions if tokens are in play
  if (gameActive && tokensInPlay > 0) {
    return <GameActions />
  }

  // Phase 1: Show betting interface
  return (
    <div className="space-y-4">
      {/* Wallet Status */}
      {!isConnected ? (
        <div className="p-3 bg-amber-900/30 border border-amber-600 rounded-lg text-sm text-amber-100">
          ⚠️ Connect your wallet to place bets
        </div>
      ) : (
        <>
          {/* Multi-token balance display */}
          <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-sm space-y-2">
            <div className="font-semibold text-neutral-300 mb-2">Your Balances</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">ETH</span>
                <span className="font-mono text-white">
                  {(ethBalance ? Number(ethBalance.formatted) : 0).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">wETH</span>
                <span className="font-mono text-white">
                  {(wethBalance ? Number(wethBalance.formatted) : 0).toFixed(4)} wETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">wBTC</span>
                <span className="font-mono text-white">
                  {(wbtcBalance ? Number(wbtcBalance.formatted) : 0).toFixed(6)} wBTC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">USDC</span>
                <span className="font-mono text-white">
                  {(usdcBalance ? Number(usdcBalance.formatted) : 0).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">USDT</span>
                <span className="font-mono text-white">
                  {(usdtBalance ? Number(usdtBalance.formatted) : 0).toFixed(2)} USDT
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
        </>
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
                ⚠️ Bet exceeds bankroll limit ({maxBetByRules.effective} {selectedToken} max)
              </div>
            )}
            {isDramaticWager && !isInsufficientBalance && (
              <div className="text-amber-400">
                🔥 Dramatic wager: {betAmount} ≥ 50% of your bankroll
              </div>
            )}
            {!isInsufficientBalance && clampedBet !== betAmount && betAmount > 0 && (
              <div className="text-blue-400">
                ℹ️ Auto-adjust: {betAmount} → {clampedBet} {selectedToken}
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


