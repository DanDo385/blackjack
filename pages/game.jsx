import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GameBoard from './components/GameBoard';
import DealButton from './components/DealButton';
import ActionButton from './components/ActionButton';
import blackjackABI from './constants/blackjackABI.json';

const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";

const Game = () => {
  const [playerHand, setPlayerHand] = useState<string[]>([]);
  const [dealerHand, setDealerHand] = useState<string[]>([]);

  // Initialize ethers upon component mount
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const blackjackContract = new ethers.Contract(contractAddress, blackjackABI.abi, signer);

      // Example: Load initial game state here
      // You might want to load existing game state from the contract when the component mounts
    } else {
      console.error("Ethereum wallet is not connected");
    }
  }, []);

  const deal = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const blackjackContract = new ethers.Contract(contractAddress, blackjackABI.abi, signer);

      try {
        // Assuming dealHands is a transaction that changes state, you must send a transaction
        const tx = await blackjackContract.dealHands();
        await tx.wait(); // Wait for the transaction to be mined

        // Fetch updated hands from the contract
        const updatedPlayerHand = await blackjackContract.getPlayerHand();
        const updatedDealerHand = await blackjackContract.getDealerHand();

        setPlayerHand(updatedPlayerHand);
        setDealerHand([updatedDealerHand[0], "back"]); // Assuming you show only one dealer card and a back placeholder
      } catch (error) {
        console.error("Could not deal hands:", error);
      }
    }
  };

  return (
    <div>
      <GameBoard playerHand={playerHand} dealerHand={dealerHand} />
      <DealButton onClick={deal} />
      <ActionButton />
      {/* Assuming ActionButton component's logic and props are handled appropriately */}
    </div>
  );
};

export default Game;
