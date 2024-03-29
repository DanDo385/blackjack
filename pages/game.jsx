import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import GameBoard from '../components/GameBoard';
import ActionButtons from '../components/ActionButton';
import DealButton from '../components/DealButton';
import CheatsheetDrawer from '../components/CheatsheetDrawer';

// Dummy initial state, replace with actual game logic as needed
const initialGameState = {
  canHit: true,
  canStand: true,
  canDoubleDown: false,
  canSplit: false,
  canInsurance: false,
};

export default function Game() {
  const [gameState, setGameState] = useState(initialGameState);
  const [dealerHand, setDealerHand] = useState(['back']); // 'back' represents the back of a card
  const [playerHand, setPlayerHand] = useState([]);

  // Dummy function for dealing cards, replace with your contract interaction logic
  const dealCards = () => {
    // Simulate dealing cards here
    setDealerHand(['2-C', 'back']); // Update with real data
    setPlayerHand(['K-H', 'A-S']); // Update with real data
  };

  const handleHit = () => {
    console.log('Hit action');
    // Implement game logic here
  };

  const handleStand = () => {
    console.log('Stand action');
    // Implement game logic here
  };

  const handleDoubleDown = () => {
    console.log('Double Down action');
    // Implement game logic here
  };

  const handleSplit = () => {
    console.log('Split action');
    // Implement game logic here
  };

  const handleInsurance = () => {
    console.log('Insurance action');
    // Implement game logic here
  };

  return (
    <div className="min-h-screen bg-green-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <GameBoard dealerHand={dealerHand} playerHand={playerHand} />
        <ActionButtons
          onHit={handleHit}
          onStand={handleStand}
          onDoubleDown={handleDoubleDown}
          onSplit={handleSplit}
          onInsurance={handleInsurance}
          gameState={gameState}
        />
        <div className="flex justify-center my-4">
          <DealButton onClick={dealCards} />
        </div>
        <CheatsheetDrawer />
      </div>
    </div>
  );
}
