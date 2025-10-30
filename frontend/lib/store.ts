import { create } from 'zustand'
type S = {
  trueCount:number; shoePct:number;
  anchor:number; spreadNum:number; lastBet:number; growthCapBps:number; tableMin:number; tableMax:number;
}
export const useStore = create<S>(()=>({
  trueCount: 1.4, shoePct: 62,
  anchor: 100, spreadNum: 4, lastBet: 120, growthCapBps: 3300, tableMin: 5, tableMax: 5000,
}))


