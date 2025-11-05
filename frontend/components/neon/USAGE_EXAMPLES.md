# Neon UI Components - Usage Examples

This document provides practical examples of how to use the futuristic neon UI components in your blackjack application.

## Quick Start

### Import Components

```typescript
// Option 1: Import from neon index
import { Card, NeonButton, GameLayout, CurrencySelector } from '@/components/neon'

// Option 2: Import directly from component files
import { Card } from '@/components/Card'
import { NeonButton, PrimaryButton } from '@/components/NeonButton'
```

## Component Usage Examples

### 1. Card Display

Display individual playing cards with different states:

```typescript
import { Card } from '@/components/neon'

export function DealerHand() {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Revealed card */}
      <Card
        suit="H"
        value="K"
        isRevealed={true}
      />

      {/* Hidden card (face down) */}
      <Card
        suit="D"
        value="5"
        isBack={true}
      />

      {/* Winning card */}
      <Card
        suit="C"
        value="A"
        isWinning={true}
      />

      {/* Losing card with shake animation */}
      <Card
        suit="S"
        value="10"
        isLosing={true}
      />

      {/* Card with flip animation */}
      <Card
        suit="H"
        value="J"
        isFlipping={true}
      />
    </div>
  )
}
```

### 2. Neon Buttons

Different button variants for different actions:

```typescript
import { NeonButton, PrimaryButton, SecondaryButton, SuccessButton } from '@/components/neon'

export function GameActions() {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {/* Standard variants */}
      <NeonButton variant="cyan" onClick={() => console.log('Primary')}>
        HIT
      </NeonButton>

      <NeonButton variant="magenta" onClick={() => console.log('Secondary')}>
        STAND
      </NeonButton>

      <NeonButton variant="green" onClick={() => console.log('Success')}>
        DOUBLE
      </NeonButton>

      {/* Disabled state */}
      <NeonButton variant="cyan" disabled>
        UNAVAILABLE
      </NeonButton>

      {/* Using preset variants */}
      <PrimaryButton onClick={() => console.log('Primary action')}>
        Primary Action
      </PrimaryButton>

      <SecondaryButton onClick={() => console.log('Secondary action')}>
        Secondary Action
      </SecondaryButton>

      <SuccessButton onClick={() => console.log('Success action')}>
        Confirm
      </SuccessButton>
    </div>
  )
}
```

### 3. Currency Selector

Let players switch between different cryptocurrencies:

```typescript
import { useState } from 'react'
import { CurrencySelector, DEFAULT_CURRENCIES } from '@/components/neon'

export function BettingSection() {
  const [selectedCurrency, setSelectedCurrency] = useState('USDC')

  return (
    <div>
      <h2>Select Currency</h2>
      <CurrencySelector
        currencies={DEFAULT_CURRENCIES}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />
      <p>Selected: {selectedCurrency}</p>
    </div>
  )
}

// Custom currencies
const CUSTOM_CURRENCIES = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'DAI', name: 'Dai', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
]

export function CustomCurrencySelector() {
  const [selected, setSelected] = useState('USDC')

  return (
    <CurrencySelector
      currencies={CUSTOM_CURRENCIES}
      selectedCurrency={selected}
      onCurrencyChange={setSelected}
    />
  )
}
```

### 4. Neon Containers & Glass Cards

Organize content with stylish containers:

```typescript
import { NeonContainer, GlassCard } from '@/components/neon'

export function GameStats() {
  return (
    <NeonContainer title="GAME STATISTICS" variant="cyan" glassEffect={true}>
      <div style={{ padding: '20px' }}>
        <p>Total Hands Played: 156</p>
        <p>Current Winnings: $1,250</p>
        <p>House Edge: 2.4%</p>
      </div>
    </NeonContainer>
  )
}

export function InfoCard() {
  return (
    <GlassCard isDark={false}>
      <div style={{ padding: '16px' }}>
        <h3>Game Information</h3>
        <p>Welcome to the futuristic blackjack experience!</p>
      </div>
    </GlassCard>
  )
}

export function DarkInfoCard() {
  return (
    <GlassCard isDark={true}>
      <div style={{ padding: '16px' }}>
        <h3>Dark Theme Card</h3>
        <p>Using dark glass morphism effect</p>
      </div>
    </GlassCard>
  )
}
```

### 5. Retro Scoreboard

Display game statistics with neon styling:

```typescript
import { RetroScoreboard } from '@/components/neon'

export function GameStats() {
  return (
    <RetroScoreboard
      trueCount={2.5}
      shoePct={35}
      playerWinnings={1250.50}
      playerLosings={500.00}
      dealerWinnings={87}
    />
  )
}
```

### 6. Complete Game Layout

Combine all components into a full game interface:

