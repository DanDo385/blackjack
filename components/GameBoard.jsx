// components/GameBoard.jsx
import React from 'react';
import DealButton from './DealButton';
import Hands from './Hands';
import ActionButtons from './ActionButtons';
import CheatsheetDrawer from './CheatsheetDrawer';
import CardCount from './CardCount';

const GameBoard = ({
  dealerHand,
  playerHand,
  setDealerHand,
  setPlayerHand,
  gameState,
  gameStarted, // Assuming this is managed outside and passed as a prop
  onHit,
  onStand,
}) => {
  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      {/* DealButton pinned to the top left corner */}
      <div className="absolute top-0 left-0 m-4">
        <DealButton 
          setDealerHand={setDealerHand} 
          setPlayerHand={setPlayerHand} 
        />
      </div>
      {/* CardCount doesn't need to be pinned or adjusted in this snippet */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="dealer-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
          {/* Ensure Hand component can render a list of cards */}
          {/* hideDealerSecondCard prop controls the visibility of the dealer's second card */}
          <Hands cards={dealerHand} hideDealerSecondCard={!gameStarted} />
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          <Hands cards={playerHand} />
        </div>
        {/* ActionButtons for Hit, Stand, etc., assuming you pass handlers for these actions */}
        <ActionButtons
          onHit={() => {
            onHit();
            // You might include logic here to update the gameStarted state if needed
          }}
          onStand={onStand}
          gameState={gameState}
        />
        {/* Drawer or modal for blackjack cheatsheet or help */}
        <CheatsheetDrawer />
      </div>
    </div>
  );
};

export default GameBoard;
