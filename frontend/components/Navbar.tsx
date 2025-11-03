'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

/**
 * Navbar - Top navigation with wallet connection
 *
 * Features:
 * - Logo linking to home
 * - RainbowKit wallet connect button
 * - Menu for navigation links
 */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch with wallet components
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-black text-white sticky top-0 z-50 border-b border-neutral-800">
      {/* Logo */}
      <Link href="/" className="font-bold tracking-wide text-lg">
        YOLO ♠︎
      </Link>

      {/* Wallet Connect Button (center-right) */}
      <div className="flex-1 flex justify-center mr-4">
        {mounted ? <ConnectButton /> : <div className="h-10 w-32" />}
      </div>

      {/* Menu Button */}
      <button onClick={() => setOpen((x) => !x)} aria-label="menu" className="relative">
        <Menu size={24} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-2 top-14 bg-white text-black rounded-xl shadow-xl p-3 w-60 z-50">
          <ul className="space-y-2">
            <li>
              <Link href="/account" onClick={() => setOpen(false)}>
                Account Summary
              </Link>
            </li>
            <li>
              <Link href="/transactions" onClick={() => setOpen(false)}>
                Transactions
              </Link>
            </li>
            <li>
              <Link href="/docs" onClick={() => setOpen(false)}>
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/faq" onClick={() => setOpen(false)}>
                FAQ?
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}


