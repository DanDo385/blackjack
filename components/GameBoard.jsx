import React from 'react';

// Assuming the Hand component can accept a prop called 'cards' which is an array of image paths for rendering
const GameBoard = ({ dealerHand, playerHand }) => {
  return (
    <div className="game-board bg-green-500 min-h-screen flex flex-col items-center justify-center">
      <div className="dealer-hand mb-8">
        <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
        {/* Render dealer's hand here. If the Hand component is elsewhere, ensure to import and use it properly */}
         <Hand cards={dealerHand} /> */}
      </div>
      <div className="player-hand">
        <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
        {/* Render player's hand here */}
        <Hand cards={playerHand} /> */}
      </div>
    </div>
  );
};

export default GameBoard;