```typescript
import { GameLayout } from '@/components/neon'
import { useState } from 'react'

export default function BlackjackGame() {
  const [selectedCurrency, setSelectedCurrency] = useState('USDC')
  const [gameState, setGameState] = useState({
    dealerCards: [],
    playerCards: [],
    phase: 'WAITING_FOR_DEAL',
    trueCount: 0,
    shoePct: 0,
    playerWinnings: 0,
    dealerWinnings: 0,
  })

  const handleDeal = async () => {
    // Call backend to deal cards
    console.log('Dealing new hand...')
    setGameState((prev) => ({
      ...prev,
      phase: 'PLAYER_TURN',
      dealerCards: [
        { suit: 'H', value: 'K' },
        { suit: 'D', value: '5' },
      ],
      playerCards: [
        { suit: 'C', value: 'A' },
        { suit: 'S', value: '9' },
      ],
    }))
  }

  const handleHit = () => {
    console.log('Player hits')
    // Update game state
  }

  const handleStand = () => {
    console.log('Player stands')
    // Update game state
  }

  const handleDouble = () => {
    console.log('Player doubles down')
    // Update game state
  }

  return (
    <GameLayout
      dealerCards={gameState.dealerCards}
      playerCards={gameState.playerCards}
      phase={gameState.phase}
      trueCount={gameState.trueCount}
      shoePct={gameState.shoePct}
      playerWinnings={gameState.playerWinnings}
      dealerWinnings={gameState.dealerWinnings}
      selectedCurrency={selectedCurrency}
      onCurrencyChange={setSelectedCurrency}
      onDeal={handleDeal}
      onHit={handleHit}
      onStand={handleStand}
      onDouble={handleDouble}
    />
  )
}
```

## Advanced Usage

### Custom Card Styling

```typescript
import { Card } from '@/components/neon'

export function CustomStyledCard() {
  return (
    <Card
      suit="H"
      value="A"
      isRevealed={true}
      className="my-custom-class"
      onClick={() => console.log('Card clicked')}
    />
  )
}
```

### Responsive Grid Layout

```typescript
import { NeonContainer } from '@/components/neon'

export function ResponsiveLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <NeonContainer title="Section 1">Content 1</NeonContainer>
      <NeonContainer title="Section 2">Content 2</NeonContainer>
      <NeonContainer title="Section 3">Content 3</NeonContainer>
    </div>
  )
}
```

### Combining Components

```typescript
import { Card, NeonButton, NeonContainer } from '@/components/neon'

export function CompleteGameSection() {
  return (
    <NeonContainer title="PLAYER ACTION">
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <Card suit="H" value="K" isRevealed={true} />
          <Card suit="D" value="5" isRevealed={true} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <NeonButton variant="cyan">HIT</NeonButton>
          <NeonButton variant="magenta">STAND</NeonButton>
          <NeonButton variant="green">DOUBLE</NeonButton>
        </div>
      </div>
    </NeonContainer>
  )
}
```

## Styling & Customization

### Override Neon Colors

```typescript
import { Card } from '@/components/neon'

export function CustomColorCard() {
  return (
    <Card
      suit="H"
      value="A"
      isRevealed={true}
      className="custom-color"
      style={{
        borderColor: '#39ff14', // Override with green
      }}
    />
  )
}
```

### Custom CSS Integration

```css
/* In your own CSS file */
.custom-card {
  border-color: #ff00ff !important;
  box-shadow: 0 0 40px #ff00ff, inset 0 0 20px rgba(255, 0, 255, 0.1) !important;
}

.custom-container {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
}
```

```typescript
import { Card, NeonContainer } from '@/components/neon'

export function CustomStyled() {
  return (
    <>
      <Card suit="H" value="A" className="custom-card" />
      <NeonContainer className="custom-container">
        Custom content
      </NeonContainer>
    </>
  )
}
```

## Best Practices

1. **Use Semantic HTML**: Components handle accessibility internally
2. **Responsive Design**: Components adapt to mobile automatically
3. **Animation Performance**: Avoid animating in rapid succession
4. **Color Contrast**: Use provided neon colors for accessibility
5. **Mobile First**: Test on mobile to ensure touch-friendly sizing
6. **Lazy Loading**: Load heavy components with React.lazy() for large games
7. **Memoization**: Use React.memo() for frequently re-rendered card groups

## Troubleshooting

### Glow Effects Not Showing

Ensure CSS is imported:
```typescript
import '../styles/neon.css'
```

### Animations Stuttering

- Check browser hardware acceleration is enabled
- Verify animations use GPU-accelerated properties (transform, opacity)
- Reduce number of simultaneous animations

### Mobile Layout Issues

- Test with viewport breakpoint: `max-width: 768px`
- Components auto-adjust sizing at breakpoint
- Use flex utilities for responsive layouts

## Performance Tips

1. Memoize card lists to prevent re-renders
2. Use CSS animations instead of JavaScript animations
3. Lazy load GameLayout component if not immediately visible
4. Debounce currency change callbacks
5. Consider virtual scrolling for many cards in statistics view
