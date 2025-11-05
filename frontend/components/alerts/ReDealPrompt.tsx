'use client'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

/**
 * ReDealPrompt Component
 *
 * Modal that appears after a hand ends, asking if the user wants to re-deal with the same wager
 *
 * Props:
 * - isOpen: boolean - controls modal visibility
 * - lastWager: number - the previous wager amount
 * - token: string - token symbol
 * - onAccept: (amount: number) => void - called when user accepts re-deal
 * - onDecline: () => void - called when user declines or dismisses
 */
interface ReDealPromptProps {
  isOpen: boolean
  lastWager: number
  token: string
  onAccept: (amount: number) => void
  onDecline: () => void
}

export default function ReDealPrompt({
  isOpen,
  lastWager,
  token,
  onAccept,
  onDecline,
}: ReDealPromptProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDecline()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onDecline])

  if (!isOpen) return null

  const handleAccept = () => {
    toast.success(`Re-dealing with ${lastWager} ${token}`)
    onAccept(lastWager)
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 z-40 animate-in fade-in duration-200"
        onClick={onDecline}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-green-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎰</div>
            <h2 className="text-2xl font-bold text-white mb-2">Hand Complete!</h2>
            <p className="text-neutral-300">
              Re-deal with the same wager?
            </p>
          </div>

          {/* Wager display */}
          <div className="p-4 bg-neutral-950 border border-neutral-700 rounded-xl mb-6">
            <div className="text-center">
              <div className="text-sm text-neutral-400 mb-1">Previous Wager</div>
              <div className="text-2xl font-bold text-white font-mono">
                {lastWager.toFixed(6)} <span className="text-green-400">{token}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition transform active:scale-95"
            >
              Re-deal
            </button>
            <button
              onClick={onDecline}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-3 rounded-xl font-semibold transition transform active:scale-95"
            >
              No thanks
            </button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-neutral-500 text-center mt-4">
            Declining will keep {lastWager} {token} as your default wager
          </p>
        </div>
      </div>
    </>
  )
}

