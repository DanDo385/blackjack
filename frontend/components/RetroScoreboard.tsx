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
 * - Color-coded stats (green for player winning, red for losing)
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

  // Determine colors based on who is "winning"
  const isPlayerWinning = netProfitLoss > dealerWinnings
  const playerStatColor = isPlayerWinning ? 'var(--neon-green)' : 'var(--neon-magenta)'
  const dealerStatColor = isPlayerWinning ? 'var(--neon-magenta)' : 'var(--neon-green)'
  const profitColor = netProfitLoss >= 0 ? 'var(--neon-green)' : 'var(--neon-magenta)'

  return (
    <div className="scoreboard">
      <div className="stat-box">
        <div className="stat-label">Player Winnings</div>
        <div
          className="stat-value"
          style={{
            color: playerStatColor,
            textShadow: `0 0 10px ${playerStatColor}`,
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
        <div className="stat-label" style={{ marginTop: '8px', fontSize: '11px' }}>
          True Count: {trueCount >= 0 ? '+' : ''}{trueCount.toFixed(1)}
        </div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Dealer Wins</div>
        <div
          className="stat-value"
          style={{
            color: dealerStatColor,
            textShadow: `0 0 10px ${dealerStatColor}`,
          }}
        >
          {dealerWinnings}
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
