// components/GameBoard.jsx
import React from 'react';
import Hand from './Hand'; // Import the Hand component
import DealButton from './DealButton'; // Import DealButton
import CheatsheetDrawer from './CheatsheetDrawer'; // Import CheatsheetDrawer
import ActionButtons from './ActionButtons'; // Import ActionButtons
import CardCount from './CardCount'; // Import the CardCount component

const GameBoard = ({ dealerHand, playerHand, onDealCards, gameState, onHit, onStand, cardCount /*, onDoubleDown, onSplit, onInsurance */ }) => {
  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      {/* CardCount component pinned to the top right corner */}
      <div className="absolute top-0 right-0 m-4">
        <CardCount cardCount={cardCount} />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="dealer-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
          <Hand cards={dealerHand} />
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          <Hand cards={playerHand} />
        </div>
        {/* Passing only the functions that are currently in use */}
        <ActionButtons
          onHit={onHit}
          onStand={onStand}
          // onDoubleDown={onDoubleDown}
          // onSplit={onSplit}
          // onInsurance={onInsurance}
          gameState={gameState}
        />
        <div className="flex justify-center my-4">
          <DealButton onClick={onDealCards} />
        </div>
        <CheatsheetDrawer />
      </div>
    </div>
  );
};

export default GameBoard;
