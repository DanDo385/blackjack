// components/HitButton.jsx 
import { ethers } from 'ethers';
import contractABI from '../../contracts/build/Blackjack.abi.json';

const HitButton = ({ contractAddress, signer }) => {
  const handleHit = async () => {
    try {
      const blackjackContract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await blackjackContract.hit();
      await tx.wait();
      console.log('Card dealt to player.');
      // After hitting, you may want to update the UI to show the new card.
    } catch (error) {
      console.error('Error when trying to hit:', error);
    }
  };

  return (
    <button onClick={handleHit}>Hit</button>
  );
};

export default HitButton;
