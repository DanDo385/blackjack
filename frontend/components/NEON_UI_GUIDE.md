# Futuristic Neon Blackjack UI Guide

## Overview

This guide documents the complete futuristic neon-themed UI components created for the blackjack application. All components use a cohesive cyberpunk aesthetic with glowing neon effects, glass morphism, and smooth animations.

## Color Palette

The neon color system uses CSS custom properties for consistency:

- **--neon-cyan**: `#00f0ff` - Primary electric blue, main UI elements
- **--neon-magenta**: `#ff006e` - Secondary pink/red, active states
- **--neon-green**: `#39ff14` - Success/positive states
- **--neon-purple**: `#bf00ff` - Alternative accent color
- **--neon-pink**: `#ff10f0` - Bright pink accent
- **--neon-yellow**: `#ffff00` - Attention/winning states
- **--neon-orange**: `#ff6600` - Secondary accent
- **--neon-blue**: `#0066ff` - Alternative blue

## Core Components

### 1. Card Component (`Card.tsx`)

Displays individual playing cards with futuristic neon styling and animations.

**Features:**
- Glowing cyan border with shadow effects
- Multiple states: revealed (green glow), winning (yellow glow), losing (magenta shake)
- Smooth flip animation on reveal (0.6s)
- Hover effects with scale and elevation
- Back pattern for unrevealed cards
- Suit colors: Hearts/Diamonds (pink), Clubs/Spades (cyan)

**Props:**
```typescript
interface CardProps {
  suit: string           // 'H' | 'D' | 'C' | 'S'
  value: string          // 'A' | '2'-'10' | 'J' | 'Q' | 'K'
  imageUrl?: string      // Optional image URL
  isRevealed?: boolean   // Shows green glow + pulse animation
  isWinning?: boolean    // Shows yellow glow with celebrate animation
  isLosing?: boolean     // Shows magenta glow with shake animation
  isFlipping?: boolean   // Plays flip animation
  isBack?: boolean       // Shows card back pattern
  onClick?: () => void
  className?: string
}
```

**CSS Classes:**
- `.card` - Base card styling
- `.card.revealed` - Green glow state
- `.card.winning` - Yellow celebration state
- `.card.losing` - Magenta shake state
- `.card.flipping` - Flip animation
- `.card:hover` - Hover elevation effect

**Animation Keyframes:**
- `@keyframes flip-card` - 0.6s flip animation
- `@keyframes pulse-glow` - 1.5s pulsing green glow (revealed state)
- `@keyframes winning-pulse` - 0.5s celebration animation
- `@keyframes shake` - Losing hand shake effect

### 2. NeonButton Component (`NeonButton.tsx`)

Action buttons with neon glow effects and smooth transitions.

**Features:**
- Three color variants: cyan, magenta, green
- Glowing effects with hover scale transformation
- Disabled state with reduced opacity
- Smooth cubic-bezier transitions
- Preset variants: PrimaryButton, SecondaryButton, SuccessButton

**Props:**
```typescript
interface NeonButtonProps {
  variant?: 'cyan' | 'magenta' | 'green'  // Default: 'cyan'
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  title?: string
}
```

**Usage:**
```typescript
// Standard button
<NeonButton variant="cyan" onClick={handleClick}>
  CLICK ME
</NeonButton>

// Preset variants
<PrimaryButton onClick={handlePrimary}>Primary Action</PrimaryButton>
<SecondaryButton onClick={handleSecondary}>Secondary Action</SecondaryButton>
<SuccessButton onClick={handleSuccess}>Confirm</SuccessButton>
```

**CSS Classes:**
- `.btn-neon` - Base button styling
- `.btn-neon-cyan` - Cyan variant (electric blue glow)
- `.btn-neon-magenta` - Magenta variant (pink glow)
- `.btn-neon-green` - Green variant (bright green glow)
- `.btn-neon:disabled` - Disabled state

### 3. CurrencySelector Component (`CurrencySelector.tsx`)

Dynamic currency switching with smooth transitions and neon effects.

