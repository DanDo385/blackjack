import React from 'react';
import { ethers } from 'ethers';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand, setCardCount }) => {
  const dealCards = async () => {
    // Ensure the Ethereum provider (e.g., MetaMask) is available
    if (window.ethereum) {
      try {
        // Initialize ethers provider and contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI.abi, signer);

        // Deal hands via smart contract
        await blackjackContract.dealHands();

        // Retrieve and set dealer and player hands, and card count
        const dealer = await blackjackContract.getDealerHand();
        const player = await blackjackContract.getPlayerHand();
        const count = await blackjackContract.getCardCount();

        // Update React state with the fetched data
        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(count.toNumber()); // Convert BigNumber to number
      } catch (error) {
        console.error("Error dealing cards:", error);
      }
    } else {
      console.error("Ethereum provider not found. Please install MetaMask.");
    }
  };

  return (
    <button onClick={dealCards} className="deal-button">
      Deal Cards
    </button>
  );
};

export default DealButton;
