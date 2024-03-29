import { useState } from 'react';

const CheatsheetDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="fixed top-1/2 left-0 transform -translate-y-1/2 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-200 p-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        {isVisible ? 'Hide' : 'Unhide'}
      </button>
      
      {isVisible && (
        <div className="absolute left-full top-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-50">
          <img
            src="/images/cheatsheet/cheat-sheet.jpeg"
            alt="Cheatsheet"
            className="max-w-full max-h-full p-4"
          />
        </div>
      )}
    </div>
  );
};

export default CheatsheetDrawer;
