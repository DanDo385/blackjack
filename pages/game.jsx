// pages/game.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GameBoard from '../components/GameBoard';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

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

  useEffect(() => {
    // Prompt user to connect wallet on component mount
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.send("eth_requestAccounts", []).catch(console.error);
  }, []);

  const dealCards = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const signer = provider.getSigner();
      const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

      // Execute dealHands function from the contract
      await blackjackContract.dealHands().then((tx) => tx.wait());

      // Fetch updated hands and card count
      const dealer = await blackjackContract.getDealerHand();
      const player = await blackjackContract.getPlayerHand();
      const count = await blackjackContract.getCardCount();

      setDealerHand(dealer);
      setPlayerHand(player);
      setCardCount(count.toNumber()); // Assuming cardCount is an integer value
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <GameBoard
        dealerHand={dealerHand}
        playerHand={playerHand}
        onDealCards={dealCards}
        gameState={gameState}
        onHit={() => {}}
        onStand={() => {}}
        cardCount={cardCount}
      />
    </div>
  );
}
