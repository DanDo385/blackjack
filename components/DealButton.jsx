"use client"

import { ethers } from 'ethers';
import BlackjackABI from '../contracts/build/Blackjack.abi';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand }) => {
  const dealCards = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Use window.ethereum as the provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

        // Call the dealHands() function from the smart contract
        await blackjackContract.dealHands();

        // Fetch the updated state from the contract
        const dealerHand = await blackjackContract.getDealerHand();
        const playerHand = await blackjackContract.getPlayerHand();

        // Update the state with the hands returned by the contract
        setDealerHand(dealerHand);
        setPlayerHand(playerHand);
      } catch (error) {
        console.error("DealButton error:", error);
      }
    } else {
      console.error("Ethereum provider not found.");
    }
  };

  return (
    <button onClick={dealCards} className="deal-button">
      Deal Cards
    </button>
  );
};

export default DealButton;
