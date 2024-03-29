import React from 'react';
import Hand from './Hand';
import DealButton from './DealButton';
import CheatsheetDrawer from './CheatsheetDrawer';
import ActionButtons from './ActionButtons';
import CardCount from './CardCount';

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
          <Hand cards={dealerHand} />
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          <Hand cards={playerHand} />
        </div>
        <ActionButtons
          onHit={onHit}
          onStand={onStand}
          gameState={gameState}
        />
        <CheatsheetDrawer />
      </div>
    </div>
  );
};

export default GameBoard;
