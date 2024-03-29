// Import necessary hooks and components from React and other files
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import GameBoard from '../components/GameBoard';
import ActionButtons from '../components/ActionButtons';
import DealButton from '../components/DealButton';
import CheatsheetDrawer from '../components/CheatsheetDrawer';
import BlackjackABI from '../constants/BlackjackABI.json'; // Your ABI path

const initialGameState = {
  canHit: true,
  canStand: true,
  canDoubleDown: false,
  canSplit: false,
  canInsurance: false,
};

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;


export default function Game() {
  const [gameState, setGameState] = useState(initialGameState);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI.abi, signer);

  useEffect(() => {
    // Prompt user to connect wallet
    async function connectWallet() {
      try {
        await provider.send("eth_requestAccounts", []);
      } catch (error) {
        console.error(error);
      }
    }
    connectWallet();
  }, [provider]);

  const dealCards = async () => {
    try {
      // Run the dealHands function from the smart contract
      const tx = await blackjackContract.dealHands();
      await tx.wait();

      // Fetch the updated hands
      const dealerHandFromContract = await blackjackContract.getDealerHand();
      const playerHandFromContract = await blackjackContract.getPlayerHand();

      // Update local state with fetched hands
      setDealerHand(dealerHandFromContract);
      setPlayerHand(playerHandFromContract);
    } catch (error) {
      console.error(error);
    }
  };

  // Other handler implementations...

  return (
    <div className="min-h-screen bg-green-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <GameBoard dealerHand={dealerHand} playerHand={playerHand} />
        <ActionButtons
          onHit={() => {}}
          onStand={() => {}}
          onDoubleDown={() => {}}
          onSplit={() => {}}
          onInsurance={() => {}}
          gameState={gameState}
        />
        <div className="flex justify-center my-4">
          <DealButton onClick={dealCards} />
        </div>
        <CheatsheetDrawer />
      </div>
    </div>
  );
}
