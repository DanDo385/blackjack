import React, { useState } from 'react';
import { ethers } from 'ethers';
import BlackjackABI from '../contracts/build/Blackjack.abi';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand }) => {
  const [isLoading, setIsLoading] = useState(false);

  const dealCards = async () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Connect to the provider
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Create contract instance
        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

        setIsLoading(true);
        // Call dealHands function
        await blackjackContract.dealHands();
        setIsLoading(false);

        // Fetch updated hands from the contract
        const dealerHand = await blackjackContract.getDealerHand();
        const playerHand = await blackjackContract.getPlayerHand();

        // Update state with the hands returned by the contract
        setDealerHand(dealerHand);
        setPlayerHand(playerHand);
      } else {
        console.error('MetaMask not found.');
      }
    } catch (error) {
      console.error('DealButton error:', error);
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
