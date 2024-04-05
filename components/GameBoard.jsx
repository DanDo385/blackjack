// components/GameBoard.jsx
import { useContext, useState } from 'react';
import { GameContext } from '../context/GameContext'; // Ensure the path is correct
import DealButton from './Deal';
import Hands from './Hands';
import ActionButtons from './ActionButtons';
import CheatsheetDrawer from './CheatsheetDrawer';
import CardCount from './CardCount';

const GameBoard = () => {
  const { dealerHand, playerHand, chipCount, wager, placeBet } = useContext(GameContext);
  const [betAmount, setBetAmount] = useState('');

  const handlePlaceBet = () => {
    const amount = parseInt(betAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      placeBet(amount);
      setBetAmount(''); // Reset bet amount input
    } else {
      alert("Please enter a valid bet amount.");
    }
  };

  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      {/* Betting interface */}
      <div className="betting-area">
        <div>Chip Count: {chipCount}</div>
        <div>Current Wager: {wager}</div>
        <input 
          type="number" 
          value={betAmount} 
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Enter your bet"
        />
        <button onClick={handlePlaceBet}>Place Bet</button>
      </div>
      {/* The rest of the GameBoard component remains the same */}
    </div>
  );
};

export default GameBoard;

