// components/GameBoard.jsx
import React from 'react';
import Hand from './Hand';
import DealButton from './DealButton';
import CheatsheetDrawer from './CheatsheetDrawer';
import ActionButtons from './ActionButtons';
import CardCount from './CardCount';

const GameBoard = ({
  dealerHand,
  playerHand,
  onDealCards,
  gameState,
  onHit,
  onStand,
  cardCount,
}) => {
  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      {/* DealButton pinned to the top left corner */}
      <div className="absolute top-0 left-0 m-4">
        <DealButton onClick={onDealCards} />
      </div>
      {/* CardCount pinned to the top right corner */}
      <div className="absolute top-0 right-0 m-4">
        <CardCount cardCount={cardCount} />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Dealer and Player Hands, ActionButtons, and CheatsheetDrawer components */}
      </div>
    </div>
  );
};

export default GameBoard;
