'use client'
type Card = { label:string, value:string, sub?:string }
export default function StatsCards({ data }:{ data:{
  evPer100:number, sigmaPer100:number, skillScore:number,
  tiltIndex:number, luck10d:number, riskAdjDelta:number, returnAdjDelta:number
}}){
  const cards:Card[] = [
    { label:'EV / 100 hands', value:`${data.evPer100.toFixed(2)} %`, sub:'Expected value based on your decisions' },
    { label:'σ / 100 hands', value:`${data.sigmaPer100.toFixed(2)} %`, sub:'Volatility of outcomes' },
    { label:'Skill Score', value:`${data.skillScore.toFixed(1)}`, sub:'Discipline × Action Optimality' },
    { label:'Tilt Index', value:data.tiltIndex.toFixed(2), sub:'1.00 = max tilt (bad), 0.00 = zen' },
    { label:'10d Luck Realized', value:data.luck10d.toFixed(2), sub:'>0 good luck, <0 bad luck' },
    { label:'Risk Adj (luck=0.5)', value:`+${data.riskAdjDelta}`, sub:'when 10d_luck_realized = 0.5, risk +7' },
    { label:'Return Adj (luck=0.5)', value:`${data.returnAdjDelta}`, sub:'and return -6' },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c,i)=>(
        <div key={i} className="rounded-xl border p-4">
          <div className="text-sm opacity-70">{c.label}</div>
          <div className="text-2xl font-semibold">{c.value}</div>
          {c.sub && <div className="text-xs opacity-60 mt-1">{c.sub}</div>}
        </div>
      ))}
    </div>
  )
}


