//components/Hands.jsx
import Image from 'next/image';

const Hands = ({ cards }) => {
  return (
    <div className="flex">
      {cards.map((card, index) => (
        <div key={index} className="relative w-[250px] h-[350px] mr-4">
          <Image
            src={`/images/cards/${card}.png`} // Ensure the path is correct
            alt={card}
            layout="fill" // This makes the image cover the div, adjust as needed
            objectFit="contain" // Keeps aspect ratio, adjust as needed
          />
        </div>
      ))}
    </div>
  );
};

export default Hands;
