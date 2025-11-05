'use client'
import Navbar from '@/components/layout/Navbar'
import TableCanvas from '@/components/game/TableCanvas'
import { AlertBus } from '@/components/alerts/AlertBus'
import PlayBetControls from '@/components/game/PlayBetControls'
import GameActions from '@/components/game/GameActions'
import { useStore } from '@/lib/store'
import { useEffect } from 'react'

export default function Play(){
  const { chipsAtTable, selectedToken, setWager, setWagerStep, wagerStep } = useStore()

  // Initialize wager to 10% of chipsAtTable on mount if chipsAtTable > 0
  useEffect(() => {
    if (chipsAtTable > 0 && wagerStep === 10) {
      const initialWager = Math.max(1, Math.round((chipsAtTable * 0.1) / 10) * 10) // Round to nearest 10
      setWager(initialWager)
    }
  }, [chipsAtTable, setWager, wagerStep, setWagerStep])

  // Ensure wagerStep defaults to 10 if not set
  useEffect(() => {
    if (wagerStep === 1) {
      setWagerStep(10)
    }
  }, [wagerStep, setWagerStep])

  return (
    <>
      <Navbar/>
      <AlertBus/>
      <main className="p-4">
        {/* Display chips at table at top */}
        {chipsAtTable > 0 && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-900/30 border border-green-600 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-green-300">Chips at Table</div>
                <div className="text-2xl font-mono font-bold text-green-400">
                  {chipsAtTable.toFixed(4)} {selectedToken || 'ETH'}
                </div>
              </div>
            </div>
          </div>
        )}
        <TableCanvas/>

        {/* Chips at the Table - Prominent display under gameboard */}
        {chipsAtTable > 0 && (
          <div className="max-w-6xl mx-auto mt-4">
            <div className="p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-600 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-sm font-semibold text-green-300 uppercase tracking-wide mb-1">
                  Chips at the Table
                </div>
                <div className="text-4xl font-bold font-mono text-green-400">
                  {chipsAtTable.toFixed(6)} {selectedToken}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <PlayBetControls/>
        </div>
        <div className="mt-6">
          <GameActions/>
        </div>
      </main>
    </>
  )
}


