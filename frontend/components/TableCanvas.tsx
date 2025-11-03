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

  const dealer = ['/cards/10-H.png', '/cards/back.png']
  const player = ['/cards/9-C.png']

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
          {/* Dealer cards - two card backs + one face-up card, horizontally aligned */}
          <div className="absolute flex gap-4" style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}>
            {/* Dealer card back 1 */}
            <div>
              <Image
                alt="dealer back 1"
                src="/cards/back.png"
                width={30}
                height={42}
                className="card-small"
                draggable={false}
                tabIndex={-1}
              />
            </div>

            {/* Dealer card back 2 */}
            <div>
              <Image
                alt="dealer back 2"
                src="/cards/back.png"
                width={30}
                height={42}
                className="card-small"
                draggable={false}
                tabIndex={-1}
              />
            </div>

            {/* Dealer face-up card */}
            <div>
              <Image
                alt="dealer face-up"
                src={dealer[0]}
                width={30}
                height={42}
                className="card-small"
                draggable={false}
                tabIndex={-1}
              />
            </div>
          </div>

          {/* Player cards - one card back + one face-up card, horizontally aligned */}
          <div className="absolute flex gap-4" style={{ left: '50%', bottom: '25%', transform: 'translateX(-50%)' }}>
            {/* Player card back */}
            <div>
              <Image
                alt="player back"
                src="/cards/back.png"
                width={30}
                height={42}
                className="card-small"
                draggable={false}
                tabIndex={-1}
              />
            </div>

            {/* Player face-up card */}
            <div>
              <Image
                alt="player face-up"
                src={player[0]}
                width={30}
                height={42}
                className="card-small"
                draggable={false}
                tabIndex={-1}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <BetControls {...{ anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax }} />
      </div>
    </div>
  )
}


