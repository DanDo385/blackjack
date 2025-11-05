'use client'

import React from 'react'

/**
 * ReDealPrompt Component
 *
 * Displays a prompt after a hand ends asking if the player wants to deal again
 * with the same wager amount.
 */

interface ReDealPromptProps {
  isOpen: boolean
  lastWager: number
  token: string
  onAccept: (amount: number) => void
  onDecline: () => void
}

export default function ReDealPrompt({ isOpen, lastWager, token, onAccept, onDecline }: ReDealPromptProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-white">Re-Deal?</h2>
        <p className="text-neutral-300">
          Deal another hand with the same wager: <span className="font-mono text-cyan-400">{lastWager.toFixed(6)} {token}</span>
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDecline}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white font-semibold transition"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(lastWager)}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
