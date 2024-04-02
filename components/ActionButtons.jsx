// components/ActionButtons.jsx
import { handleHit } from '../utils/handleHit'; // Make sure this import path is correct

const ActionButtons = ({ contractAddress, signer, playerHand, setPlayerHand, gameState }) => {
  // This function should be passed down from the parent component or created here
  const revealDealerSecondCard = () => {
    // Implement the logic to reveal the dealer's second card
  };

  return (
    <div className="action-buttons flex justify-around w-full p-4">
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleHit(contractAddress, signer, playerHand, setPlayerHand, revealDealerSecondCard)}
        disabled={!gameState.canHit}
      >
        Hit
      </button>
      {/* Implement the Stand button and its logic similarly */}
    </div>
  );
};

export default ActionButtons;
