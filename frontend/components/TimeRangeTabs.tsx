'use client'
const ranges = ['1W','1M','3M','6M','1Y','2Y','3Y','Custom'] as const
export default function TimeRangeTabs({onPick}:{onPick:(r:string)=>void}){
  return (
    <div className="flex gap-2 flex-wrap my-3">
      {ranges.map(r=>
        <button key={r} onClick={()=>onPick(r)} className="px-3 py-1 rounded-full border">{r}</button>
      )}
    </div>
  )
}
