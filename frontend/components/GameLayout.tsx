'use client'

import React from 'react'
import { Card } from './Card'
import { NeonContainer, GlassCard } from './NeonContainer'
import { NeonButton } from './NeonButton'
import { CurrencySelector, DEFAULT_CURRENCIES } from './CurrencySelector'
import RetroScoreboard from './RetroScoreboard'
import '../styles/neon.css'

interface GameLayoutProps {
  dealerCards: { suit: string; value: string }[]
  playerCards: { suit: string; value: string }[]
  phase: string
  trueCount: number
  shoePct: number
  playerWinnings?: number
  dealerWinnings?: number
  selectedCurrency: string
  onCurrencyChange: (symbol: string) => void
  onDeal?: () => void
  onHit?: () => void
  onStand?: () => void
  onDouble?: () => void
}

/**
 * GameLayout Component - Complete game UI composition
 *
 * Combines all neon components:
 * - Card displays with glowing animations
 * - Currency selector with smooth transitions
 * - Game statistics scoreboard
 * - Action buttons with neon styling
 * - Glass morphism containers
 *
 * @param dealerCards - Dealer's cards
 * @param playerCards - Player's cards
 * @param phase - Current game phase
 * @param trueCount - Card counting true count
 * @param shoePct - Shoe percentage used
 * @param playerWinnings - Total winnings
 * @param dealerWinnings - Dealer wins count
 * @param selectedCurrency - Currently selected currency
 * @param onCurrencyChange - Currency change handler
 * @param onDeal - Deal button handler
 * @param onHit - Hit button handler
 * @param onStand - Stand button handler
 * @param onDouble - Double button handler
 */
export const GameLayout: React.FC<GameLayoutProps> = ({
  dealerCards,
  playerCards,
  phase,
  trueCount,
  shoePct,
  playerWinnings = 0,
  dealerWinnings = 0,
  selectedCurrency,
  onCurrencyChange,
  onDeal,
  onHit,
  onStand,
  onDouble,
}) => {
  const isPlayerTurn = phase === 'PLAYER_TURN'
  const isDealerTurn = phase === 'DEALER_TURN'
  const isGameComplete = phase === 'COMPLETE'

  return (
    <div className="flex-col gap-lg" style={{ padding: '20px', minHeight: '100vh' }}>
      {/* Currency Selector */}
      <CurrencySelector
        currencies={DEFAULT_CURRENCIES}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={onCurrencyChange}
      />

      {/* Game Statistics */}
      <RetroScoreboard
        trueCount={trueCount}
        shoePct={shoePct}
        playerWinnings={playerWinnings}
        dealerWinnings={dealerWinnings}
      />

      {/* Dealer Section */}
      <NeonContainer title="DEALER HAND" variant="cyan" glassEffect={true}>
        <div
          className="flex-center gap-md"
          style={{
            minHeight: '200px',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          {dealerCards.length > 0 ? (
            dealerCards.map((card, idx) => (
              <Card
                key={idx}
                suit={card.suit}
                value={card.value}
                isRevealed={idx === 0 || phase !== 'PLAYER_TURN'}
                isBack={idx !== 0 && phase === 'PLAYER_TURN'}
              />
            ))
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
              Waiting for deal...
            </div>
          )}
        </div>
      </NeonContainer>

      {/* Player Section */}
      <NeonContainer title="PLAYER HAND" variant="cyan" glassEffect={true}>
        <div
          className="flex-center gap-md"
          style={{
            minHeight: '200px',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          {playerCards.length > 0 ? (
            playerCards.map((card, idx) => (
              <Card
                key={idx}
                suit={card.suit}
                value={card.value}
                isRevealed={true}
              />
            ))
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
              Your cards appear here
            </div>
          )}
        </div>
      </NeonContainer>

      {/* Action Buttons */}
      <GlassCard>
        <div className="flex-center gap-md flex-wrap" style={{ padding: '20px' }}>
          {phase === 'WAITING_FOR_DEAL' || isGameComplete ? (
            <NeonButton variant="green" onClick={onDeal}>
              DEAL
            </NeonButton>
          ) : isPlayerTurn ? (
            <>
              <NeonButton variant="cyan" onClick={onHit}>
                HIT
              </NeonButton>
              <NeonButton variant="magenta" onClick={onStand}>
                STAND
              </NeonButton>
              {playerCards.length === 2 && (
                <NeonButton variant="green" onClick={onDouble}>
                  DOUBLE
                </NeonButton>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              {isDealerTurn ? 'Dealer is playing...' : 'Hand complete'}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}

export default GameLayout
