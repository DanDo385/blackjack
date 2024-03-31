// components/DealButton.jsx
import React from 'react';
import Web3 from 'web3';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand, setCardCount }) => {
  const dealCards = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Use window.ethereum as the provider
        const web3 = new Web3(window.ethereum);
        const blackjackContract = new web3.eth.Contract(BlackjackABI, blackjackContractAddress);

        // Proceed to deal cards
        await blackjackContract.methods.initializeDeck().send({ from: accounts[0] });
        await blackjackContract.methods.shuffleDeck().send({ from: accounts[0] });
        await blackjackContract.methods.dealHands().send({ from: accounts[0] });

        // Fetch the updated state
        const dealer = await blackjackContract.methods.getDealerHand().call();
        const player = await blackjackContract.methods.getPlayerHand().call();
        const count = await blackjackContract.methods.getCardCount().call();

        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(parseInt(count, 10));
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
