// components/ActionButton.jsx
const ActionButton = ({ onHit, onStand, onDoubleDown, onSplit, onInsurance, gameState }) => {
    return (
      <div className="action-buttons flex justify-around w-full p-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={onHit}
          disabled={!gameState.canHit} // Example condition, adjust based on actual game state
        >
          Hit
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={onStand}
          disabled={!gameState.canStand}
        >
          Stand
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onDoubleDown}
          disabled={!gameState.canDoubleDown}
        >
          Double Down
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          onClick={onSplit}
          disabled={!gameState.canSplit}
        >
          Split
        </button>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={onInsurance}
          disabled={!gameState.canInsurance}
        >
          Insurance
        </button>
      </div>
    );
  };
  
  export default ActionButton;
  