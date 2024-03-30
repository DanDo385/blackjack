// pages/game.jsx
import { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard'; // Adjust this import path as necessary

export default function Game() {
  const [gameState, setGameState] = useState({
    canHit: true,
    canStand: true,
    canDoubleDown: false,
    canSplit: false,
    canInsurance: false,
  });
  const [dealerHand, setDealerHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [cardCount, setCardCount] = useState(0);

  // This useEffect hook could be used for initial setup actions, such as fetching data
  // useEffect(() => {
  //   // Perform initial setup actions here
  // }, []);

  return (
    <div>
      <GameBoard
        dealerHand={dealerHand}
        playerHand={playerHand}
        setDealerHand={setDealerHand}
        setPlayerHand={setPlayerHand}
        setCardCount={setCardCount}
        gameState={gameState}
        cardCount={cardCount}
        // You can also pass down functions for game actions like "onHit" and "onStand" here
      />
    </div>
  );
}
