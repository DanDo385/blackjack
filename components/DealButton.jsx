//components/DealButton.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import BlackjackABI from '../contracts/build/Blackjack.abi.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand }) => {
  const [isLoading, setIsLoading] = useState(false);

  const dealCards = async () => {
    try {
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

        setIsLoading(true);

        // Deal new hands
        await blackjackContract.dealHands();

        const dealerHand = await blackjackContract.getDealerHand();
        const playerHand = await blackjackContract.getPlayerHand();

        // Log the hands
        console.log('Dealer Hand:', dealerHand);
        console.log('Player Hand:', playerHand);

        // Clear previous hands and set new ones
        setDealerHand(dealerHand);
        setPlayerHand(playerHand);

        setIsLoading(false);
      } else {
        console.error('MetaMask not found.');
      }
    } catch (error) {
      console.error('DealButton error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={dealCards}
      disabled={isLoading}
      className="deal-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? 'Loading...' : 'Deal Cards'}
    </button>
  );
};

export default DealButton;
