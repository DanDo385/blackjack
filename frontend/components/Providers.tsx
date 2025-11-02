'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import '@rainbow-me/rainbowkit/styles.css'

/**
 * Providers component
 *
 * Wraps the app with:
 * - Wagmi (wallet connection)
 * - RainbowKit (wallet UI)
 * - React Query (API caching)
 * - React Hot Toast (notifications)
 *
 * Also initializes game state on mount (clears stale localStorage)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } },
      })
  )

  // Initialize game state on mount: clear stale persistence and reset to fresh state
  useEffect(() => {
    // Clean up any stale game state from previous sessions
    const staleKeys = ['yolo_state', 'game_state', 'shoe_state', 'hand_state']
    staleKeys.forEach((key) => {
      if (typeof window !== 'undefined' && localStorage.getItem(key)) {
        localStorage.removeItem(key)
      }
    })

    // Reset to a fresh shoe
    useStore.getState().newShoe()
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider>
          {children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
