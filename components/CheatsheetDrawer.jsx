// components/CheatsheetDrawer.jsx
import { useState } from 'react';

const CheatsheetDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="absolute bottom-0 left-0 mb-4 ml-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-200 p-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        {isVisible ? 'Hide Cheatsheet' : 'Show Cheatsheet'}
      </button>
      
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 max-w-3xl max-h-full overflow-auto">
            <img
              src="/images/cheatsheet/cheat-sheet.jpeg"
              alt="Cheatsheet"
              className="max-w-full h-auto"
            />
            <button
              onClick={() => setIsVisible(false)}
              className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-700"
            >
              Close Cheatsheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheatsheetDrawer;
