'use client'
import Navbar from '@/components/Navbar'
import TableCanvas from '@/components/TableCanvas'
import { AlertBus } from '@/components/AlertBus'
import BetControls from '@/components/BetControls'
import { useStore } from '@/lib/store'

export default function Play(){
  const { chipsAtTable, selectedToken } = useStore()

  return (
    <>
      <Navbar/>
      <AlertBus/>
      <main className="p-4">
        <TableCanvas/>

        {/* Chips at the Table - Prominent display below gameboard */}
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
          <BetControls/>
        </div>
      </main>
    </>
  )
}
