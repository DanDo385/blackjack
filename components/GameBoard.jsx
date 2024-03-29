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
      <div className="absolute top-0 left-0 m-4">
        <DealButton setDealerHand={setDealerHand} setPlayerHand={setPlayerHand} setCardCount={setCardCount} />
      </div>
      {/* Other components remain unchanged */}
    </div>
  );
};

export default GameBoard;
