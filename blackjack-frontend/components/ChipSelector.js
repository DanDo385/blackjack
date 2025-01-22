import React from 'react';

const ChipSelector = ({ chips, setChips, betAmount, setBetAmount }) => {
  const handleChipsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setChips(value);
  };

  const handleBetChange = (value) => {
    if (value <= chips) {
      setBetAmount(value);
    }
  };

  return (
    <div className="bg-green-600 p-4 rounded-lg">
      <div className="mb-4">
        <label className="block text-white mb-2">Your Chips</label>
        <input
          type="number"
          value={chips}
          onChange={handleChipsChange}
          className="w-full px-3 py-2 rounded bg-white text-black"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-white mb-2">Bet Amount</label>
        <input
          type="range"
          min="0"
          max={chips}
          value={betAmount}
          onChange={(e) => handleBetChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-white text-center mt-2">
          Bet: {betAmount} chips
        </div>
      </div>
    </div>
  );
};

export default ChipSelector; 