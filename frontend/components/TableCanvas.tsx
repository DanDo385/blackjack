'use client'
import Image from 'next/image'
import RetroScoreboard from './RetroScoreboard'
import BetControls from './BetControls'
import InsuranceModal from './InsuranceModal'
import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useGameOutcomes, useShuffleAlerts } from '@/lib/gameOutcomes'
import { BetAgainHandler } from './BetAgainHandler'

/**
 * TableCanvas - Main game table display
 *
 * Renders:
 * - Dealer/player cards overlaid absolutely on felt image
 * - Game metrics (True Count, Shoe %)
 * - Betting controls
 */
export default function TableCanvas() {
  const { trueCount, shoePct, anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax } = useStore()
  const [nextIdx, setNextIdx] = useState(0) // 0..3 for 4 card slots

  // Track game outcomes for win/loss alerts
  useGameOutcomes()
  useShuffleAlerts()

  useEffect(() => {
    const id = setInterval(() => setNextIdx((n) => (n + 1) % 4), 2.5)
    return () => clearInterval(id)
  }, [])

  const handleDeal = () => {
    // This would trigger the deal action - for now just a placeholder
    // In real implementation, this would call the backend to start a new hand
    console.log('Deal button triggered')
  }

  const dealer = ['/cards/10-H.png', '/cards/back.png']
  const player = ['/cards/9-C.png']

  const { dealerHand, playerHand } = useStore()

  return (
    <div className="max-w-6xl mx-auto">
      <InsuranceModal />
      <BetAgainHandler onDeal={handleDeal} />
      <RetroScoreboard trueCount={trueCount} shoePct={shoePct} />

      {/* Table felt with cards overlaid absolutely */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-neutral-800">
        <Image
          alt="table felt"
          src="/boards/dealerjohhny5.png"
          width={1800}
          height={900}
          priority
          className="w-full h-auto block"
        />

        {/* Cards overlay - positioned absolutely on felt */}
        <div className="pointer-events-none absolute inset-0">
          {/* Dealer cards - dynamically render from store */}
          {dealerHand.length > 0 && (
            <div className="absolute flex gap-4" style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}>
              {dealerHand.map((card, idx) => (
                <div key={idx}>
                  <Image
                    alt={`dealer card ${idx + 1}`}
                    src={card.startsWith('/cards/') ? card : `/cards/${card}`}
                    width={30}
                    height={42}
                    className="card-small"
                    draggable={false}
                    tabIndex={-1}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Player cards - dynamically render from store */}
          {playerHand.length > 0 && (
            <div className="absolute flex gap-4" style={{ left: '50%', bottom: '25%', transform: 'translateX(-50%)' }}>
              {playerHand.map((card, idx) => (
                <div key={idx}>
                  <Image
                    alt={`player card ${idx + 1}`}
                    src={card.startsWith('/cards/') ? card : `/cards/${card}`}
                    width={30}
                    height={42}
                    className="card-small"
                    draggable={false}
                    tabIndex={-1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <BetControls {...{ anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax }} />
      </div>
    </div>
  )
}


