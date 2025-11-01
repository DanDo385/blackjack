'use client'
import '@/styles/scoreboard.css'

export default function RetroScoreboard({ trueCount, shoePct }:{
  trueCount:number; shoePct:number;
}){
  return (
    <div className="scoreboard">
      <div className="scoreboard-grid">
        <div className="text-center">
          <div className="meta">Player</div>
          <div className="led led-amber">YOU</div>
        </div>
        <div className="text-center">
          <div className="meta">True Count (DEV)</div>
          <div className="led">{trueCount >= 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}</div>
          <div className="meta" style={{marginTop:6}}>Shoe dealt: {Math.round(shoePct)}%</div>
        </div>
        <div className="text-center">
          <div className="meta">Dealer</div>
          <div className="led led-red">HOUSE</div>
        </div>
      </div>
    </div>
  )
}


