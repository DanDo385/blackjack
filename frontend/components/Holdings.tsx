'use client'

import { useAccount, useBalance } from 'wagmi'
import { formatUnits } from 'viem'

/**
 * Holdings Component
 *
 * Displays user's wallet balances (ETH + USDC)
 * Connects to wallet via wagmi hooks
 *
 * Features:
 * - Shows ETH balance
 * - Shows USDC balance
 * - Shows shortened wallet address
 * - Prompts to connect if wallet not connected
 */

// USDC contract address on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const

export function Holdings() {
  const { address, isConnected } = useAccount()

  // Fetch ETH balance
  const { data: ethBalance } = useBalance({
    address,
  })

  // Fetch USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
  })

  if (!isConnected || !address) {
    return (
      <div className="text-sm text-neutral-400 text-center">
        Connect wallet to see holdings
      </div>
    )
  }

  const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`
  const ethFormatted = ethBalance ? Number(ethBalance.formatted).toFixed(4) : '—'
  const usdcFormatted = usdcBalance ? Number(usdcBalance.formatted).toFixed(2) : '—'

  return (
    <div className="text-sm space-y-2">
      {/* Address */}
      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
        <span className="text-neutral-400">Address</span>
        <span className="font-mono text-white">{shortAddress}</span>
      </div>

      {/* ETH Balance */}
      <div className="flex justify-between items-center py-2 border-b border-neutral-700">
        <span className="text-neutral-400">ETH Balance</span>
        <span className="font-mono text-white">
          {ethFormatted} <span className="text-neutral-500">ETH</span>
        </span>
      </div>

      {/* USDC Balance */}
      <div className="flex justify-between items-center py-2">
        <span className="text-neutral-400">USDC Balance</span>
        <span className="font-mono text-white">
          {usdcFormatted} <span className="text-neutral-500">USDC</span>
        </span>
      </div>
    </div>
  )
}
