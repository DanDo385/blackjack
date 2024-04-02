// components/Hands.jsx
import Image from 'next/image';

const Hands = ({ cards, hideDealerSecondCard = false }) => {
  return (
    <div className="flex">
      {cards.map((card, index) => {
        const isSecondDealerCard = hideDealerSecondCard && index === 1; // Check if this is the second card of the dealer's hand
        return (
          <div key={index} className="relative w-[250px] h-[350px] mr-4">
            <Image
              src={isSecondDealerCard ? '/images/cards/back.png' : `/images/cards/${card}.png`}
              alt="Card"
              layout="fill"
              objectFit="contain"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Hands;

