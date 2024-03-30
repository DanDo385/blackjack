// components/Hand.jsx
const Hand = ({ cards }) => {
  return (
    <div className="hand flex justify-center items-center">
      {cards.map((card, index) => (
        // Adjusted path to correctly point to the images in the public directory
        <img key={index} src={`/images/cards/${card}.png`} alt="Card" className="h-24 m-1" />
      ))}
    </div>
  );
};

export default Hand;
