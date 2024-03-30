// components/Hand.jsx

const Hand = ({ cards }) => {
  console.log('Cards to display:', cards);

  return (
    <div className="hand flex justify-center items-center">
      {cards.map((card, index) => {
        const cardImage = `/images/cards/${card}.png`; // Verify that this path matches your actual images path
        console.log(`Rendering card: ${cardImage}`);
        return (
          <img key={index} src={cardImage} alt={`Card ${card}`} className="h-24 m-1" />
        );
      })}
    </div>
  );
};

export default Hand;
