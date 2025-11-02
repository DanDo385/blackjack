'use client'

import toast, { Toast } from 'react-hot-toast'

type BetAgainToastOptions = {
  message: string
  icon: string
  onConfirm: () => void
  onCancel: () => void
}

type BetAgainToastContentProps = {
  toastRef: Toast
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function BetAgainToastContent({ toastRef, message, onConfirm, onCancel }: BetAgainToastContentProps) {
  return (
    <div
      className={`rounded-md bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 ${
        toastRef.visible ? 'animate-enter' : 'animate-leave'
      }`}
    >
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-900">{message}</span>
        <div className="text-xs text-gray-600">Bet the same amount again?</div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded bg-black px-3 py-1 text-sm font-semibold text-white"
            onClick={() => {
              toast.dismiss(toastRef.id)
              onConfirm()
            }}
          >
            Bet Again
          </button>
          <button
            type="button"
            className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800"
            onClick={() => {
              toast.dismiss(toastRef.id)
              onCancel()
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export function showBetAgainToast({ message, icon, onConfirm, onCancel }: BetAgainToastOptions) {
  toast(
    (toastRef) => (
      <BetAgainToastContent
        toastRef={toastRef}
        message={message}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    ),
    {
      duration: 10_000,
      icon,
    }
  )
}
