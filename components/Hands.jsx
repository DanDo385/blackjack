import React from 'react';

const Hands = ({ cards }) => {
  return (
    <div className="hands">
      {cards.map((card, index) => (
        <img
          key={index}
          src={`/images/cards/${card}.png`} // Assuming card strings are in the format "2-C", "A-S", etc.
          alt={card}
          className="card"
        />
      ))}
    </div>
  );
};

export default Hands;

