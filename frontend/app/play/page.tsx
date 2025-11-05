'use client'
import Navbar from '@/components/Navbar'
import TableCanvas from '@/components/TableCanvas'
import { AlertBus } from '@/components/alerts/AlertBus'
import PlayBetControls from '@/components/PlayBetControls'

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
      </main>
    </>
  )
}


