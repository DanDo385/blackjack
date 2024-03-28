import { useState } from 'react';

const GameBoard = () => {
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  const toggleCheatSheet = () => setIsCheatSheetOpen(!isCheatSheetOpen);

  return (
    <div className="relative">
      {/* Background Image */}
      <img
        src="/images/boards/eth-board.jpg"
        alt="Blackjack Game Board"
        className="h-full w-full object-cover absolute top-0 left-0 z-0"
      />
     
      <div
        className={`fixed bottom-0 left-0 w-full h-screen bg-gray-900 bg-opacity-75 z-10 transition-all duration-300 ease-in-out ${
          isCheatSheetOpen ? '' : 'translate-y-full'
        }`}
      >
        <img
          src="/images/cheatsheet/cheat-sheet.jpeg"
          alt="Blackjack Cheat Sheet"
          className="mx-auto my-auto h-auto w-full max-w-2xl max-h-full object-contain"
          onClick={toggleCheatSheet}
        />
      </div>
      <button onClick={toggleCheatSheet} className="absolute bottom-4 left-4 z-20">
        {isCheatSheetOpen ? 'Hide Cheat Sheet' : 'Show Cheat Sheet'}
      </button>
    </div>
  );
};

export default GameBoard;
