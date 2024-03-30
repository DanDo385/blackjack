// components/DealButton.jsx
import { ethers } from 'ethers';
import BlackjackABI from '../constants/BlackjackABI.json';

const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const DealButton = ({ setDealerHand, setPlayerHand, setCardCount }) => {
  const dealCards = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const blackjackContract = new ethers.Contract(blackjackContractAddress, BlackjackABI, signer);

        await blackjackContract.dealHands().then((tx) => tx.wait());

        const dealer = await blackjackContract.getDealerHand();
        const player = await blackjackContract.getPlayerHand();
        const count = await blackjackContract.getCardCount();

        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(parseInt(count.toString(), 10));  // Adjust if necessary for your contract
      } catch (error) {
        console.error("DealButton error:", error);
      }
    } else {
      console.error("Ethereum provider (e.g., MetaMask) not found.");
    }
  };

  return <button onClick={dealCards}>Deal</button>;
};

export default DealButton;
