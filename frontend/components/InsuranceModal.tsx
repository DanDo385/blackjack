'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { postJSON } from '@/lib/api'
import { useStore } from '@/lib/store'

/**
 * InsuranceModal Component
 *
 * Shows insurance prompt when dealer shows an Ace
 * Only renders when insurance is available
 */
export default function InsuranceModal() {
  const { dealerHand, handId, chipsAtTable } = useStore()
  const [showModal, setShowModal] = useState(false)

  // Check if dealer's first card is an Ace
  useEffect(() => {
    if (dealerHand.length > 0 && handId) {
      // Check if dealer's face-up card is an Ace
      const dealerFirstCard = dealerHand[0]
      const isAce = dealerFirstCard?.includes('A-') || dealerFirstCard?.includes('A-C') || 
                    dealerFirstCard?.includes('A-D') || dealerFirstCard?.includes('A-H') || 
                    dealerFirstCard?.includes('A-S')
      
      if (isAce && !showModal) {
        setShowModal(true)
      }
    }
  }, [dealerHand, handId, showModal])

  const handleInsurance = async (buyInsurance: boolean) => {
    if (!handId) return

    try {
      await postJSON('/api/game/insurance', {
        handId,
        buyInsurance,
        amount: buyInsurance ? chipsAtTable * 0.5 : 0, // Insurance is typically half the bet
      })

      if (buyInsurance) {
        toast.success('Insurance purchased')
      } else {
        toast('Insurance declined')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Insurance action failed'
      toast.error(`Insurance failed: ${message}`)
    } finally {
      setShowModal(false)
    }
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-2xl p-6 max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Dealer Shows an Ace</h2>
        <p className="text-gray-700 mb-6">
          The dealer is showing an Ace. Would you like to buy insurance?
          <br />
          <span className="text-sm text-gray-500">
            Insurance costs {chipsAtTable * 0.5} {useStore.getState().tokenInPlay} and pays 2:1 if dealer has blackjack.
          </span>
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleInsurance(true)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Buy Insurance
          </button>
          <button
            onClick={() => handleInsurance(false)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

