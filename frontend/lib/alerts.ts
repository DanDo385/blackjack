import toast from 'react-hot-toast'

// Nerdy blackjack statistical facts
const BLACKJACK_FACTS = [
  "The house edge in blackjack is typically around 0.5% with perfect basic strategy, making it one of the best casino games for players!",
  "A natural blackjack (Ace + 10-value card) occurs approximately 4.8% of the time in a standard 52-card deck.",
  "Card counting can reduce the house edge to negative values, meaning players can gain an advantage!",
  "The probability of getting 21 with your first two cards is exactly 4.826% in a single-deck game.",
  "In blackjack, the dealer has a 8.84% chance of busting when showing a 6, making it one of the best dealer cards to see.",
  "The optimal strategy was first calculated using computers in the 1950s - mathematicians like Edward Thorp revolutionized the game!",
  "Insurance bets in blackjack have a house edge of about 7.39%, making them statistically unfavorable despite seeming safe.",
  "In a 6-deck shoe, the probability of getting a blackjack is slightly lower (4.75%) than in a single deck due to card removal effects.",
  "The most common hand total in blackjack is 17, occurring about 13.8% of the time.",
  "Basic strategy can reduce the house edge from 2% to less than 0.5% - that's why it's called 'basic' strategy!",
  "The 'Million Dollar Blackjack' team won over $1 million in Vegas casinos using card counting before being banned.",
  "Dealer busts occur approximately 28.36% of the time when following standard house rules (hit on 16, stand on 17).",
  "The probability of getting 20 with your first two cards is 9.94%, making it the second most common strong hand after blackjack.",
  "Splitting pairs can significantly improve your odds - for example, splitting Aces increases your win probability from 8% to 51%!",
  "The Martingale betting system (doubling after losses) is mathematically flawed - it doesn't change the house edge, just the variance.",
]

// Get a random nerdy fact
function getRandomFact(): string {
  return BLACKJACK_FACTS[Math.floor(Math.random() * BLACKJACK_FACTS.length)]
}

// Alert types
export type AlertType = 
  | 'wallet_connected'
  | 'tokens_brought_to_table'
  | 'win'
  | 'loss'
  | 'cash_out'

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

// Store for bet again callbacks
let betAgainCallback: ((confirmed: boolean) => void) | null = null

// Set callback for bet again confirmation
export function setBetAgainCallback(callback: (confirmed: boolean) => void) {
  betAgainCallback = callback
}

// Clear callback
export function clearBetAgainCallback() {
  betAgainCallback = null
}

// Alert functions
export function showWalletConnectedAlert(address: string) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  toast.success(`Wallet connected! 🎉\n${shortAddress}`, {
    duration: 4000,
    icon: '🔗',
  })
}

export function showTokensBroughtToTableAlert(data: TokensBroughtData) {
  toast.success(
    `Tokens brought to table! 💰\n${data.amount} ${data.token}`,
    {
      duration: 4000,
      icon: '💵',
    }
  )
}

export function showWinAlert(data: WinLossAlertData, onBetAgain: () => void) {
  const message = `🎉 YOU WIN! 🎉\nYou won ${data.amount} ${data.token}!`
  
  if (data.canBetAgain && data.lastBetAmount) {
    // Show confirmation dialog for betting again
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div>{message}</div>
        <div className="text-sm">Bet the same amount again?</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              onBetAgain()
              betAgainCallback?.(true)
            }}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            OK
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              betAgainCallback?.(false)
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000, // Longer duration for user to decide
      icon: '🎊',
    })
  } else {
    toast.success(message, {
      duration: 5000,
      icon: '🎊',
    })
  }
}

export function showLossAlert(data: WinLossAlertData, onBetAgain: () => void) {
  const message = `💔 You lost ${data.amount} ${data.token}`
  
  if (data.canBetAgain && data.lastBetAmount) {
    // Show confirmation dialog for betting again
    toast((t) => (
      <div className="flex flex-col gap-2">
        <div>{message}</div>
        <div className="text-sm">Bet the same amount again?</div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t.id)
              onBetAgain()
              betAgainCallback?.(true)
            }}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            OK
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              betAgainCallback?.(false)
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 10000, // Longer duration for user to decide
      icon: '😔',
    })
  } else {
    toast.error(message, {
      duration: 5000,
      icon: '😔',
    })
  }
}

export function showCashOutAlert(amount: number, token: string) {
  const fact = getRandomFact()
  toast.success(
    `Thanks for playing! 🎰\n\nYou cashed out ${amount} ${token}\n\n💡 ${fact}`,
    {
      duration: 8000,
      icon: '🎲',
    }
  )
}

