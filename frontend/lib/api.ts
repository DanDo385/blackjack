export async function getEngineState(){
  const base = process.env.NEXT_PUBLIC_API_BASE
  try {
    const r = await fetch(`${base}/api/engine/state`, { cache:'no-store' })
    return await r.json()
  } catch {
    return { trueCount:1.2, shoePct:55, anchor:100, spreadNum:4, lastBet:120, growthCapBps:3300, tableMin:5, tableMax:5000 }
  }
}


