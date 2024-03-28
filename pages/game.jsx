import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from '@/components/Navbar'; // Adjust path as needed
import GameBoard from '@/components/GameBoard'; // Adjust path as needed
import DealButton from '@/components/DealButton'; // Adjust path as needed
import CheatSheet from '@/components/CheatSheet'; // Adjust path as needed
import Hand from '@/components/Hand'; // Adjust path as needed

const Game = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);

  // Dummy function to simulate dealing new hands
  const dealNewHand = async () => {
    try {
      // Simulate connecting to the smart contract and calling dealHands()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const blackjackContract = new ethers.Contract(
        "YOUR_CONTRACT_ADDRESS", // Replace with your contract address
        ["function dealHands() public"], // Simplified ABI; replace with your contract's ABI
        signer
      );

      // Example of updating state after "dealing" (replace with actual logic)
      setPlayerHand(['/images/cards/2-C.png', '/images/cards/3-D.png']); // Example card paths
      setDealerHand(['/images/cards/back.png', '/images/cards/10-H.png']); // Example card paths
    } catch (error) {
      console.error('Error dealing hands:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <GameBoard dealerHand={dealerHand} playerHand={playerHand} />
        <div className="my-4">
          <DealButton onClick={dealNewHand} />
        </div>
        {/* Assuming Hand component can render based on paths */}
        <div className="flex justify-center gap-4">
          <Hand cards={dealerHand} title="Dealer's Hand" />
          <Hand cards={playerHand} title="Player's Hand" />
        </div>
      </div>
      <CheatSheet />
    </>
  );
};

export default Game;
