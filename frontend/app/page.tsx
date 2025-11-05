import Navbar from '@/components/layout/Navbar'
import { AlertBus } from '@/components/alerts/AlertBus'
import Image from 'next/image'
import Link from 'next/link'

export default function Home(){
  return (
    <>
      <Navbar />
      <AlertBus />
      <main className="max-w-6xl mx-auto p-4">
        <div className="relative rounded-2xl overflow-hidden border">
          <Image src="/boards/dealerjohhny5.png" alt="YOLO Lobby" width={1800} height={900} className="w-full h-auto object-cover"/>
          <div className="absolute inset-0 bg-black/40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold">YOLO Blackjack</h1>
              <p className="opacity-85">Club chaos × casino precision. Provably fair. Multicoin. Static rules.</p>
              <Link href="/checkin" className="inline-block mt-3 px-4 py-2 rounded-xl bg-white text-black">Check In</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}


