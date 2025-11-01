'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function BetControls({
  anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax
}:{
  anchor:number; spreadNum:number; lastBet:number; growthCapBps:number; tableMin:number; tableMax:number;
}){
  const baseMin = Math.max(anchor / spreadNum, tableMin)
  const baseMax = Math.min(anchor * spreadNum, tableMax)
  const growthMax = lastBet ? lastBet * (1 + growthCapBps/10000) : baseMax
  const allowedMax = Math.min(baseMax, growthMax)
  const step = Math.max(1, Math.round(anchor * 0.05))

  const [val,setVal]=useState(Math.round(anchor))

  const clamp = (x:number)=> Math.max(baseMin, Math.min(allowedMax, x))
  const lobbyStake = 2_000 // example user lobby buy-in (replace from API)
  const overHalf = val >= lobbyStake/2

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div>
        <label className="text-sm font-medium">Bet Amount</label>
        <input type="number" value={val} step={step}
          onChange={e=>setVal(Number(e.target.value))}
          className="border px-3 py-2 rounded-md w-48"/>
        <div className="text-xs mt-1 opacity-70">Range: {baseMin.toFixed(0)} – {allowedMax.toFixed(0)} (step {step})</div>
      </div>

      <button
        onClick={()=>{
          const bet = clamp(val)
          if (bet!==val) toast('auto-adjusted to legal size', { icon:'⚠️' })
          if (overHalf) toast(`Dramatic wager: ${bet} (≥ 50% of lobby stake) 🎭`, { icon:'🔥' })
          // call local backend for dev
          fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/engine/bet`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ amount: bet })
          }).then(()=> toast.success(`Bet placed: ${bet}`))
        }}
        className="px-5 py-2 rounded-xl bg-black text-white"
      >Place Bet</button>
    </div>
  )
}


