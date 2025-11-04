'use client'
import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useBalance } from 'wagmi'
import { showTokensBroughtToTableAlert } from '@/lib/alerts'
import { useStore } from '@/lib/store'
import { postJSON } from '@/lib/api'
import GameActions from './GameActions'
import ReDealPrompt from './ReDealPrompt'

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
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC')
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    tokensInPlay,
    tokenInPlay,
    gameActive,
    wager,
    wagerStep,
    lastWager,
    showReDealPrompt,
    handDealt,
    setWager,
    setWagerStep,
    setLastWager,
    setTokensInPlay,
    setGameState,
    closeReDealPrompt,
    resetHand
  } = useStore()

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
    const walletBalance = selectedBalance ? parseFloat(selectedBalance.value.toString()) / Math.pow(10, selectedBalance.decimals) : 0
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

  // Helper: Round to step
  const roundToStep = (value: number, stepVal: number) => {
    return Math.round(value / stepVal) * stepVal
  }

  // Bring to table handler - commits tokens to the table
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
      // Update store with tokens in play
      setTokensInPlay(wager, selectedToken)

      // Persist lastWager for next deal
      setLastWager(wager)

      // Show success alert
      showTokensBroughtToTableAlert({
        amount: wager,
        token: selectedToken,
      })

      toast.success('Tokens brought to table ✅')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bring tokens'
      toast.error(`Failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Deal handler - deals cards for active game
  const handleDeal = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (tokensInPlay <= 0) {
      toast.error('No tokens at table')
      return
    }

    setIsLoading(true)

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
      setIsLoading(false)
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

  // Re-deal handler - called when user accepts re-deal prompt
  const handleReDeal = async (amount: number) => {
    closeReDealPrompt()
    resetHand() // Reset hand state
    // Set wager to last amount
    setWager(amount)
    // Tokens are already at the table, just need to deal
  }

  // Decline re-deal - keep lastWager as default
  const handleDeclineReDeal = () => {
    closeReDealPrompt()
    resetHand() // Reset hand state
    // lastWager is already persisted, do nothing
  }

  // Phase 2: Show game actions if tokens are in play
  if (gameActive && tokensInPlay > 0) {
    return (
      <>
        <ReDealPrompt
          isOpen={showReDealPrompt}
          lastWager={lastWager}
          token={selectedToken}
          onAccept={handleReDeal}
          onDecline={handleDeclineReDeal}
        />
        <GameActions />
      </>
    )
  }

  // Phase 1: Show betting interface with wager controls
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

        {/* Decrease button */}
        <button
          type="button"
          aria-label="decrease wager"
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
          onClick={() => setWager(Math.max(0, roundToStep(wager - wagerStep, wagerStep)))}
          disabled={!isConnected || isLoading}
        >
          –
        </button>

        {/* Wager amount input */}
        <input
          type="number"
          inputMode="decimal"
          className="w-28 px-3 py-2 rounded-xl bg-black border border-neutral-600 text-white font-mono focus:border-neutral-400 transition disabled:opacity-50"
          value={String(wager)}
          onChange={(e) => {
            const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
            setWager(Number.isFinite(v) ? v : 0)
          }}
          disabled={!isConnected || isLoading}
        />

        {/* Increase button */}
        <button
          type="button"
          aria-label="increase wager"
          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
          onClick={() => setWager(roundToStep(wager + wagerStep, wagerStep))}
          disabled={!isConnected || isLoading}
        >
          +
        </button>

        {/* Step input */}
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
            disabled={!isConnected || isLoading}
          />
        </div>

        {/* Bring to Table button */}
        <button
          type="button"
          className="ml-auto bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-2 rounded-2xl font-semibold transition"
          disabled={!isConnected || !wager || wager <= 0 || isLoading}
          onClick={handleBringToTable}
        >
          {isLoading ? 'Processing…' : 'Bring to Table'}
        </button>
      </div>

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
                  {(ethBalance ? parseFloat(ethBalance.value.toString()) / Math.pow(10, ethBalance.decimals) : 0).toFixed(4)} ETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">wETH</span>
                <span className="font-mono text-white">
                  {(wethBalance ? parseFloat(wethBalance.value.toString()) / Math.pow(10, wethBalance.decimals) : 0).toFixed(4)} wETH
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">wBTC</span>
                <span className="font-mono text-white">
                  {(wbtcBalance ? parseFloat(wbtcBalance.value.toString()) / Math.pow(10, wbtcBalance.decimals) : 0).toFixed(6)} wBTC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">USDC</span>
                <span className="font-mono text-white">
                  {(usdcBalance ? parseFloat(usdcBalance.value.toString()) / Math.pow(10, usdcBalance.decimals) : 0).toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">USDT</span>
                <span className="font-mono text-white">
                  {(usdtBalance ? parseFloat(usdtBalance.value.toString()) / Math.pow(10, usdtBalance.decimals) : 0).toFixed(2)} USDT
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
    </div>
    </>
  )
}


