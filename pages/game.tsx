// pages/game.jsx
import { useState } from 'react';
import { Navbar, GameBoard } from '@/components';

const game = () => {
  const [playerHand, setPlayerHand] = useState(['2-C', '3-D']); // Example cards
  const dealerHand = ['back', '10-H']; // Assuming the dealer has one face-down card

  // Placeholder for action handler logic
  const handleAction = (action) => {
    console.log(action);
    // Future implementation: Interact with the smart contract here
  };

  return (
    <>
      <Navbar />
      <GameBoard />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        {/* Dealer's hand with the face-down card represented by 'back' */}
        <Hand cards={dealerHand} />
        
        {/* Action buttons */}
        <div className="my-4">
          <ActionButton onClick={() => handleAction('hit')}>Hit</ActionButton>
          <ActionButton onClick={() => handleAction('stand')}>Stand</ActionButton>
          <ActionButton onClick={() => handleAction('doubleDown')}>Double Down</ActionButton>
          <ActionButton onClick={() => handleAction('split')}>Split</ActionButton>
          <ActionButton onClick={() => handleAction('insurance')}>Insurance</ActionButton>
      </div>
    </> 
      {/* Player's hand */}
      <Hand cards={playerHand} />
    </div>
  );
};

export default game;
