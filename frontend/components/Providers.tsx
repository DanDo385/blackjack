'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }:{ children: React.ReactNode }){
  const [qc] = useState(()=> new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } }
  }))
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
