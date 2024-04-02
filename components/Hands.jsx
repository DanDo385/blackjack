import React from 'react';

const Hands = ({ cards }) => {
  return (
    <div className="flex">
      {cards.map((card, index) => (
        <img
          key={index}
          src={`/images/cards/${card}.png`} // Assuming card strings are in the format "2-C", "A-S", etc.
          alt={card}
          className="w-40 h-56 mr-4" // Adjust size as needed
        />
      ))}
    </div>
  );
};

export default Hands;