**Features:**
- Multiple cryptocurrency support (USDC, ETH, LINK, USDT)
- Active state with magenta glow and scale animation
- Hover effects with glow expansion
- Smooth transitions between currencies
- Preset currency list included

**Props:**
```typescript
interface CurrencySelectorProps {
  currencies: Currency[]
  selectedCurrency: string
  onCurrencyChange: (symbol: string) => void
  className?: string
}

interface Currency {
  symbol: string        // e.g., 'USDC', 'ETH'
  name: string          // Full name
  color?: string        // Optional custom color
  decimals: number      // Decimal places
}
```

**Default Currencies:**
```typescript
const DEFAULT_CURRENCIES: Currency[] = [
  { symbol: 'USDC', name: 'USD Coin', color: '#00f0ff', decimals: 6 },
  { symbol: 'ETH', name: 'Ethereum', color: '#bf00ff', decimals: 18 },
  { symbol: 'LINK', name: 'Chainlink', color: '#39ff14', decimals: 18 },
  { symbol: 'USDT', name: 'Tether', color: '#ff006e', decimals: 6 },
]
```

**CSS Classes:**
- `.currency-selector` - Container flex layout
- `.currency-btn` - Individual currency button
- `.currency-btn:hover` - Hover state with scale
- `.currency-btn.active` - Active state with magenta glow and pulse

### 4. NeonContainer & GlassCard Components (`NeonContainer.tsx`)

Container elements with glass morphism and neon borders.

**Features:**
- Glowing neon border (cyan by default)
- Scanning line animation for cyberpunk feel
- Optional glass morphism backdrop blur
- Multiple color variants
- Inset glow effects

**Props:**
```typescript
interface NeonContainerProps {
  title?: string
  variant?: 'cyan' | 'purple' | 'dark'
  children: React.ReactNode
  className?: string
  glassEffect?: boolean  // Default: true
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  isDark?: boolean
}
```

**Usage:**
```typescript
<NeonContainer title="GAME STATS" variant="cyan" glassEffect={true}>
  {/* Content */}
</NeonContainer>

<GlassCard isDark={false}>
  {/* Content */}
</GlassCard>
```

**CSS Classes:**
- `.container-neon` - Base container with cyan border and glow
- `.glass` - Glass morphism effect (light variant)
- `.glass-dark` - Glass morphism effect (dark variant)
- `.title-neon` - Gradient title with glow animation

**Animation Keyframes:**
- `@keyframes scan` - 3s scanning line effect

### 5. RetroScoreboard Component (`RetroScoreboard.tsx`)

Real-time game statistics display with neon styling.

**Features:**
- Player winnings and dealer wins tracking
- Card counting metrics (true count, shoe percentage)
- Color-coded values (green for winning, magenta for losing)
- Dynamic coloring based on game state
- Responsive grid layout

**Props:**
```typescript
interface RetroScoreboardProps {
  trueCount: number
  shoePct: number
  playerWinnings?: number     // Default: 0
  playerLosings?: number      // Default: 0
  dealerWinnings?: number     // Default: 0
}
```

**Displayed Stats:**
1. **Player Winnings** - Total amount won (green if winning, magenta if losing)
2. **Profit/Loss** - Net profit/loss with true count sub-stat
3. **Dealer Wins** - Count of hands dealer won (inverse color coding)
4. **Shoe Used** - Percentage of deck dealt (cyan)

**CSS Classes:**
- `.scoreboard` - Grid container with auto-fit responsive layout
- `.stat-box` - Individual stat box with cyan border and glow
- `.stat-label` - Uppercase label with letter spacing
- `.stat-value` - Large glowing value display

### 6. GameLayout Component (`GameLayout.tsx`)

Complete game UI composition combining all neon components.

**Features:**
- Dealer and player card displays
- Currency selector integration
- Game statistics scoreboard
- Context-aware action buttons
- Glass morphism containers
- Responsive flex layout

**Props:**
```typescript
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
```

