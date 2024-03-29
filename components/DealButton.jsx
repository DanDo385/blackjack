import React from 'react';
import { ethers } from 'ethers';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand, setCardCount }) => {
  const dealCards = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner();
        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

        await blackjackContract.dealHands().then((tx) => tx.wait());

        const dealer = await blackjackContract.getDealerHand();
        const player = await blackjackContract.getPlayerHand();
        const count = await blackjackContract.getCardCount();

        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(parseInt(count.toString(), 10)); // Assuming cardCount is a BigNumber and converting it to a number
      } catch (error) {
        console.error("DealButton error:", error);
      }
    } else {
      console.error("Ethereum provider (e.g., MetaMask) not found.");
    }
  };

  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700"
      onClick={dealCards}
    >
      Deal
    </button>
  );
};

export default DealButton;
