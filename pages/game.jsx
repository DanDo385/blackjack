// Import necessary hooks and utilities
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GameBoard from '../components/GameBoard';
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
  const [cardCount, setCardCount] = useState(0); // Assuming you want to display this

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI.abi, signer);
          
          // Example of setting up a listener for contract events
          blackjackContract.on('CardDealt', (card) => {
            console.log('Card dealt:', card);
          });

          // Example of fetching initial state from the contract
          fetchInitialState(blackjackContract);
        } catch (error) {
          console.error('Error connecting to Metamask:', error);
        }
      } else {
        console.error('Please install Metamask.');
      }
    };

    connectWallet();
  }, []);

  const fetchInitialState = async (blackjackContract) => {
    const dealerHandFromContract = await blackjackContract.getDealerHand();
    const playerHandFromContract = await blackjackContract.getPlayerHand();
    const cardCountFromContract = await blackjackContract.getCardCount();

    setDealerHand(dealerHandFromContract);
    setPlayerHand(playerHandFromContract);
    setCardCount(cardCountFromContract);
  };

  const dealCards = async () => {
    // Example of dealing cards (Assuming blackjackContract is initialized correctly)
  };

  // Handler functions for other actions...

  return (
    <div className="min-h-screen bg-green-800">
      <GameBoard 
        dealerHand={dealerHand} 
        playerHand={playerHand} 
        onDealCards={dealCards} 
        gameState={gameState} 
        onHit={() => {}} // Define or pass these functions
        onStand={() => {}} // Define or pass these functions
        cardCount={cardCount}
      />
    </div>
  );
}
