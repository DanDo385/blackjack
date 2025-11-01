'use client'
import { Toaster } from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { showWalletConnectedAlert } from '@/lib/alerts'

export function AlertBus(){
  const { address, isConnected } = useAccount()
  const prevConnectedRef = useRef(false)

  useEffect(()=>{
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


