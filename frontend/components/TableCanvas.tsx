'use client'
import Image from 'next/image'
import RetroScoreboard from './RetroScoreboard'
import InsuranceModal from './InsuranceModal'
import { useStore } from '@/lib/store'
import { useMemo } from 'react'
import { useGameOutcomes, useShuffleAlerts } from '@/lib/gameOutcomes'
import { shouldShowCards } from '@/lib/types'

/**
 * TableCanvas - Main game table display
 *
 * Renders:
 * - Dealer/player cards overlaid absolutely on felt image (only when phase allows)
 * - Game metrics (True Count, Shoe %)
 * - Betting controls
 */
export default function TableCanvas() {
  const {
    phase,
    trueCount,
    shoePct,
    dealerHand,
    playerHand,
  } = useStore()

  // Track game outcomes for win/loss alerts
  useGameOutcomes()
  useShuffleAlerts()

  // Check if cards should be visible based on phase
  const showCards = shouldShowCards(phase)

  const dealSequence = useMemo(() => {
    const sequence: string[] = []
    const rounds = Math.max(playerHand.length, dealerHand.length)

    for (let i = 0; i < rounds; i += 1) {
      if (playerHand[i]) {
        sequence.push(`player-${i}`)
      }
      if (dealerHand[i]) {
        sequence.push(`dealer-${i}`)
      }
    }
    return sequence
  }, [dealerHand, playerHand])

  const getDealDelay = (owner: 'dealer' | 'player', idx: number) => {
    const key = `${owner}-${idx}`
    const order = dealSequence.indexOf(key)
    return order >= 0 ? order * 333 : 0
  }

  return (
    <div className="max-w-6xl mx-auto">
      <InsuranceModal />
      <RetroScoreboard
        trueCount={trueCount}
        shoePct={shoePct}
      />

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
        {/* Only show cards when phase allows (after DEALING phase) */}
        {showCards && (
          <div className="pointer-events-none absolute inset-0">
            {/* Dealer cards - dynamically render from store */}
            {dealerHand.length > 0 && (
              <div className="absolute flex gap-4" style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}>
                {dealerHand.map((card, idx) => (
                  <div
                    key={`dealer-${idx}`}
                    className="card-deal"
                    style={{ animationDelay: `${getDealDelay('dealer', idx)}ms` }}
                  >
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
                  <div
                    key={`player-${idx}`}
                    className="card-deal"
                    style={{ animationDelay: `${getDealDelay('player', idx)}ms` }}
                  >
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
        )}

        {/* Placeholder message when no cards */}
        {!showCards && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/40 text-lg font-mono">
              Waiting for deal...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
