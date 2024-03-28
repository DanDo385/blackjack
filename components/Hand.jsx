// components/Hand.jsx
const Hand = ({ cards }) => {
  return (
    <div className="hand flex justify-center items-center">
      {cards.map((card, index) => (
        // Assuming card is a path to the image like './public/images/cards/2-C.png'
        // Adjust the src path as needed based on your project's structure
        <img key={index} src={card} alt="Card" className="h-24 m-1" />
      ))}
    </div>
  );
};

export default Hand;
