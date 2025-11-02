'use client'
import { useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { showWinAlert, showLossAlert, showCashOutAlert, setBetAgainCallback, showShuffleAlert } from '@/lib/alerts'
import { useStore } from '@/lib/store'
import { getEngineState } from '@/lib/api'

// Hook to track game outcomes (wins/losses) and cash outs
export function useGameOutcomes() {
  const { address } = useAccount()
  const lastHandIdRef = useRef<number | null>(null)
  const lastCashOutRef = useRef<string | null>(null)
  const { lastBet } = useStore()

  // Check for game outcomes by polling or listening to events
  useEffect(() => {
    if (!address) return

    // Poll for recent hands and check for settlements
    const checkOutcomes = async () => {
      try {
        // This would be replaced with actual API endpoint
        // For now, we'll set up a structure that can work with the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/user/hands?player=${address}&limit=1`
        )
        
        if (response.ok) {
          const data = await response.json()
          const latestHand = data.hands?.[0]
          
          if (latestHand && latestHand.hand_id !== lastHandIdRef.current && latestHand.settled) {
            lastHandIdRef.current = latestHand.hand_id
            
            const amount = parseFloat(latestHand.amount || '0')
            const token = latestHand.token_address || 'USDC'
            const result = latestHand.result // 'win' or 'loss'
            const payout = parseFloat(latestHand.payout || '0')
            
            // Check if player has enough tokens to bet the same amount again
            // This would need to check wallet balance or backend balance
            const canBetAgain = lastBet <= amount + payout // Simplified check
            
            const handleBetAgain = () => {
              // Trigger deal button action - this would need to be passed from parent
              // For now, we'll use a callback system
              console.log('Betting again with amount:', lastBet)
            }
            
            if (result === 'win') {
              showWinAlert({
                amount: payout,
                token,
                canBetAgain,
                lastBetAmount: lastBet || amount,
              }, handleBetAgain)
            } else if (result === 'loss') {
              showLossAlert({
                amount,
                token,
                canBetAgain,
                lastBetAmount: lastBet || amount,
              }, handleBetAgain)
            }
          }
        }
      } catch (error) {
        // Silently handle errors - backend might not be fully implemented
        console.debug('Game outcome check failed:', error)
      }
    }

    // Check for cash out (can be detected via withdrawal transactions or API)
    const checkCashOut = async () => {
      try {
        // In a real implementation, this would:
        // 1. Listen to blockchain events for token withdrawals
        // 2. Check an API endpoint for withdrawal history
        // 3. Monitor wallet balance changes
        
        // For now, we'll set up a structure that can be enhanced
        // when the backend provides withdrawal endpoints
        
        // Placeholder: Check user summary for balance changes that might indicate cash out
        const summaryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/user/summary?player=${address}`
        )
        
        if (summaryResponse.ok) {
          // This would contain balance info that could indicate cash out
          // For now, cash out detection would happen via:
          // - Manual trigger (button click)
          // - Blockchain event listener
          // - API endpoint when implemented
        }
      } catch (error) {
        console.debug('Cash out check failed:', error)
      }
    }

    // Poll every 2 seconds for game outcomes and cash outs
    const interval = setInterval(() => {
      checkOutcomes()
      checkCashOut()
      getEngineState().then(state => useStore.setState(state))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [address, lastBet])
}

// Component to handle bet again action
export function BetAgainHandler({ onDeal }: { onDeal: () => void }) {
  useEffect(() => {
    setBetAgainCallback((confirmed: boolean) => {
      if (confirmed) {
        onDeal()
      }
    })
    
    return () => {
      setBetAgainCallback(() => {})
    }
  }, [onDeal])
  
  return null
}

// Function to trigger cash out alert (can be called manually or from withdrawal detection)
export function triggerCashOutAlert(amount: number, token: string) {
  showCashOutAlert(amount, token)
}

// Hook to track deck shuffles
export function useShuffleAlerts() {
  const { shoePct } = useStore();
  const prevShoePctRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevShoePctRef.current !== null) {
      // Detect when shoe percentage drops significantly, indicating a shuffle
      if (prevShoePctRef.current > 75 && shoePct < prevShoePctRef.current) {
        showShuffleAlert();
      }
    }
    prevShoePctRef.current = shoePct;
  }, [shoePct]);
}
