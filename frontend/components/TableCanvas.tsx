'use client'
import Image from 'next/image'
import RetroScoreboard from './RetroScoreboard'
import BetControls from './BetControls'
import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useGameOutcomes, BetAgainHandler } from '@/lib/gameOutcomes'

export default function TableCanvas(){
  const { trueCount, shoePct, anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax } = useStore()
  const [nextIdx, setNextIdx] = useState(0) // 0..3 for 4 card slots

  // Track game outcomes for win/loss alerts
  useGameOutcomes()

  useEffect(()=>{
    const id = setInterval(()=> setNextIdx(n => (n+1)%4), 250)
    return ()=>clearInterval(id)
  },[])

  const handleDeal = () => {
    // This would trigger the deal action - for now just a placeholder
    // In real implementation, this would call the backend to start a new hand
    console.log('Deal button triggered')
  }

  const dealer = ['/cards/10-H.png','/cards/A-S.png']
  const player = ['/cards/9-C.png','/cards/7-D.png']
  const slots = [
    { src: dealer[0], label:'D1' },
    { src: player[0], label:'P1' },
    { src: dealer[1], label:'D2' },
    { src: player[1], label:'P2' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <BetAgainHandler onDeal={handleDeal} />
      <RetroScoreboard trueCount={trueCount} shoePct={shoePct} />

      <div className="rounded-2xl overflow-hidden border border-neutral-800">
        <Image alt="board" src="/boards/dealerjohhny5.png" width={1800} height={900} className="w-full h-auto"/>
      </div>

      {/* Card row */}
      <div className="grid grid-cols-4 gap-4 mt-4 justify-items-center">
        {slots.map((s,i)=>(
          <div key={i} className={`slot ${i===nextIdx ? 'next' : ''} p-2`}>
            <Image alt={s.label} src={s.src} width={300} height={420} className="card"/>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <BetControls {...{anchor, spreadNum, lastBet, growthCapBps, tableMin, tableMax}} />
      </div>
    </div>
  )
}


