'use client'

import React, { useState } from 'react'
import '../styles/neon.css'

interface Currency {
  symbol: string
  name: string
  color?: string
  decimals: number
}

interface CurrencySelectorProps {
  currencies: Currency[]
  selectedCurrency: string
  onCurrencyChange: (symbol: string) => void
  className?: string
}

/**
 * CurrencySelector Component - Dynamic currency switching with neon styling
 *
 * Features:
 * - Smooth transitions between currencies
 * - Active state with magenta glow
 * - Hover effects with glow expansion
 * - Supports multiple cryptocurrency and fiat currencies
 *
 * @param currencies - Array of available currencies
 * @param selectedCurrency - Currently selected currency symbol
 * @param onCurrencyChange - Callback when currency is selected
 * @param className - Additional CSS classes to apply
 */
export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  className = '',
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCurrencyClick = (symbol: string) => {
    if (symbol !== selectedCurrency) {
      setIsAnimating(true)
      onCurrencyChange(symbol)
      // Reset animation state after transition
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  return (
    <div className={`currency-selector ${className}`}>
      {currencies.map((currency) => (
        <button
          key={currency.symbol}
          className={`currency-btn ${selectedCurrency === currency.symbol ? 'active' : ''}`}
          onClick={() => handleCurrencyClick(currency.symbol)}
          aria-label={`Select ${currency.name}`}
          aria-pressed={selectedCurrency === currency.symbol}
        >
          <div className="currency-btn-content">
            <div className="currency-symbol">{currency.symbol}</div>
            <div className="currency-name">{currency.name}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

// Default cryptocurrency options
export const DEFAULT_CURRENCIES: Currency[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    color: '#00f0ff',
    decimals: 6,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    color: '#bf00ff',
    decimals: 18,
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    color: '#39ff14',
    decimals: 18,
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    color: '#ff006e',
    decimals: 6,
  },
]

export default CurrencySelector
