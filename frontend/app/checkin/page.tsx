'use client'
import Navbar from '@/components/Navbar'
import { AlertBus } from '@/components/AlertBus'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAccount, useBalance } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { showTokensBroughtToTableAlert } from '@/lib/alerts'

/**
 * CheckIn Page - Wallet connection and token/wager selection
 *
 * Flow:
 * 1. Connect wallet
 * 2. Select token to wager
 * 3. Set wager amount (5% bankroll cap enforced)
 * 4. "Bring to Table" button navigates to /play
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

export default function CheckIn() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC')
  const [wager, setWager] = useState(0)
  const [wagerStep, setWagerStep] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  const { setTokensInPlay, setLastWager, setGameState } = useStore()

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

  const tokenBalances = useMemo(() => ({
    USDC: usdcBalance,
    ETH: ethBalance,
    wETH: wethBalance,
    wBTC: wbtcBalance,
    USDT: usdtBalance,
  }), [usdcBalance, ethBalance, wethBalance, wbtcBalance, usdtBalance])

  const selectedBalance = tokenBalances[selectedToken]

  // Calculate max bet based on wallet balance
  const maxBet = useMemo(() => {
    const walletBalance = selectedBalance
      ? parseFloat(selectedBalance.value.toString()) / Math.pow(10, selectedBalance.decimals)
      : 0
    const bankrollMax = Math.floor(walletBalance * BANKROLL_CAP_PCT)
    return Math.max(bankrollMax, 1)
  }, [selectedBalance])

  // Helper: Round to step
  const roundToStep = (value: number, stepVal: number) => {
    return Math.round(value / stepVal) * stepVal
  }

  // Bring to Table and navigate to play
  const handleBringToTable = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (wager <= 0) {
      toast.error('Please enter a valid wager amount')
      return
    }

    if (wager > maxBet) {
      toast.error(`Wager exceeds max bet of ${maxBet.toFixed(6)} ${selectedToken}`)
      return
    }

    setIsLoading(true)

    try {
      // Update store with tokens in play
      setTokensInPlay(wager, selectedToken)
      setLastWager(wager)

      // Show success alert
      showTokensBroughtToTableAlert({
        amount: wager,
        token: selectedToken,
      })

      toast.success('Tokens brought to table ✅')

      // Navigate to play page after a short delay
      setTimeout(() => {
        router.push('/play')
      }, 500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to bring tokens'
      toast.error(`Failed: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <>
        <Navbar />
        <AlertBus />
        <main className="max-w-2xl mx-auto p-4">
          <div className="text-center text-neutral-400">Loading...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <AlertBus />
      <main className="max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Check In</h1>
            <p className="text-neutral-400">Connect your wallet and select your wager</p>
          </div>

          {/* Wallet Connection Status */}
          <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900">
            {!isConnected ? (
              <div className="text-center space-y-3">
                <div className="text-amber-400">⚠️ Wallet not connected</div>
                <p className="text-sm text-neutral-400">Use the connect button in the navbar to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-neutral-400">Connected Wallet</div>
                <div className="font-mono text-sm text-green-400">{address}</div>
              </div>
            )}
          </div>

          {/* Token Balances */}
          {isConnected && (
            <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900 space-y-3">
              <h2 className="font-semibold text-neutral-200">Your Balances</h2>
              <div className="space-y-2 text-sm">
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
          )}

          {/* Token Selection & Wager */}
          {isConnected && (
            <div className="p-4 rounded-xl border border-neutral-700 bg-neutral-900 space-y-4">
              {/* Token Selector */}
              <div>
                <label className="text-sm font-medium text-white block mb-2">Wager Token</label>
                <select
                  value={selectedToken}
                  onChange={(e) => {
                    setSelectedToken(e.target.value as TokenSymbol)
                    setWager(0) // Reset wager on token change
                  }}
                  disabled={isLoading}
                  className="w-full border border-neutral-600 bg-black text-white rounded-lg px-3 py-2 text-sm font-medium focus:border-neutral-400 transition disabled:opacity-50"
                >
                  {TOKENS.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wager Amount */}
              <div>
                <label className="text-sm font-medium text-white block mb-2">Wager Amount</label>
                <div className="flex items-center gap-2">
                  {/* Decrease button */}
                  <button
                    type="button"
                    aria-label="decrease wager"
                    className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
                    onClick={() => setWager(Math.max(0, roundToStep(wager - wagerStep, wagerStep)))}
                    disabled={isLoading}
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
                      setWager(Number.isFinite(v) ? Math.min(v, maxBet) : 0)
                    }}
                    disabled={isLoading}
                  />

                  {/* Increase button */}
                  <button
                    type="button"
                    aria-label="increase wager"
                    className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition disabled:opacity-50"
                    onClick={() => setWager(Math.min(roundToStep(wager + wagerStep, wagerStep), maxBet))}
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Step Control */}
              <div>
                <label className="text-sm font-medium text-white block mb-2">Increment Step</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-neutral-600 text-white font-mono focus:border-neutral-400 transition disabled:opacity-50"
                  value={String(wagerStep)}
                  onChange={(e) => {
                    const s = Number(e.target.value.replace(/[^0-9.]/g, '')) || 1
                    setWagerStep(Math.max(0.0001, s))
                  }}
                  disabled={isLoading}
                />
              </div>

              {/* Max bet info */}
              <div className="text-xs space-y-1 pt-3 border-t border-neutral-700">
                <div className="flex justify-between text-neutral-400">
                  <span>Max per hand (5% cap)</span>
                  <span className="font-mono text-white">
                    {maxBet.toFixed(6)} {selectedToken}
                  </span>
                </div>
                {wager > maxBet && (
                  <div className="text-red-400">⚠️ Wager exceeds maximum</div>
                )}
              </div>

              {/* Bring to Table Button */}
              <button
                type="button"
                disabled={!isConnected || !wager || wager <= 0 || wager > maxBet || isLoading}
                onClick={handleBringToTable}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {isLoading ? 'Processing…' : 'Bring to Table'}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
