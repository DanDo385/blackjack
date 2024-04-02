//components/Hands.jsx

import React from 'react';

const Hands = ({ cards }) => {
  return (
    <div className="flex">
      {cards.map((card, index) => (
        <img
          key={index}
          src={`/images/cards/${index === 1 && cards.length > 2 ? 'back' : card}.png`}
          alt={index === 1 && cards.length > 2 ? 'back' : card}
          className="w-40 h-56 mr-4"
        />
      ))}
    </div>
  );
};

export default Hands;
