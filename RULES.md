# YOLO Blackjack: Complete Non-Technical Guide

## Table of Contents

1. [What is This Project?](#what-is-this-project)
2. [What is Blockchain?](#what-is-blockchain)
3. [The Problem We're Solving](#the-problem-were-solving)
4. [How YOLO Blackjack Works](#how-yolo-blackjack-works)
5. [The Three Main Parts](#the-three-main-parts)
6. [How Everything Talks to Each Other](#how-everything-talks-to-each-other)
7. [The Complete Workflow](#the-complete-workflow)
8. [Key Technology Concepts](#key-technology-concepts)
9. [Why This Approach?](#why-this-approach)
10. [Project Flow Diagram](#project-flow-diagram)

---

## What is This Project?

Imagine you want to play blackjack online, but you're worried: **Can I trust that the deck is being shuffled fairly? Can I trust that I'm not being cheated?**

**YOLO Blackjack** solves this problem. It's an online blackjack game where:

- **You play blackjack** against a dealer
- **Your bets are stored on blockchain** — a public ledger anyone can audit
- **The card dealing is provably fair** — using mathematical randomness that no one can manipulate
- **Your winnings are automatic** — no company can suddenly change the rules or refuse to pay you
- **You can play with different cryptocurrencies** — Bitcoin, Ethereum, Stablecoin, etc.

Think of it like this:

| Traditional Poker Site | YOLO Blackjack |
|---|---|
| You trust the company to be fair | The code and blockchain prove fairness |
| Server secretly controls the outcome | The deck shuffle is mathematically random |
| Company can change rules anytime | Rules are locked in the smart contract |
| You send money to their bank account | Your money lives in a smart contract |

---

## What is Blockchain?

Before explaining YOLO Blackjack, you need to understand what blockchain is.

### The Problem Blockchain Solves

Imagine you and your friend want to share money, but you don't trust each other. Normally you'd hire a bank as the "middleman" to keep score:

- **You**: I'm sending my friend $100
- **Bank**: Okay, I recorded that. Your balance goes down $100, their balance goes up $100
- **You both**: We trust the bank to keep track honestly

**But what if:**

- The bank makes a mistake?
- The bank takes money for themselves?
- The bank suddenly closes?

### Blockchain: A Public Ledger Everyone Can See

Blockchain is like a **public notebook that everyone has a copy of**:

1. **Public** — Everyone can see every transaction ever made (though not who made it)
2. **Transparent** — You can trace the money step-by-step
3. **Immutable** — Once written, history can't be changed
4. **Decentralized** — No single person or company controls it

Think of it like this:

**Traditional Bank:**

```text
┌─────────────────────┐
│    The Bank         │
│  (one authority)    │
│                     │
│ My Account: $1,000  │
│ Your Account: $500  │
└─────────────────────┘
     ↑
  You trust it
```

**Blockchain:**

```text
┌────────────────────────────────────────────┐
│         The Blockchain (Ledger)            │
│  (thousands of computers keep copies)      │
│                                            │
│ Transaction 1: 0x1234 sent 100 coins      │
│ Transaction 2: 0x5678 sent 50 coins       │
│ Transaction 3: 0x1234 received 75 coins   │
└────────────────────────────────────────────┘
  ↑              ↑              ↑
You have    Your friend   Random person
a copy      has a copy    has a copy
```

### Cryptocurrencies: Digital Money on Blockchain

A **cryptocurrency** is digital money that lives on a blockchain. Instead of a bank keeping track of your balance, the blockchain does:

- **Bitcoin** — The first cryptocurrency (created 2008)
- **Ethereum** — A blockchain that lets you run programs (smart contracts)
- **USDC** — A stablecoin (always worth $1, backed by real dollars)

### Base: A Blockchain Layer Built on Ethereum

In this project, we use **Base**, which is:

- A smaller blockchain built on top of Ethereum
- Faster and cheaper than Ethereum
- Still secure and trustworthy
- Perfect for gaming applications like blackjack

Think of it like this:

```text
Layer 1 (The Main Highway): Ethereum
    ↓
Layer 2 (The Fast Lane): Base
    ↓
YOLO Blackjack (One App Using Base)
```

---

## The Problem We're Solving

### Problem 1: Unfair Shuffling

**In a traditional online casino:**

```text
The Casino Server
    ↓
(secretly decides the outcome)
    ↓
Shows you the "random" cards
    ↓
You lose (and you can never prove the deck wasn't fair)
```

**With YOLO Blackjack:**

```text
You + Other Players
    ↓
Cryptographic Randomness (mathematical randomness)
    ↓
No one can predict or manipulate it
    ↓
Cards dealt fairly (everyone can verify)
```

Imagine shuffling a deck of cards:

- **Casino control**: The casino "shuffles" secretly, then shows you cards. How do you know it wasn't rigged?
- **Blockchain way**: The shuffle happens using math so complex that even the casino can't cheat. Everyone can see the math being done.

### Problem 2: Untrustworthy Rules

**Traditional casino:**

- The casino decides payouts (blackjack pays 2:1, or maybe 3:2?)
- The casino can change the rules anytime
- The casino can add hidden fees

**YOLO Blackjack:**

- The rules are written in a **smart contract** (code on blockchain)
- The rules can never change (they're locked in)
- Anyone can read the code and verify what the payouts are
- No hidden fees

### Problem 3: Money You Can't Trust

**Traditional casino:**

- You send them money via bank
- You get casino chips
- You have to trust they'll let you cash out
- They might freeze your account

**YOLO Blackjack:**

- Your money lives in a smart contract
- Winning payouts are automatic (code, not human decision)
- You always control your money
- No one can freeze your account

---

## How YOLO Blackjack Works

### The High-Level Concept

Here's the simplest way to explain it:

**You want to play blackjack and bet $100.**

1. **You connect your wallet** (like a digital purse with your money)
2. **You place a bet** ($100 goes into a smart contract on blockchain)
3. **The dealer and you get 2 cards each**
4. **You decide: hit, stand, double down, or split**
5. **The dealer plays by house rules** (hits on 16, stands on 17)
6. **Someone wins** (you beat the dealer, dealer beats you, or push/tie)
7. **Winnings are automatic** (smart contract instantly pays you)
8. **The whole thing is recorded** on the blockchain forever

**The key difference from a casino:**

- Every step is **transparent**
- The cards are dealt using **provably fair randomness**
- Your money is **always in your control** (in the smart contract)
- No one can **cheat or change the rules**

---

## The Three Main Parts

YOLO Blackjack has **three parts that work together**:

### Part 1: The Smart Contract (The Rules & Money Holder)

**What it is:** A program that lives on the blockchain

**What it does:**

- Holds players' money securely
- Enforces the blackjack rules
- Calculates payouts
- Records every hand in history

**Analogy:** Think of it like a vending machine for blackjack:

- You put money in (smart contract holds it)
- The machine (smart contract) decides the outcome
- If you win, it automatically gives you money
- Everyone can see inside the machine and verify it works fairly

**Key Smart Contracts:**

1. **Factory** — Creates new blackjack tables
   - Like a factory that produces tables
   - Each table is a separate game

2. **Table** — The actual blackjack game
   - Holds player bets
   - Tracks hand history
   - Enforces wagering rules
   - Sends payouts to winners

3. **Treasury** — Manages the casino's money
   - Holds the house bankroll
   - Tracks profits/losses
   - Manages reserves

### Part 2: The Backend Server (The Dealer & Database)

**What it is:** A Go program running on a computer somewhere

**What it does:**

- Manages the game state (what card is next? whose turn?)
- Deals cards fairly
- Keeps score
- Talks to both the smart contracts and the website

**Analogy:** Think of it like the dealer in a real casino:

- The smart contract is the rules and the money
- The backend server is the **human dealer** who actually runs the game
- The server follows the rules set by the smart contract

**The Backend Has Two Databases:**

1. **PostgreSQL** — The permanent record
   - Stores all game history
   - Stores player statistics
   - Stores treasury positions
   - This data never disappears

2. **Redis** — The fast cache
   - Stores current game state
   - Caches popular queries
   - Makes the app fast
   - Data can expire (it's okay, it's just a speed boost)

**Analogy:**

- **PostgreSQL** = A leather-bound book where everything is recorded permanently
- **Redis** = A sticky note pad where you write the stuff you need right now

### Part 3: The Website (What You See)

**What it is:** A Next.js website (the frontend)

**What it does:**

- Shows you the blackjack table
- Lets you place bets
- Shows your cards
- Displays your stats and history
- Connects your wallet to the smart contract

**Analogy:** This is the casino floor:

- You walk in and see the table
- You decide to play
- You watch the cards come out
- You see the payouts

---

## How Everything Talks to Each Other

This is the most important part to understand.

### The Communication Paths

```text
┌─────────────────────────────────────────────────────────────┐
│                     YOUR COMPUTER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Website (Next.js Frontend)                       │  │
│  │  • Shows the blackjack table                         │  │
│  │  • Gets your clicks                                  │  │
│  │  • Displays results                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│                  (HTTP/HTTPS requests)                       │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    THE GO BACKEND SERVER                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Dealer Logic                                     │  │
│  │  • Shuffles deck fairly                              │  │
│  │  • Deals cards                                       │  │
│  │  • Calculates payouts                                │  │
│  │  • Keeps game state                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Database Managers                                │  │
│  │  • PostgreSQL: Permanent records                      │  │
│  │  • Redis: Fast cached data                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
                  (REST API calls)
┌─────────────────────────────────────────────────────────────┐
│                  THE BLOCKCHAIN (Base)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Smart Contracts                                  │  │
│  │  • Factory: Creates tables                           │  │
│  │  • Table: Holds money, enforces rules                │  │
│  │  • Treasury: Manages house bankroll                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  • Records every transaction permanently                    │
│  • Everyone can verify fairness                             │
│  • No one can change the rules                              │
└─────────────────────────────────────────────────────────────┘
```

### What Happens at Each Step

**When you place a bet of $100:**

```text
1. You click "Place Bet" on the website
   ↓
2. Website: "I'm placing a $100 bet"
   ↓
3. Your wallet: "Is $100 okay to send?" (You approve)
   ↓
4. Blockchain: "Transaction recorded. Money moved into the Table contract"
   ↓
5. Backend server watches the blockchain: "A new bet came in!"
   ↓
6. Backend: "Okay, shuffling the deck and dealing cards..."
   ↓
7. Backend talks to the Table contract: "Here are the deal cards"
   ↓
8. Table contract: "Updating the hand record"
   ↓
9. Backend tells the website: "Here are your cards"
   ↓
10. Website shows you: King of Hearts + 7 of Diamonds = 17
```

**When you win:**

```text
1. You click "Stand"
   ↓
2. Dealer plays automatically (backend follows rules)
   ↓
3. You win! (You have 19, dealer has 18)
   ↓
4. Backend calculates: $100 bet × 1.5 payout = $150 back to you
   ↓
5. Backend tells the Table contract: "This player won $150"
   ↓
6. Table contract executes: "Send $150 to player's wallet"
   ↓
7. Money appears in your wallet automatically
   ↓
8. Backend saves to PostgreSQL: "Hand #12345 completed: Player won"
   ↓
9. Website shows you: "You won! +$50 profit"
```

---

## The Complete Workflow

Now let's trace a complete game from start to finish.

### Setup Phase

**What happens BEFORE you ever play:**

1. **Developers deploy smart contracts**
   - Write the Solidity code (the rules)
   - Deploy to Base blockchain
   - Record the contract addresses
   - Anyone can view the code now

2. **Backend server starts**
   - Connects to PostgreSQL (permanent storage)
   - Connects to Redis (fast cache)
   - Listens for requests
   - Watches the blockchain for new bets

3. **Website loads**
   - You visit yolo-blackjack.com
   - Website code downloads to your browser
   - Website is ready to show you the blackjack table

### Connection Phase

**What happens when you open the game:**

```text
Step 1: You open the website
   ↓
Step 2: Website detects you don't have a wallet connected
   ↓
Step 3: Website shows: "Connect Your Wallet" button
   ↓
Step 4: You click it and approve in MetaMask/Coinbase Wallet
   ↓
Step 5: Website: "Great! You're 0x1234... Let me load your stats"
   ↓
Step 6: Website calls backend: GET /api/user/summary?player=0x1234
   ↓
Step 7: Backend checks PostgreSQL: "What's this player's history?"
   ↓
Step 8: Backend finds data and sends back:
   {
     "evPer100": -0.8,          // You've lost a bit of value
     "skillScore": 101.7,        // You're a skilled player
     "tiltIndex": 0.32,          // You get a bit emotional
     "riskAdjDelta": 7,          // You bet too much when lucky
     "returnAdjDelta": -6        // And lower returns
   }
   ↓
Step 9: Website displays your stats
   ↓
Step 10: You see the blackjack table ready to play
```

### Betting Phase

**What happens when you place a bet:**

```text
Step 1: You enter $100 as your bet
   ↓
Step 2: Website calculates:
        - Minimum: $25 (rules say 1/4 of your last bet)
        - Maximum: $400 (rules say 4x of your last bet)
        - Your bet $100: ✓ VALID
   ↓
Step 3: You click "Place Bet"
   ↓
Step 4: Website: "Time to move money to smart contract"
        It calls your wallet: "Can I move $100 USDC?"
   ↓
Step 5: You approve in your wallet (MetaMask popup)
   ↓
Step 6: Your wallet sends transaction to blockchain:
        "Transfer $100 from my wallet to Table contract"
   ↓
Step 7: Blockchain processes transaction (takes ~1-2 seconds on Base)
        "Transaction confirmed! Money is now in Table contract"
   ↓
Step 8: Website watches blockchain:
        "I see a new bet! The Table contract has $100"
   ↓
Step 9: Website calls backend: POST /api/engine/bet
        With data: { amount: 100, player: 0x1234 }
   ↓
Step 10: Backend receives the bet and:
         - Generates a hand ID (like "Hand #54321")
         - Stores it in Redis (fast access)
         - Stores it in PostgreSQL (permanent record)
```

### Dealing Phase

**What happens when cards are dealt:**

```text
Step 1: Backend generates a random number (shuffled deck)
        This is mathematically random - impossible to predict
   ↓
Step 2: Backend deals 4 cards:
        - Your first card: King of Hearts
        - Dealer first card: 7 of Diamonds
        - Your second card: 5 of Clubs
        - Dealer second card: (face down, shown as card back)
   ↓
Step 3: Backend calculates:
        Your total: K + 5 = 10 + 5 = 15
        Dealer showing: 7
   ↓
Step 4: Backend sends card data to Table contract
        (Records on blockchain - permanent proof of cards)
   ↓
Step 5: Backend sends to website via API:
        {
          "playerCards": [K♥, 5♣],
          "dealerVisible": [7♦],
          "playerTotal": 15,
          "dealerShowingTotal": 7,
          "handId": 54321
        }
   ↓
Step 6: Website displays:
        "You have 15 (K + 5)"
        "Dealer showing 7"
        "What do you do? Hit / Stand / Double Down / Split?"
```

### Playing Phase

**What happens as you play the hand:**

```text
Step 1: You decide "I'll Hit" (get another card)
   ↓
Step 2: Website tells backend: POST /api/engine/play
        With: { handId: 54321, action: "hit" }
   ↓
Step 3: Backend:
        - Deals next card from deck: 4 of Spades
        - Adds to your hand: K + 5 + 4 = 19
        - Check: Are you bust (over 21)? No, 19 is good
        - Stores this in PostgreSQL: "Hand 54321: Player hit, now has 19"
   ↓
Step 4: Backend sends back:
        {
          "playerCards": [K♥, 5♣, 4♠],
          "playerTotal": 19,
          "dealerVisible": [7♦],
          "canHit": true,
          "canStand": true
        }
   ↓
Step 5: Website shows:
        "You now have 19 (K + 5 + 4)"
        "Still want to hit?"
   ↓
Step 6: You decide "Stand" (no more cards)
   ↓
Step 7: Backend now plays the dealer:
        Dealer has: 7 + hidden card
        Backend reveals dealer's hidden card: 9 of Hearts
        Dealer total: 7 + 9 = 16
        House rules: "Hit on 16, stand on 17"
        Dealer hits: Gets 8
        Dealer total: 16 + 8 = 24 = BUST
        Dealer loses!
   ↓
Step 8: Backend calculates outcome:
        You: 19
        Dealer: Bust (24)
        Result: YOU WIN!
        Payout: $100 bet × 1.5 (blackjack payout) = $150 total
        Your profit: $150 - $100 = +$50
```

### Settlement Phase

**What happens when the hand ends:**

```text
Step 1: Backend tells Table contract: "Hand 54321 is done"
        With: {
          player: 0x1234,
          result: "win",
          payout: 150,
          fees: 5 (blockchain fees)
        }
   ↓
Step 2: Table contract executes:
        - Records the result on blockchain (permanent)
        - Calculates: Payout (150) - Fees (5) = 145 to send
        - Transfers 145 to your wallet
        - Emits event: "HandSettled" (everyone sees it)
   ↓
Step 3: Your wallet receives 145 (happens instantly)
        Your balance goes from: 900 → 1045
   ↓
Step 4: Backend updates PostgreSQL:
        INSERT INTO hands (
          hand_id, player_address, amount, result, payout, settled_at
        ) VALUES (
          54321, 0x1234, 100, 'win', 150, NOW()
        )
   ↓
Step 5: Backend updates user metrics:
        UPDATE user_metrics SET
          last_bet = 100,
          total_wins = total_wins + 1,
          updated_at = NOW()
   ↓
Step 6: Redis caches updated stats
        cache:user:0x1234:summary = {new stats}
   ↓
Step 7: Backend sends results to website:
        {
          "result": "YOU WON!",
          "profit": 50,
          "newBalance": 1045,
          "dealerCards": [7♦, 9♥, 8♠],
          "dealerBust": true
        }
   ↓
Step 8: Website displays:
        "🎉 YOU WIN! +$50"
        "You had: 19"
        "Dealer busted with 24"
        "New balance: $1,045"
   ↓
Step 9: Blockchain is updated (everyone can see):
        Transaction Hash: 0xabc123...
        From: Table Contract
        To: 0x1234 (your wallet)
        Amount: 145
        Status: Confirmed
```

### History Phase

**What happens when you check your history:**

```text
Step 1: You click "My History"
   ↓
Step 2: Website calls backend:
        GET /api/user/hands?player=0x1234&limit=100
   ↓
Step 3: Backend:
        - Checks Redis cache first (fast)
        - If not cached, queries PostgreSQL
        - Gets your last 100 hands
   ↓
Step 4: Backend sends back:
        [
          {
            "handId": 54321,
            "bet": 100,
            "result": "win",
            "payout": 150,
            "timestamp": "2025-10-30T14:32:15Z"
          },
          {
            "handId": 54320,
            "bet": 100,
            "result": "lose",
            "payout": 0,
            "timestamp": "2025-10-30T14:30:45Z"
          },
          // ... more hands
        ]
   ↓
Step 5: Website displays your history
        You can see every hand you ever played
```

---

## Key Technology Concepts

### 1. Verifiable Randomness (Fair Card Dealing)

**The problem:** How do you deal cards "fairly" when a computer is involved?

**Traditional casino:**

- They say: "Trust us, it's random"
- You can't verify it
- They could have secret code that favors the house

**YOLO Blackjack solution:**

We use a mathematical technique called **Chainlink VRF (Verifiable Random Function)**.

Think of it like this:

```text
Traditional Shuffling:
┌─────────────────────────────────────────────────┐
│  Casino: "I shuffled the cards (in secret)"     │
│  Player: "How do I know it's fair?"             │
│  Casino: "Just trust me"                        │
└─────────────────────────────────────────────────┘

YOLO Blackjack Shuffling:
┌─────────────────────────────────────────────────┐
│  1. Request goes to Chainlink (outside oracle)  │
│     "Give me a random number"                   │
│                                                 │
│  2. Chainlink generates random number           │
│     (special algorithm proves it's random)      │
│                                                 │
│  3. Chainlink provides the number + proof       │
│     "This random number is mathematically      │
│      proven to be random"                       │
│                                                 │
│  4. We use that to shuffle the deck            │
│     "King, Ace, 7..." based on that number      │
│                                                 │
│  5. Everyone can verify:                        │
│     - The random number was truly random       │
│     - The shuffle is based on it               │
│     - No cheating was possible                 │
└─────────────────────────────────────────────────┘
```

**Why this matters:**

- The randomness comes from outside the system (can't be manipulated)
- The algorithm is public (anyone can verify it)
- The proof is on the blockchain (permanent, verifiable)

### 2. Smart Contracts (Code as Rules)

**What is a smart contract?**

A smart contract is a program that lives on the blockchain. It's like a vending machine:

```text
Regular Contract (paper):
"I promise to pay you $100 if you deliver my car"
Problem: What if I don't pay? Lawsuit (expensive, takes years)

Smart Contract:
if (carDelivered == true) {
    send(100 dollars to seller);
}

No argument. Code runs automatically. If you deliver the car, you get paid instantly.
```

**The key difference:**

| Paper Contract | Smart Contract |
|---|---|
| Promises (words) | Code (executed automatically) |
| Requires trust | Math proves it will execute |
| Takes months to settle | Instant settlement |
| Human decides disputes | Code decides by logic |

**In YOLO Blackjack:**

The smart contract says:

```text

If player bets $100 AND wins {
    Send them $150
}

If player bets $100 AND loses {
    Keep the $100
}

If player bets $100 AND pushes (tie) {
    Send them $100 back
}

These rules CANNOT be changed
These rules are transparent (everyone sees them)
These rules execute automatically

```

### 3. PostgreSQL (Permanent Memory)

**What it does:** Stores data permanently

**Analogy:** It's like a filing cabinet:

- Every hand you play gets filed away
- The file never disappears
- You can look up "Show me all my hands from October"
- The filing cabinet is backed up regularly

**What we store:**

- Every hand you played (hand ID, cards, outcome)
- Your statistics (wins/losses, skill score)
- Treasury data (house profits/losses)

**Why permanent?**

- Players might want to prove they played
- Regulatory reasons (gambling laws require records)
- Dispute resolution (if someone claims they didn't lose that hand)

### 4. Redis (Fast Memory)

**What it does:** Stores data temporarily for speed

**Analogy:** It's like a sticky note pad on the desk:

- You write today's busy info on it
- It's much faster to read than looking in the filing cabinet
- At the end of the day, you throw it away
- Tomorrow you make new notes

**What we store:**

- Your current game state (what cards do you have right now?)
- Your stats from the last minute
- Current game sessions

**Why temporary?**

- Making the app fast (memory is faster than disk)
- We're okay losing it (we have it saved in PostgreSQL)
- It changes constantly (your cards change every second)

**Example:**

```text

User logs in
  ↓
Website asks: "What are this player's stats?"
  ↓
Backend checks Redis: "Do I have this cached?"
  ↓
Redis: "Yes! Here's the stats from 10 seconds ago"
  ↓
Website gets answer instantly (fast!)
  ↓
(Meanwhile, Redis notes: "This cache expires in 60 seconds")
  ↓
60 seconds pass
  ↓
If no one has asked for it, Redis deletes it (saves space)
  ↓
Next time someone asks, we refresh from PostgreSQL

```

### 5. REST API (How Parts Talk)

**What it is:** A language for web services to talk to each other

**Analogy:** It's like a restaurant menu:

```text

Restaurant:
Menu says: "Available dishes: Pizza, Pasta, Salad"
You say: "I want Pizza"
They give you Pizza

REST API:
Menu says: "Available endpoints: /api/user/summary, /api/engine/bet"
Website says: "I want /api/user/summary"
Backend gives the summary

```

**YOLO Blackjack's API:**

```text

GET /api/user/summary
    Input: player address (0x1234)
    Output: {stats}
    Translation: "Tell me this player's stats"

GET /api/user/hands
    Input: player address
    Output: [hand1, hand2, hand3...]
    Translation: "Show me all this player's hands"

POST /api/engine/bet
    Input: {amount: 100, player: 0x1234}
    Output: {handId: 54321, cards: [...]}
    Translation: "Place this bet and deal cards"

GET /api/treasury/overview
    Input: (none)
    Output: {positions, equitySeries}
    Translation: "What's the house's financial status?"

```

### 6. Wagering Rails (Betting Rules)

**The problem:** A player could come in, bet $1, then suddenly bet $10,000

**Traditional casino:**

- Security checks: "Are you card counting?"
- Might ban you

**YOLO Blackjack:**

- Mathematical rules prevent excessive bet jumps
- **Anchor**: Your rolling average bet
- **Spread Window**: You can bet between 1/4x and 4x your average
- **Growth Cap**: You can't bet more than 33% more than your last bet

**Example Walkthrough:**

Let's trace a few hands to see how the rules work together. The two key rules are:

1. **Spread Window**: Your bet must be between 1/4x and 4x your rolling average bet (the "Anchor").
2. **Growth Cap**: Your bet cannot be more than 133% of your *previous* bet.

Both rules must be satisfied.

```text
Hand 1: You bet $100
        - This is your first bet, so it's allowed and sets the initial anchor.
        - Anchor (rolling average of bets): $100
        - Last Bet: $100
        - Next Bet Limits:
          - Spread Window: $25 to $400 (1/4x to 4x of the $100 anchor)
          - Growth Cap: Max bet is $133 (133% of the $100 last bet)
        - Allowed!

Hand 2: You want to bet $200
        - Anchor: $100
        - Last Bet: $100
        - Math checks:
          - Is $200 in the Spread Window ($25-$400)? Yes.
          - Is $200 less than or equal to the Growth Cap ($133)? No.
        - System: "Bet is too large. Your max bet is $133."
        - Denied.

Hand 3: You bet $120 instead
        - Anchor: $100
        - Last Bet: $100
        - Math checks:
          - Is $120 in the Spread Window ($25-$400)? Yes.
          - Is $120 less than or equal to the Growth Cap ($133)? Yes.
        - Allowed!
        - New Anchor: ($100 + $120) / 2 = $110
        - New Last Bet: $120
        - Next Bet Limits:
          - Spread Window: $27.50 to $440 (1/4x to 4x of the new $110 anchor)
          - Growth Cap: Max bet is $159.60 (133% of the $120 last bet)

Hand 4: You want to bet $50
        - Anchor: $110
        - Last Bet: $120
        - Math checks:
          - Is $50 in the Spread Window ($27.50-$440)? Yes.
          - Is $50 less than or equal to the Growth Cap ($159.60)? Yes.
        - Allowed!
        - New Anchor: ($100 + $120 + $50) / 3 = $90
        - New Last Bet: $50

```

**Why this matters:**

- Prevents card counting advantage
- Keeps the game stable for the house
- Fair to both players and house

---

## Why This Approach?

### Why Blockchain?

**Not blockchain:**

```text

You: "I won $1,000"
Casino: "Prove it"
You: "You told me so"
Casino: "That's not in our system. Sorry, no payout"
You: "This is unfair!"
Casino: "Nothing I can do"
(No resolution)

```

**With blockchain:**

```text

You: "I won $1,000"
Blockchain: Shows transaction to everyone
           "Yes, $1,000 was transferred"
           Hash: 0xabc123
           Time: 3:45pm on Oct 30
           To address: 0x1234
You: "See? Transparent proof"
Casino: "Can't argue with the blockchain"
(Instant resolution)

```

### Why Go Backend?

**Why not just smart contracts?**

Smart contracts are great, but they're:

- **Slow** (blockchain takes 1-2 seconds per transaction)
- **Expensive** (each transaction costs gas fees)
- **Limited** (can't do complex calculations easily)

**Go backend does:**

```text

Deal cards instantly (not waiting for blockchain)
    ↓
Calculate outcomes instantly
    ↓
Talk to blockchain for final settlement
    ↓
Store history in database (cheaper than blockchain)
    ↓
Cache data for speed

```

**Analogy:**

```text

Smart contracts alone = Playing blackjack via mail
("I place a bet" → mailed to house → house mails back cards)

Backend + smart contracts = Playing blackjack online
(Cards dealt instantly, blockchain handles money)

```

### Why Next.js Frontend?

**Why not a native app?**

Next.js (web app):

- Works on any browser (phone, laptop, tablet)
- Instant updates (no waiting for app store)
- Connects easily to blockchain wallets

This is the standard for Web3 apps.

---

## Project Flow Diagram

### The Complete System Architecture

```text

┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE YOLO BLACKJACK SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              YOUR COMPUTER                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │               Web Browser (Next.js Frontend)                           │ │
│  │                                                                        │ │
│  │  ╔════════════════════════════════════════════════════════════════╗  │ │
│  │  ║                    YOLO Blackjack Website                      ║  │ │
│  │  ║                                                                ║  │ │
│  │  ║  ┌─────────────────────────────────────────────────────────┐  ║  │ │
│  │  ║  │  Wallet Connection                                     │  ║  │ │
│  │  ║  │  (MetaMask / Coinbase Wallet)                         │  ║  │ │
│  │  ║  │  Shows: Your balance, address                         │  ║  │ │
│  │  ║  └─────────────────────────────────────────────────────────┘  ║  │ │
│  │  ║                                                                ║  │ │
│  │  ║  ┌─────────────────────────────────────────────────────────┐  ║  │ │
│  │  ║  │  Game Table (Blackjack UI)                            │  ║  │ │
│  │  ║  │  • Your cards                                         │  ║  │ │
│  │  ║  │  • Dealer's cards                                     │  ║  │ │
│  │  ║  │  • Buttons: Hit / Stand / Double / Split              │  ║  │ │
│  │  ║  └─────────────────────────────────────────────────────────┘  ║  │ │
│  │  ║                                                                ║  │ │
│  │  ║  ┌─────────────────────────────────────────────────────────┐  ║  │ │
│  │  ║  │  Stats & History                                       │  ║  │ │
│  │  ║  │  • Your win/loss rate                                 │  ║  │ │
│  │  ║  │  • Hand history                                       │  ║  │ │
│  │  ║  │  • Account summary                                    │  ║  │ │
│  │  ║  └─────────────────────────────────────────────────────────┘  ║  │ │
│  │  ║                                                                ║  │ │
│  │  ╚════════════════════════════════════════════════════════════════╝  │ │
│  │                                                                        │ │
│  │  Events:                                                              │ │
│  │  • User clicks "Place Bet" → Send to Backend                          │ │
│  │  • Wallet confirms transaction → Move money to smart contract        │ │
│  │  • Backend sends cards → Display on website                          │ │
│  │  • Smart contract settles → Update balance                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Internet Connection ⬆️ ⬇️ (HTTP/HTTPS)                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                 ⬆️ ⬇️
┌──────────────────────────────────────────────────────────────────────────────┐
│                         THE GO BACKEND SERVER                                │
│                     (Somewhere on the internet)                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Main Application                                  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Request Handler                                               │  │ │
│  │  │  Receives: /api/engine/bet { amount: 100, player: 0x1234 }    │  │ │
│  │  │                                                                │  │ │
│  │  │  Process:                                                      │  │ │
│  │  │  1. Validate bet against wagering rules                       │  │ │
│  │  │  2. Create hand record with unique ID                         │  │ │
│  │  │  3. Generate random seed for shuffling                        │  │ │
│  │  │  4. Deal 2 cards to player, 2 to dealer                       │  │ │
│  │  │  5. Calculate totals                                          │  │ │
│  │  │  6. Return to website                                         │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Game Logic                                                     │  │ │
│  │  │  • Hand evaluation (count cards correctly)                     │  │ │
│  │  │  • Player actions (hit/stand/double/split)                    │  │ │
│  │  │  • Dealer logic (must hit on 16, stand on 17)                │  │ │
│  │  │  • Outcome determination                                      │  │ │
│  │  │  • Payout calculation                                         │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Database Managers                                              │  │ │
│  │  │                                                                │  │ │
│  │  │  ┌────────────────────────────────────────────────────────┐   │  │ │
│  │  │  │ PostgreSQL Connection                                 │   │  │ │
│  │  │  │ • Permanent storage of all game data                  │   │  │ │
│  │  │  │ • Queries: Get player history, store hand results     │   │  │ │
│  │  │  │ • Tables: hands, user_metrics, treasury_*             │   │  │ │
│  │  │  └────────────────────────────────────────────────────────┘   │  │ │
│  │  │                                                                │  │ │
│  │  │  ┌────────────────────────────────────────────────────────┐   │  │ │
│  │  │  │ Redis Connection                                       │   │  │ │
│  │  │  │ • Fast caching layer                                   │   │  │ │
│  │  │  │ • Stores: Current game state, cached stats             │   │  │ │
│  │  │  │ • TTL: Most data expires after 60 seconds              │   │  │ │
│  │  │  └────────────────────────────────────────────────────────┘   │  │ │
│  │  │                                                                │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Blockchain Interface                                          │  │ │
│  │  │  • Listens to smart contracts for new bets                    │  │ │
│  │  │  • Sends settlement transactions when hand ends               │  │ │
│  │  │  • Verifies player has funds in their wallet                  │  │ │
│  │  │  • Reads rules from smart contracts                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Internet Connection ⬆️ ⬇️ (Blockchain RPC calls)                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                 ⬆️ ⬇️
┌──────────────────────────────────────────────────────────────────────────────┐
│                   THE BLOCKCHAIN (Base L2 Network)                           │
│              (Thousands of computers maintaining the ledger)                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        Smart Contracts                                │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │  Factory Contract                                             │   │ │
│  │  │  • Creates new table contracts                                │   │ │
│  │  │  • Records table addresses                                    │   │ │
│  │  │  • Sets house owner                                           │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │  Table Contract (Multiple Tables)                            │   │ │
│  │  │  • Address: 0xTable001, 0xTable002, etc.                     │   │ │
│  │  │                                                               │   │ │
│  │  │  For each player bet:                                        │   │ │
│  │  │  ┌──────────────────────────────────────────────────────┐   │   │ │
│  │  │  │ 1. Receive money from player wallet               │   │   │ │
│  │  │  │    Event: "BetPlaced"                              │   │   │ │
│  │  │  │    Money is locked in contract                     │   │   │ │
│  │  │  │                                                    │   │   │ │
│  │  │  │ 2. Wait for backend to calculate result           │   │   │ │
│  │  │  │    (Backend tells contract: "Player won")         │   │   │ │
│  │  │  │                                                    │   │   │ │
│  │  │  │ 3. Execute payout automatically                   │   │   │ │
│  │  │  │    Code: if (playerWon) { send(payout); }         │   │   │ │
│  │  │  │    Money transferred instantly                     │   │   │ │
│  │  │  │    Event: "HandSettled"                           │   │   │ │
│  │  │  │                                                    │   │   │ │
│  │  │  │ 4. Record transaction permanently                 │   │   │ │
│  │  │  │    Transaction hash: 0xabc123...                  │   │   │ │
│  │  │  │    Everyone can see it forever                    │   │   │ │
│  │  │  └──────────────────────────────────────────────────────┘   │   │ │
│  │  │                                                               │   │ │
│  │  │  Rules are hardcoded:                                        │   │ │
│  │  │  • Blackjack payout: always 3:2 (can't change)              │   │ │
│  │  │  • House edge: always the same (can't change)               │   │ │
│  │  │  • Wagering limits: automated (can't bypass)                │   │ │
│  │  │  • Fees: transparent (can't hide)                           │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │  Treasury Contract                                            │   │ │
│  │  │  • Holds the house's bankroll                                 │   │ │
│  │  │  • Tracks house P&L                                           │   │ │
│  │  │  • Manages reserves for payouts                               │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  The Ledger (visible to everyone):                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Block 1: Alice bets 100 USDC                          (Time: 3:00pm) │ │
│  │ Block 2: Alice receives 150 USDC (she won)            (Time: 3:02pm) │ │
│  │ Block 3: Bob bets 50 USDC                             (Time: 3:04pm) │ │
│  │ Block 4: Bob receives 25 USDC (he lost)               (Time: 3:06pm) │ │
│  │ ...                                                                    │ │
│  │ Everyone can see these transactions forever                           │ │
│  │ No one can delete or change them                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

```

### Step-by-Step Game Flow

```text

                        START HERE
                            ⬇️
                 User opens website
                            ⬇️
              Does wallet connect? ← No → Show "Connect Wallet"
                            ↓
                          Yes
                            ⬇️
                  Load player stats
                 (From backend API)
                            ⬇️
              Show blackjack table
                            ⬇️
              Player enters bet amount
                            ⬇️
          Is bet within legal range? ← No → Show error
                            ↓
                          Yes
                            ⬇️
            Player clicks "Place Bet"
                            ⬇️
            Website: Send money to contract
            (Wallet approves transaction)
                            ⬇️
            Blockchain: Money locked in
                 Table contract
                            ⬇️
            Backend: Detects new bet
                            ⬇️
          Backend: Shuffle deck + deal
          2 cards to player, 2 dealer
                            ⬇️
          Backend: Send cards to website
                            ⬇️
        Website: Display hand to player
        "You have K + 5 = 15"
        "Dealer showing: 7"
                            ⬇️
                    ┌───────────────────────┐
                    │   PLAY THE HAND       │
                    └───────────────────────┘
                            ⬇️
          Player decides: Hit / Stand / Double?
                            ⬇️
                    ┌─────────────────────────────────────┐
                    │  While (Hand not finished):         │
                    │  - Player hits or stands            │
                    │  - Backend updates cards            │
                    │  - Website shows new total          │
                    │  - Check for bust                   │
                    └─────────────────────────────────────┘
                            ⬇️
              Player stands or busts
                            ⬇️
                Dealer plays (automatic)
              (Follows house rules: hit 16, stand 17)
                            ⬇️
            Backend calculates outcome
            (Who won? By how much?)
                            ⬇️
            Backend tells smart contract
                 "Settlement: Player won $150"
                            ⬇️
        Smart contract executes settlement
        (Money moves from contract to wallet)
                            ⬇️
            Player receives payout
        (Instantly in their wallet)
                            ⬇️
        Backend saves to database
        (Permanent record of hand)
                            ⬇️
        Website shows result
        "🎉 YOU WON! +$50"
                            ⬇️
              ┌─────────────────────────┐
              │  Play again or quit?    │
              ├─────────────────────────┤
              │  Again → Back to betting│
              │  Quit  → Close website  │
              └─────────────────────────┘

```

### Data Flow for One Complete Game

```text

┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW (ONE GAME)                            │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:00 PM - PLAYER CONNECTS
┌─────────────────────────────────────────────────────────────────────────────┐
│ Website ← Backend: GET /api/user/summary?player=0x1234                      │
│ Backend → PostgreSQL: SELECT * FROM user_metrics WHERE player = 0x1234      │
│ PostgreSQL → Backend: {evPer100: -0.8, skillScore: 101.7, ...}            │
│ Backend → Redis: SET cache:user:0x1234:summary {...} EX 60                 │
│ Backend → Website: {stats}                                                   │
│ Website: Displays player stats                                              │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:15 PM - PLAYER PLACES BET
┌─────────────────────────────────────────────────────────────────────────────┐
│ Website: "User wants to bet $100"                                           │
│ Website → User's Wallet: "Approve 100 USDC transfer?"                       │
│ User: "Approve" (in MetaMask)                                               │
│ Wallet → Blockchain: Transfer 100 USDC from 0xPlayer to 0xTableContract    │
│ Blockchain: Processes transaction (2 seconds)                               │
│ Blockchain: Records in permanent ledger                                     │
│ Blockchain: Sends "BetPlaced" event                                         │
│ Website → Backend: POST /api/engine/bet {amount: 100, player: 0x1234}      │
│ Backend → PostgreSQL: INSERT INTO hands (hand_id, player, amount, ...)      │
│ Backend → Redis: SET engine:state:123 {deck, cards, ...}                   │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:16 PM - CARDS DEALT
┌─────────────────────────────────────────────────────────────────────────────┐
│ Backend: Shuffles deck (random)                                             │
│ Backend: Deals                                                              │
│   Player: K♥ 5♣ (total: 15)                                               │
│   Dealer: 7♦ X (showing 7)                                                │
│ Backend → Blockchain: Send hand data to Table contract                      │
│ Blockchain: Records cards in memory                                         │
│ Blockchain → Backend: Confirmed                                             │
│ Backend → Redis: UPDATE engine:state:123                                    │
│ Backend → Website: {playerCards: [K,5], dealerShowing: [7], ...}           │
│ Website: Displays cards visually                                            │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:22 PM - PLAYER PLAYS
┌─────────────────────────────────────────────────────────────────────────────┐
│ Player clicks "HIT"                                                         │
│ Website → Backend: POST /api/engine/play {handId: 123, action: "hit"}      │
│ Backend: Deals next card: 4♠                                               │
│ Backend: New total: 15 + 4 = 19                                            │
│ Backend → PostgreSQL: UPDATE hands SET cards = [K,5,4] WHERE hand_id=123  │
│ Backend → Website: {cards: [K,5,4], total: 19, actions: [stand, hit]}     │
│ Website: Shows new card                                                     │
│                                                                             │
│ Player clicks "STAND"                                                       │
│ Website → Backend: POST /api/engine/play {action: "stand"}                 │
│ Backend: Dealer plays...                                                    │
│   Dealer has: 7 + 9 = 16                                                   │
│   House rule: Hit on 16                                                     │
│   Dealer hits: 8                                                            │
│   New total: 24 = BUST                                                      │
│ Backend: Outcome = Player wins (dealer bust)                                │
│ Backend: Payout = 100 × 1.5 = 150                                          │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:28 PM - SETTLEMENT
┌─────────────────────────────────────────────────────────────────────────────┐
│ Backend → Blockchain: Settlement call                                       │
│   "Hand 123 result: WIN, payout: 150"                                      │
│ Smart Contract: Executes                                                    │
│   if (outcome == WIN) {                                                     │
│     transfer(150, playerWallet)                                             │
│   }                                                                         │
│ Blockchain: Transfers 150 USDC from contract to 0xPlayer                   │
│ Blockchain: Records transaction                                             │
│ Blockchain: Emits "HandSettled" event                                      │
│ Wallet Notification: "You received 150 USDC"                                │
│ Backend → PostgreSQL: UPDATE hands SET result='win', payout=150, settled=now
│ Backend → PostgreSQL: UPDATE user_metrics SET last_bet=100, wins++         │
│ Backend → Redis: DEL cache:user:0x1234:summary (invalidate cache)          │
│ Backend → Website: {result: "WIN", payout: 150, dealerCards: [7,9,8], ...}│
│ Website: Displays result                                                    │
│   "🎉 YOU WON!"                                                             │
│   "You: 19"                                                                 │
│   "Dealer: 24 (BUST)"                                                       │
│   "Profit: +$50"                                                            │
│   "New Balance: $1,050"                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

TIME: 2:00:30 PM - HISTORY SAVED
┌─────────────────────────────────────────────────────────────────────────────┐
│ Player clicks "My History"                                                  │
│ Website → Backend: GET /api/user/hands?player=0x1234&limit=100             │
│ Backend → Redis: Check cache (miss, cache was invalidated)                  │
│ Backend → PostgreSQL: SELECT * FROM hands WHERE player=0x1234 ORDER BY id  │
│ PostgreSQL Returns: [Hand 123 (latest), Hand 122, Hand 121, ...]          │
│ Backend → Redis: SET cache:user:0x1234:hands {...} EX 60                  │
│ Backend → Website: [Hand details in JSON format]                            │
│ Website: Shows history table                                                │
│   Hand 123: Bet $100 → Won $150 (Profit: +$50) [Just now]                │
│   Hand 122: Bet $100 → Lost $0 → Dealer 21 [2:00:20]                     │
│   Hand 121: Bet $75 → Won $112 → You 20, Dealer 19 [1:59:50]             │
│   ...                                                                       │
└─────────────────────────────────────────────────────────────────────────────┘

```

---

## Summary: The Big Picture

**YOLO Blackjack = Three Parts Working Together:**

```text

┌──────────────────────────┐
│  SMART CONTRACT (Rules)  │
│  • Holds money           │
│  • Locks in payouts      │
│  • Permanently records   │
│  • No one can cheat      │
└──────────────────────────┘
          ↕
┌──────────────────────────┐
│  BACKEND (Dealer)        │
│  • Deals cards           │
│  • Calculates outcomes   │
│  • Talks to databases    │
│  • Tells website results │
└──────────────────────────┘
          ↕
┌──────────────────────────┐
│  WEBSITE (Game UI)       │
│  • Shows cards           │
│  • Gets your clicks      │
│  • Connects wallet       │
│  • Shows stats           │
└──────────────────────────┘

```

**Why this is better than a traditional casino:**

| Feature | Traditional Casino | YOLO Blackjack |
|---------|---|---|
| **Trust** | Hope it's fair | Math proves it's fair |
| **Transparency** | Secret | Blockchain = public |
| **Cheating** | Possible | Impossible |
| **Payouts** | Delay (1-3 days) | Instant |
| **Rules** | Can change | Cannot change |
| **Your Money** | In their bank | In smart contract |
| **Fairness Verification** | Impossible | Anyone can verify |

---

## Glossary

**Blockchain** — A public ledger (record book) that everyone has a copy of. No one can fake or change the records.

**Smart Contract** — A program living on blockchain that runs automatically. Like a vending machine: if you put money in, code decides what happens next.

**Base** — A blockchain network (faster than Ethereum, used for our game).

**Wallet** — Your digital purse (like MetaMask). Holds your cryptocurrency and signs transactions.

**Transaction** — Moving money from one place to another on blockchain. Recorded permanently.

**VRF (Verifiable Random Function)** — Mathematical randomness that everyone can verify is truly random. Used to shuffle our deck fairly.

**Gas Fee** — The cost to do something on blockchain (like sending a transaction). Usually small (cents).

**PostgreSQL** — A database that permanently stores records (like a filing cabinet).

**Redis** — A fast temporary storage (like a sticky note). Data can expire.

**API** — A way for programs to talk to each other (like a menu).

**Payout** — Money you win (returned to your wallet instantly).

**Hand** — One game of blackjack from bet to result.

**Anchor** — Your rolling average bet (used to calculate betting limits).

---

## Still Have Questions?

**Q: Can the casino cheat?**
A: No. Smart contract code can't be changed once deployed. Everyone can read it.

**Q: What if the website goes down?**
A: Your money is safe (it's in the smart contract on blockchain). You can always withdraw it directly.

**Q: How fast are payouts?**
A: Instant (a few seconds). Smart contract automatically sends money when hand ends.

**Q: Can I verify the shuffle is fair?**
A: Yes. We use Chainlink VRF, which proves the random number is truly random.

**Q: What if I lose my wallet password?**
A: Your money is lost forever (like losing physical cash). Only you control your wallet.

**Q: How do I know no one is hacking this?**
A: Code is audited publicly. Blockchain makes tampering obvious (everyone sees tampering attempts).

**Q: Can the game be rigged?**
A: No. The cards are dealt using mathematical randomness. The outcome is deterministic (given the cards, the hand outcome is calculated the same way every time).

**Q: Do I need to trust the casino?**
A: No. You trust the math. The code. The blockchain. Never trust a person or company.

---

## Final Thought

YOLO Blackjack combines:

- **Blockchain** (Trust without trusting anyone)
- **Smart contracts** (Automatic, unchangeable rules)
- **Cryptography** (Unfakeable randomness)
- **Traditional database** (Efficient permanent records)

This is the future of gaming: **Provably fair, transparent, and instant.**

No more "trust us." Just math.
