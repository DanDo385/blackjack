// DealButton.jsx
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

        await blackjackContract.initializeDeck();
        await blackjackContract.shuffleDeck();
        const dealTx = await blackjackContract.dealHands();
        await dealTx.wait();

        const dealer = await blackjackContract.getDealerHand();
        const player = await blackjackContract.getPlayerHand();
        const count = await blackjackContract.getCardCount();

        setDealerHand(dealer);
        setPlayerHand(player);
        setCardCount(count.toNumber());
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
