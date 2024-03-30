// components/Hand.jsx
const Hand = ({ cards }) => {
  return (
    <div className="hand flex justify-center items-center">
      {cards.map((card, index) => (
        <img key={index} src={`/images/cards/${card}.png`} alt={card} className="h-24 m-1" />
      ))}
    </div>
  );
};

export default Hand;
