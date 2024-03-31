// components/DealButton.jsx
import Web3 from 'web3';
import React from 'react';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand, setCardCount }) => {
  const dealCards = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request access
        const accounts = await web3.eth.getAccounts();
        const blackjackContract = new web3.eth.Contract(BlackjackABI, blackjackContractAddress, {
          from: accounts[0], // default from address
          gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
        });

        // Initialize and shuffle the deck
        await blackjackContract.methods.initializeDeck().send({ from: accounts[0] });
        await blackjackContract.methods.shuffleDeck().send({ from: accounts[0] });

        // Deal hands
        await blackjackContract.methods.dealHands().send({ from: accounts[0] });

        // Fetch the state
        const dealer = await blackjackContract.methods.getDealerHand().call();
        const player = await blackjackContract.methods.getPlayerHand().call();
        const count = await blackjackContract.methods.getCardCount().call();

        // Update state in React component
        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(parseInt(count, 10));
      } catch (error) {
        console.error("DealButton error:", error);
      }
    } else {
      console.error("Ethereum provider (e.g., MetaMask) not found.");
    }
  };

  return (
    <button onClick={dealCards} className="deal-button">
      Deal Cards
    </button>
  );
};

export default DealButton;
