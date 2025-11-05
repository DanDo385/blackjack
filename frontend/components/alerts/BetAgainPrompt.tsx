'use client'

import React from 'react'
import toast from 'react-hot-toast'

interface BetAgainPromptProps {
  toastId: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function BetAgainPrompt({ toastId, message, onConfirm, onCancel }: BetAgainPromptProps) {
  return React.createElement(
    'div',
    { className: 'flex flex-col gap-2' },
    React.createElement('div', null, message),
    React.createElement('div', { className: 'text-sm' }, 'Bet the same amount again?'),
    React.createElement(
      'div',
      { className: 'flex gap-2' },
      React.createElement(
        'button',
        {
          onClick: () => {
            toast.dismiss(toastId)
            onConfirm()
          },
          className: 'rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-green-700',
        },
        'OK'
      ),
      React.createElement(
        'button',
        {
          onClick: () => {
            toast.dismiss(toastId)
            onCancel()
          },
          className: 'rounded bg-gray-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-gray-700',
        },
        'Cancel'
      )
    )
  )
}
