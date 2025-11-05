'use client'

import '../styles/neon.css'

interface RetroScoreboardProps {
  trueCount: number
  shoePct: number
  playerWinnings?: number
  playerLosings?: number
  dealerWinnings?: number
}

/**
 * RetroScoreboard Component - Game statistics display with neon styling
 *
 * Features:
 * - Real-time card counting metrics (true count, shoe percentage)
 * - Player winnings and dealer wins tracking
 * - Color-coded stats (player wins: green, dealer wins: red, profit/loss: conditional)
 * - Futuristic neon glow effects
 * - Responsive grid layout
 *
 * @param trueCount - Running true count for card counting system
 * @param shoePct - Percentage of shoe dealt (0-100)
 * @param playerWinnings - Total player winnings amount
 * @param playerLosings - Total player losses amount
 * @param dealerWinnings - Number of hands dealer won
 */
export default function RetroScoreboard({
  trueCount,
  shoePct,
  playerWinnings = 0,
  playerLosings = 0,
  dealerWinnings = 0,
}: RetroScoreboardProps) {
  const netProfitLoss = playerWinnings - playerLosings

  // Color scheme: Player Winnings (green), Dealer Wins (red), Profit/Loss (conditional)
  const profitColor = netProfitLoss >= 0 ? 'var(--neon-green)' : 'var(--neon-magenta)'

  return (
    <div className="scoreboard">
      <div className="stat-box">
        <div className="stat-label">Player Winnings</div>
        <div
          className="stat-value"
          style={{
            color: 'var(--neon-green)',
            textShadow: '0 0 10px var(--neon-green)',
          }}
        >
          ${playerWinnings.toFixed(2)}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Profit / Loss</div>
        <div
          className="stat-value"
          style={{
            color: profitColor,
            textShadow: `0 0 10px ${profitColor}`,
          }}
        >
          {netProfitLoss >= 0 ? '+' : ''}${netProfitLoss.toFixed(2)}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Dealer Wins</div>
        <div
          className="stat-value"
          style={{
            color: 'var(--neon-magenta)',
            textShadow: '0 0 10px var(--neon-magenta)',
          }}
        >
          ${dealerWinnings.toFixed(2)}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">True Count</div>
        <div
          className="stat-value"
          style={{
            color: 'var(--neon-yellow)',
            textShadow: '0 0 10px var(--neon-yellow)',
          }}
        >
          {trueCount >= 0 ? '+' : ''}{trueCount.toFixed(1)}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Shoe Used</div>
        <div
          className="stat-value"
          style={{
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan)',
          }}
        >
          {shoePct}%
        </div>
      </div>
    </div>
  )
}
