// components/GameBoard.jsx
import React, { useContext } from 'react';
import { GameContext } from '../context/gameContext'; // Adjust the path as necessary
import DealButton from './Deal';
import Hands from './Hands';
import ActionButtons from './ActionButtons';
import CheatsheetDrawer from './CheatsheetDrawer';
import CardCount from './CardCount';

const GameBoard = () => {
  const { dealerHand, playerHand, dealHands } = useContext(GameContext);

  // You might have functions to trigger dealing hands, hitting, standing, etc., directly here
  // or utilize the context's functions like dealHands() if it's supposed to start a new game/hand

  return (
    <div className="game-board bg-cover bg-center min-h-screen relative" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      <div className="absolute top-0 left-0 m-4">
        <DealButton onClick={dealHands} /> {/* Assuming DealButton accepts an onClick prop */}
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="dealer-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
          <Hands cards={dealerHand} hideDealerSecondCard={true} /> {/* Adjust based on your game state */}
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          <Hands cards={playerHand} />
        </div>
        <ActionButtons />
        <CheatsheetDrawer />
      </div>
    </div>
  );
};

export default GameBoard;
