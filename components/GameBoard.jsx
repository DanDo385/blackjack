// components/GameBoard.jsx
import React from 'react';
import DealButton from './DealButton'; // Ensure this is correctly pointing to the location of DealButton
import Hands from './Hands'; // Placeholder - ensure you have a Hand component
import ActionButtons from './ActionButtons'; // Placeholder - ensure you have an ActionButtons component
import CheatsheetDrawer from './CheatsheetDrawer'; // Placeholder - ensure you have a CheatsheetDrawer component
import CardCount from './CardCount'; // Placeholder - ensure you have a CardCount component

const GameBoard = ({
  dealerHand,
  playerHand,
  setDealerHand,
  setPlayerHand,
  setCardCount,
  gameState,
  onHit,
  onStand,
  cardCount,
}) => {
  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      {/* DealButton pinned to the top left corner */}
      <div className="absolute top-0 left-0 m-4">
        <DealButton 
          setDealerHand={setDealerHand} 
          setPlayerHand={setPlayerHand} 
          setCardCount={setCardCount} 
        />
      </div>
      {/* CardCount pinned to the top right corner */}
      <div className="absolute top-0 right-0 m-4">
        <CardCount cardCount={cardCount} />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="dealer-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
          {/* Ensure Hand component can render a list of cards */}
          <Hands cards={dealerHand} />
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          {/* Ensure Hand component can render a list of cards */}
          <Hands cards={playerHand} />
        </div>
        {/* ActionButtons for Hit, Stand, etc. */}
        <ActionButtons
          onHit={onHit}
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