**Button Display Logic:**
- **WAITING_FOR_DEAL / COMPLETE**: Show DEAL button
- **PLAYER_TURN**: Show HIT, STAND, and DOUBLE (if 2 cards)
- **DEALER_TURN**: Show status message
- **COMPLETE**: Show completion message

## CSS Architecture

### Global Variables (neon.css)

All colors, glows, and transitions defined as CSS custom properties for consistency:

```css
:root {
  /* Neon colors */
  --neon-cyan: #00f0ff;
  --neon-magenta: #ff006e;
  --neon-green: #39ff14;
  /* ... etc */

  /* Backgrounds */
  --bg-dark: #0a0e27;
  --bg-darker: #050813;
  --bg-surface: #16213e;

  /* Text colors */
  --text-primary: #f0f0f0;
  --text-secondary: #a0a0a0;

  /* Glow effects */
  --glow-small: 0 0 10px;
  --glow-medium: 0 0 20px;
  --glow-large: 0 0 40px;
  --glow-xlarge: 0 0 60px;
}
```

### Utility Classes

Flex and spacing utilities for layout:

```css
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-col { display: flex; flex-direction: column; }
.gap-sm { gap: 8px; }
.gap-md { gap: 16px; }
.gap-lg { gap: 24px; }
```

### Animations Summary

| Animation | Duration | Effect |
|-----------|----------|--------|
| `flip-card` | 0.6s | Card flip on reveal |
| `pulse-glow` | 1.5s | Pulsing glow for revealed cards |
| `winning-pulse` | 0.5s | Celebration animation |
| `shake` | 0.5s | Losing hand shake |
| `spin-slow` | 4s | Card back border rotation |
| `card-back-glow` | 2s | Card back drop-shadow pulse |
| `scan` | 3s | Container scanning line |
| `title-glow` | 2s | Title text glow pulse |

## Responsive Design

Mobile breakpoint: `@media (max-width: 768px)`

Adjustments:
- Card size: 120x160px → 100x140px
- Card font: 48px → 36px
- Title font: 32px → 24px
- Button padding: 12px 32px → 10px 24px
- Currency buttons: Reduced padding and font size
- Scoreboard: 1-column grid → 2-column grid

## Implementation Example

```typescript
import { GameLayout } from '@/components/GameLayout'
import { Card } from '@/components/Card'
import { NeonButton } from '@/components/NeonButton'
import { CurrencySelector } from '@/components/CurrencySelector'

export default function GamePage() {
  const [selectedCurrency, setSelectedCurrency] = useState('USDC')

  return (
    <GameLayout
      dealerCards={[
        { suit: 'H', value: 'K' },
        { suit: 'D', value: '5' },
      ]}
      playerCards={[
        { suit: 'C', value: 'A' },
        { suit: 'S', value: '9' },
      ]}
      phase="PLAYER_TURN"
      trueCount={2.5}
      shoePct={35}
      playerWinnings={250}
      dealerWinnings={12}
      selectedCurrency={selectedCurrency}
      onCurrencyChange={setSelectedCurrency}
      onDeal={() => console.log('Deal')}
      onHit={() => console.log('Hit')}
      onStand={() => console.log('Stand')}
      onDouble={() => console.log('Double')}
    />
  )
}
```

## Performance Considerations

1. **Animation Performance**: All animations use GPU-accelerated properties (transform, opacity)
2. **Box Shadows**: Glow effects use box-shadow which is performant on modern browsers
3. **Backdrop Filters**: Glass morphism uses backdrop-filter with -webkit prefix for compatibility
4. **CSS Custom Properties**: Reduces code repetition and enables theme switching
5. **Component Memoization**: Consider using React.memo() for frequently re-rendered components

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **CSS Features**: Grid, Flexbox, CSS Custom Properties, Backdrop Filter
- **Fallbacks**: Older browsers will show functional UI without glow effects

## Future Enhancements

1. Dark/Light theme toggle using CSS custom property updates
2. Animation intensity settings (reduce-motion support)
3. Color customization for accessibility
4. Additional card animation states (split, insurance)
5. Sound effects integration with neon visual feedback
6. Card particle effects for special outcomes
