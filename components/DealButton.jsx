import React, { useState } from 'react';
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

        // Clear previous hands
        setDealerHand([]);
        setPlayerHand([]);

        // Deal new hands
        await blackjackContract.dealHands();

        const dealerHand = await blackjackContract.getDealerHand();
        const playerHand = await blackjackContract.getPlayerHand();

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
      className="deal-button"
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Deal Cards'}
    </button>
  );
};

export default DealButton;
