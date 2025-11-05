'use client'
import Navbar from '@/components/Navbar'
import TableCanvas from '@/components/TableCanvas'
import { AlertBus } from '@/components/AlertBus'
import PlayBetControls from '@/components/PlayBetControls'
import GameActions from '@/components/GameActions'

export default function Play(){
  return (
    <>
      <Navbar/>
      <AlertBus/>
      <main className="p-4">
        <TableCanvas/>
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


