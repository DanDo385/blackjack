// components/ActionButtons.jsx
import React from 'react';
import { handleHit } from '../utils/handleHit';
import { handleStand } from '../utils/handleStand';
 // Adjust the path as needed

const ActionButtons = ({ contractAddress, signer, gameState, updateGame }) => {
  return (
    <div className="action-buttons flex justify-around w-full p-4">
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleHit(contractAddress, signer)}
        disabled={!gameState.canHit}
      >
        Hit
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleStand(contractAddress, signer, updateGame)}
        disabled={!gameState.canStand}
      >
        Stand
      </button>
    </div>
  );
};

export default ActionButtons;
