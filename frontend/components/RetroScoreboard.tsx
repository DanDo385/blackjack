'use client'
import '@/styles/scoreboard.css'

interface RetroScoreboardProps {
  trueCount: number
  shoePct: number
  playerWinnings: number
  playerLosses: number
  dealerWins: number
}

export default function RetroScoreboard({
  trueCount,
  shoePct,
  playerWinnings,
  playerLosses,
  dealerWins,
}: RetroScoreboardProps) {
  const netProfitLoss = playerWinnings - playerLosses

  // Determine colors based on who is "winning"
  // We'll compare player's net winnings against the number of dealer wins as a simple metric
  const isPlayerWinning = netProfitLoss > dealerWins
  const playerScoreColor = isPlayerWinning ? 'led-green' : 'led-red'
  const dealerScoreColor = isPlayerWinning ? 'led-red' : 'led-green'

  return (
    <div className="scoreboard">
      <div className="scoreboard-grid">
        <div className="text-center">
          <div className="meta">Player Winnings</div>
          <div className={`led ${playerScoreColor}`}>
            {playerWinnings.toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="meta">Profit / Loss</div>
          <div className="led led-amber">
            {netProfitLoss >= 0 ? `+${netProfitLoss.toFixed(2)}` : netProfitLoss.toFixed(2)}
          </div>
          <div className="meta" style={{ marginTop: 6 }}>
            True Count: {trueCount >= 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="meta">Dealer Wins</div>
          <div className={`led ${dealerScoreColor}`}>
            {dealerWins}
          </div>
        </div>
      </div>
    </div>
  )
}
