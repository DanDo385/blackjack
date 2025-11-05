'use client'

import React, { useEffect, useState } from 'react'
import '../styles/neon.css'

interface CardProps {
  suit: string
  value: string
  imageUrl?: string
  isRevealed?: boolean
  isWinning?: boolean
  isLosing?: boolean
  isFlipping?: boolean
  isBack?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Card Component - Futuristic neon-styled playing card
 *
 * Features:
 * - Glowing cyan border with shadow effects
 * - Multiple states: revealed (green glow), winning (yellow glow), losing (magenta shake)
 * - Smooth flip animation on reveal
 * - Hover effects with scale and elevation
 *
 * @param suit - Card suit (H, D, C, S)
 * @param value - Card value (A, 2-10, J, Q, K)
 * @param imageUrl - Optional URL to card image
 * @param isRevealed - If true, shows green glow and pulsing animation
 * @param isWinning - If true, shows yellow glow with winning celebration animation
 * @param isLosing - If true, shows magenta glow with shake animation
 * @param isFlipping - If true, plays flip animation
 * @param isBack - If true, shows card back pattern instead of card face
 * @param onClick - Callback when card is clicked
 * @param className - Additional CSS classes to apply
 */
export const Card: React.FC<CardProps> = ({
  suit,
  value,
  imageUrl,
  isRevealed = false,
  isWinning = false,
  isLosing = false,
  isFlipping = false,
  isBack = false,
  onClick,
  className = '',
}) => {
  const [displayFlip, setDisplayFlip] = useState(isFlipping)

  useEffect(() => {
    if (isFlipping) {
      setDisplayFlip(true)
      // Animation duration is 0.6s, reset after completion
      const timer = setTimeout(() => {
        setDisplayFlip(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isFlipping])

  // Build class names based on state
  const cardClasses = [
    'card',
    isRevealed && 'revealed',
    isWinning && 'winning',
    isLosing && 'losing',
    displayFlip && 'flipping',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Suit symbols for visual display
  const suitSymbols: { [key: string]: string } = {
    H: '♥',
    D: '♦',
    C: '♣',
    S: '♠',
  }

  const suitColor: { [key: string]: string } = {
    H: '#ff10f0', // Magenta
    D: '#ff006e', // Red
    C: '#00f0ff', // Cyan
    S: '#00f0ff', // Cyan
  }

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role="button"
      aria-label={`${value} of ${suit}`}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick()
        }
      }}
    >
      {isBack ? (
        <div className="card-back">
          <div className="card-back-pattern" />
        </div>
      ) : (
        <div className="card-content">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${value}${suit}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: suitColor[suit] }}>
                {value}
              </div>
              <div style={{ fontSize: '28px', color: suitColor[suit] }}>
                {suitSymbols[suit]}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Card
