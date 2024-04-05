import { createContext, useState, useEffect } from 'react';

export const WagerContext = createContext();

const STARTING_CHIPS = 10000;

const WagerProvider = ({ children }) => {
  const [chipCount, setChipCount] = useState(STARTING_CHIPS);
  const [wager, setWager] = useState(0);

  // Function to place a bet
  const placeBet = (amount) => {
    if (amount > chipCount) {
      alert("You do not have enough chips to place this bet.");
      return false; // Bet was not successful
    }
    setWager(amount);
    setChipCount(prevChipCount => prevChipCount - amount);
    return true; // Bet was successful
  };

  // Function to reset the game when the player runs out of chips
  const resetGame = () => {
    setChipCount(STARTING_CHIPS);
    setWager(0);
    // You may also want to reset other parts of your game state here
    alert("Game Over. Starting over with 10,000 chips.");
  };

  // Optional: Function to handle winnings
  const handleWinning = (winAmount) => {
    setChipCount(prevChipCount => prevChipCount + winAmount);
    setWager(0); // Reset the wager after the win
  };

  // Check if the chip count is 0 and reset the game if so
  useEffect(() => {
    if (chipCount <= 0) {
      resetGame();
    }
  }, [chipCount]);

  return (
    <WagerContext.Provider value={{ chipCount, wager, placeBet, handleWinning }}>
      {children}
    </WagerContext.Provider>
  );
};

export { WagerProvider };
