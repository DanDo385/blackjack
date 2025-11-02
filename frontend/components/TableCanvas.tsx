'use client'
import Image from 'next/image'
import RetroScoreboard from './RetroScoreboard'
import BetControls from './BetControls'
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
    const id = setInterval(() => setNextIdx((n) => (n + 1) % 4), 250)
    return () => clearInterval(id)
  }, [])

  const handleDeal = () => {
    // This would trigger the deal action - for now just a placeholder
    // In real implementation, this would call the backend to start a new hand
    console.log('Deal button triggered')
  }

  const dealer = ['/cards/10-H.png', '/cards/A-S.png']
  const player = ['/cards/9-C.png', '/cards/7-D.png']

  return (
    <div className="max-w-6xl mx-auto">
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
          {/* Dealer card 1 - top-left area */}
          <div className="absolute" style={{ left: '45%', top: '25%' }}>
            <Image
              alt="dealer1"
              src={dealer[0]}
              width={120}
              height={168}
              className="card"
              draggable={false}
              tabIndex={-1}
            />
          </div>

          {/* Dealer card 2 - top-left area, rotated slightly */}
          <div className="absolute" style={{ left: '50%', top: '27%', transform: 'rotate(3deg)' }}>
            <Image
              alt="dealer2"
              src={dealer[1]}
              width={120}
              height={168}
              className="card"
              draggable={false}
              tabIndex={-1}
            />
          </div>

          {/* Player card 1 - bottom-left area */}
          <div className="absolute" style={{ left: '30%', bottom: '20%' }}>
            <Image
              alt="player1"
              src={player[0]}
              width={120}
              height={168}
              className="card"
              draggable={false}
              tabIndex={-1}
            />
          </div>

          {/* Player card 2 - bottom-left area, rotated slightly */}
          <div className="absolute" style={{ left: '35%', bottom: '18%', transform: 'rotate(4deg)' }}>
            <Image
              alt="player2"
              src={player[1]}
              width={120}
              height={168}
              className="card"
              draggable={false}
              tabIndex={-1}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <BetControls {...{ anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax }} />
      </div>
    </div>
  )
}


