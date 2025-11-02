import toast from 'react-hot-toast'
import React from 'react'
import { BetAgainPrompt } from '@/components/BetAgainPrompt'

// ============================================================================
// Constants
// ============================================================================

const BLACKJACK_FACTS = [
  'The house edge in blackjack is typically around 0.5% with perfect basic strategy, making it one of the best casino games for players!',
  'A natural blackjack (Ace + 10-value card) occurs approximately 4.8% of the time in a standard 52-card deck.',
  'Card counting can reduce the house edge to negative values, meaning players can gain an advantage!',
  'The probability of getting 21 with your first two cards is exactly 4.826% in a single-deck game.',
  "In blackjack, the dealer has a 8.84% chance of busting when showing a 6, making it one of the best dealer cards to see.",
  'The optimal strategy was first calculated using computers in the 1950s - mathematicians like Edward Thorp revolutionized the game!',
  'Insurance bets in blackjack have a house edge of about 7.39%, making them statistically unfavorable despite seeming safe.',
  'In a 6-deck shoe, the probability of getting a blackjack is slightly lower (4.75%) than in a single deck due to card removal effects.',
  'The most common hand total in blackjack is 17, occurring about 13.8% of the time.',
  "Basic strategy can reduce the house edge from 2% to less than 0.5% - that's why it's called 'basic' strategy!",
  "The 'Million Dollar Blackjack' team won over $1 million in Vegas casinos using card counting before being banned.",
  'Dealer busts occur approximately 28.36% of the time when following standard house rules (hit on 16, stand on 17).',
  'The probability of getting 20 with your first two cards is 9.94%, making it the second most common strong hand after blackjack.',
  'Splitting pairs can significantly improve your odds - for example, splitting Aces increases your win probability from 8% to 51%!',
  "The Martingale betting system (doubling after losses) is mathematically flawed - it doesn't change the house edge, just the variance.",
]

// ============================================================================
// Type Definitions
// ============================================================================

export type AlertType =
  | 'wallet_connected'
  | 'tokens_brought_to_table'
  | 'win'
  | 'loss'
  | 'cash_out'
  | 'shuffling'

export type WinLossAlertData = {
  amount: number
  token: string
  canBetAgain: boolean
  lastBetAmount?: number
}

export type TokensBroughtData = {
  amount: number
  token: string
}

// ============================================================================
// Callback Management (for bet-again functionality)
// ============================================================================

type BetAgainCallback = (confirmed: boolean) => void
let betAgainCallback: BetAgainCallback | null = null

export function setBetAgainCallback(callback: BetAgainCallback) {
  betAgainCallback = callback
}

export function clearBetAgainCallback() {
  betAgainCallback = null
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatAmount = (amount: number, token: string) =>
  `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${token}`

const randomFact = () => BLACKJACK_FACTS[Math.floor(Math.random() * BLACKJACK_FACTS.length)]

const showBetAgainPrompt = ({
  message,
  onConfirm,
  icon,
}: {
  message: string
  onConfirm: () => void
  icon: string
}) =>
  toast(
    (t: any) =>
      React.createElement(BetAgainPrompt, {
        toastId: t.id,
        message,
        onConfirm: () => {
          onConfirm()
          betAgainCallback?.(true)
        },
        onCancel: () => {
          betAgainCallback?.(false)
        },
      }),
    {
      duration: 10_000,
      icon,
    }
  )

// ============================================================================
// Alert Display Functions
// ============================================================================

export function showWalletConnectedAlert(address: string) {
  const shortAddress = `${address.slice(0, 6)}…${address.slice(-4)}`
  toast.success(`Wallet connected! 🎉\n${shortAddress}`, {
    duration: 4_000,
    icon: '🔗',
  })
}

export function showTokensBroughtToTableAlert(data: TokensBroughtData) {
  toast.success(`Tokens brought to table! 💰\n${formatAmount(data.amount, data.token)}`, {
    duration: 4_000,
    icon: '💵',
  })
}

export function showWinAlert(data: WinLossAlertData, onBetAgain: () => void) {
  const message = `🎉 YOU WIN! 🎉\nYou won ${formatAmount(data.amount, data.token)}!`

  if (data.canBetAgain && data.lastBetAmount) {
    showBetAgainPrompt({ message, onConfirm: onBetAgain, icon: '🎊' })
    return
  }

  toast.success(message, {
    duration: 5_000,
    icon: '🎊',
  })
}

export function showLossAlert(data: WinLossAlertData, onBetAgain: () => void) {
  const message = `💔 You lost ${formatAmount(data.amount, data.token)}`

  if (data.canBetAgain && data.lastBetAmount) {
    showBetAgainPrompt({ message, onConfirm: onBetAgain, icon: '😔' })
    return
  }

  toast.error(message, {
    duration: 5_000,
    icon: '😔',
  })
}

export function showCashOutAlert(amount: number, token: string) {
  toast.success(`Thanks for playing! 🎰\nYou cashed out ${formatAmount(amount, token)}\n\n💡 ${randomFact()}`, {
    duration: 8_000,
    icon: '🎲',
  })
}

export function showShufflingAlert() {
  toast.loading('Deck is being shuffled... 🃏', {
    duration: 3_000,
    icon: '🔄',
  })
}

export function showShuffledAlert() {
  toast.success('Deck has been shuffled! 🃏', {
    duration: 4_000,
    icon: '🎲',
  })
}

/**
 * Trigger a cash out alert
 * Can be called manually (from button click) or from withdrawal detection
 */
export function triggerCashOutAlert(amount: number, token: string) {
  showCashOutAlert(amount, token)
}
