'use client'

import { Toaster } from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { showWalletConnectedAlert } from '@/lib/alerts'

/**
 * AlertBus - Component-level alert management
 *
 * Responsible for:
 * - Rendering the toast notification container
 * - Detecting wallet connection state changes and triggering alerts
 *
 * All alert display logic is in @/lib/alerts.ts
 */
export function AlertBus() {
  const { address, isConnected } = useAccount()
  const prevConnectedRef = useRef(false)

  useEffect(() => {
    // Show wallet connected alert when wallet connects
    if (isConnected && address && !prevConnectedRef.current) {
      showWalletConnectedAlert(address)
      prevConnectedRef.current = true
    } else if (!isConnected) {
      prevConnectedRef.current = false
    }
  }, [isConnected, address])

  return <Toaster position="top-right" />
}
