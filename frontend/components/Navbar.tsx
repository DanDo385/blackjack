'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

export default function Navbar(){
  const [open,setOpen]=useState(false)
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-black text-white sticky top-0 z-50">
      <Link href="/" className="font-bold tracking-wide">YOLO ♠︎</Link>
      <button onClick={()=>setOpen(x=>!x)} aria-label="menu"><Menu /></button>
      {open && (
        <div className="absolute right-2 top-14 bg-white text-black rounded-xl shadow-xl p-3 w-60">
          <ul className="space-y-2">
            <li><Link href="/account">Account Summary</Link></li>
            <li><Link href="/transactions">Transactions</Link></li>
            <li><Link href="/docs">Documentation</Link></li>
            <li><Link href="/faq">FAQ?</Link></li>
          </ul>
        </div>
      )}
    </div>
  )
}


