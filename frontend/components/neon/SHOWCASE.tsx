'use client'

import React, { useState } from 'react'
import { Card } from '../Card'
import { NeonButton, PrimaryButton, SecondaryButton, SuccessButton } from '../NeonButton'
import { CurrencySelector, DEFAULT_CURRENCIES } from '../CurrencySelector'
import { NeonContainer, GlassCard } from '../NeonContainer'
import RetroScoreboard from '../RetroScoreboard'
import '../../styles/neon.css'

/**
 * Neon UI Showcase - Visual component demonstration
 *
 * This component displays all neon UI components in action, showing:
 * - Card states and animations
 * - Button variants
 * - Currency selector
 * - Game statistics
 * - Container styles
 *
 * Perfect for testing, screenshots, or showing the UI design
 */
export default function NeonShowcase() {
  const [selectedCurrency, setSelectedCurrency] = useState('USDC')
  const [activeCardState, setActiveCardState] = useState<'normal' | 'winning' | 'losing' | 'flipping'>(
    'normal'
  )

  const cardStates = [
    { label: 'Normal', state: 'normal' as const },
    { label: 'Winning', state: 'winning' as const },
    { label: 'Losing', state: 'losing' as const },
    { label: 'Flipping', state: 'flipping' as const },
  ]

  return (
    <div style={{ padding: '40px', backgroundColor: 'var(--bg-darker)', minHeight: '100vh' }}>
      {/* Title */}
      <h1 className="title-neon" style={{ textAlign: 'center', marginBottom: '40px' }}>
        NEON UI SHOWCASE
      </h1>

      {/* Section 1: Cards */}
      <NeonContainer title="CARD COMPONENTS" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Card States: {activeCardState.toUpperCase()}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {cardStates.map((state) => (
                <button
                  key={state.state}
                  onClick={() => setActiveCardState(state.state)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor:
                      activeCardState === state.state ? 'var(--neon-magenta)' : 'rgba(0, 240, 255, 0.1)',
                    color: activeCardState === state.state ? 'var(--bg-darker)' : 'var(--neon-cyan)',
                    border: `2px solid ${activeCardState === state.state ? 'var(--neon-magenta)' : 'var(--neon-cyan)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {state.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-center gap-lg" style={{ minHeight: '200px', flexWrap: 'wrap' }}>
            <Card suit="H" value="A" />
            <Card suit="D" value="K" isRevealed={activeCardState === 'normal'} />
            <Card suit="C" value="5" isWinning={activeCardState === 'winning'} />
            <Card suit="S" value="10" isLosing={activeCardState === 'losing'} />
            <Card suit="H" value="J" isFlipping={activeCardState === 'flipping'} />
          </div>
        </div>
      </NeonContainer>

      {/* Section 2: Buttons */}
      <NeonContainer title="BUTTON VARIANTS" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '14px' }}>
              Standard Variants
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <NeonButton variant="cyan">CYAN BUTTON</NeonButton>
              <NeonButton variant="magenta">MAGENTA BUTTON</NeonButton>
              <NeonButton variant="green">GREEN BUTTON</NeonButton>
              <NeonButton disabled>DISABLED BUTTON</NeonButton>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '14px' }}>
              Preset Variants
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <PrimaryButton>PRIMARY ACTION</PrimaryButton>
              <SecondaryButton>SECONDARY ACTION</SecondaryButton>
              <SuccessButton>CONFIRM ACTION</SuccessButton>
            </div>
          </div>
        </div>
      </NeonContainer>

      {/* Section 3: Currency Selector */}
      <NeonContainer title="CURRENCY SELECTOR" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Selected Currency: <strong style={{ color: 'var(--neon-cyan)' }}>{selectedCurrency}</strong>
          </p>
          <CurrencySelector
            currencies={DEFAULT_CURRENCIES}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </div>
      </NeonContainer>

      {/* Section 4: Game Statistics */}
      <NeonContainer title="GAME STATISTICS" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <RetroScoreboard
            trueCount={2.5}
            shoePct={35}
            playerWinnings={1250.5}
            playerLosings={500}
            dealerWinnings={87}
          />
        </div>
      </NeonContainer>

      {/* Section 5: Container Styles */}
      <NeonContainer title="CONTAINER & GLASS STYLES" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <GlassCard>
            <h3 style={{ color: 'var(--neon-cyan)' }}>Light Glass Card</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              This is a light glass morphism card with subtle effects.
            </p>
          </GlassCard>

          <GlassCard isDark={true}>
            <h3 style={{ color: 'var(--neon-magenta)' }}>Dark Glass Card</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              This is a dark glass morphism card with more prominent effects.
            </p>
          </GlassCard>

          <GlassCard>
            <h3 style={{ color: 'var(--neon-green)' }}>Feature Card</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Glass cards work great for highlighting important information.
            </p>
          </GlassCard>
        </div>
      </NeonContainer>

      {/* Section 6: Color Palette */}
      <NeonContainer title="COLOR PALETTE" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { name: 'Cyan', color: 'var(--neon-cyan)', hex: '#00f0ff' },
              { name: 'Magenta', color: 'var(--neon-magenta)', hex: '#ff006e' },
              { name: 'Green', color: 'var(--neon-green)', hex: '#39ff14' },
              { name: 'Purple', color: 'var(--neon-purple)', hex: '#bf00ff' },
              { name: 'Pink', color: 'var(--neon-pink)', hex: '#ff10f0' },
              { name: 'Yellow', color: 'var(--neon-yellow)', hex: '#ffff00' },
              { name: 'Orange', color: 'var(--neon-orange)', hex: '#ff6600' },
              { name: 'Blue', color: 'var(--neon-blue)', hex: '#0066ff' },
            ].map((c) => (
              <div key={c.name} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: '60px',
                    backgroundColor: c.color,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    boxShadow: `0 0 20px ${c.color}`,
                  }}
                />
                <p style={{ color: c.color, fontSize: '12px', fontWeight: 'bold' }}>
                  {c.name}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{c.hex}</p>
              </div>
            ))}
          </div>
        </div>
      </NeonContainer>

      {/* Section 7: Animations */}
      <NeonContainer title="ANIMATIONS & EFFECTS" variant="cyan" glassEffect={true}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                Pulse Glow (1.5s)
              </h4>
              <Card suit="H" value="A" isRevealed={true} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                Winning Pulse (0.5s)
              </h4>
              <Card suit="D" value="K" isWinning={true} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                Shake Effect (0.5s)
              </h4>
              <Card suit="C" value="5" isLosing={true} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                Flip Animation (0.6s)
              </h4>
              <Card suit="S" value="10" isFlipping={true} />
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'rgba(0, 240, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--neon-cyan)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
              <strong>Animation Details:</strong> All animations use GPU-accelerated CSS properties for smooth 60 FPS performance. Each animation has a unique duration and easing function optimized for visual impact.
            </p>
          </div>
        </div>
      </NeonContainer>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Neon UI Showcase © 2024 | Futuristic Blackjack
        </p>
      </div>
    </div>
  )
}
