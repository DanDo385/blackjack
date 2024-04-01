import { useEffect, useState } from 'react';

const CardCount = ({ blackjackContract }) => {
  const [cardCount, setCardCount] = useState(0); // Initialize cardCount with a default value

  useEffect(() => {
    console.log('Fetching card count...');
    
    const fetchCardCount = async () => {
      try {
        const count = await blackjackContract.getCardCount();
        console.log('Card count fetched:', count);
        setCardCount(count);
      } catch (error) {
        console.error('Error fetching card count:', error);
      }
    };

    if (blackjackContract) {
      fetchCardCount();
    }
  }, [blackjackContract]);

  return <div>Card Count: {cardCount}</div>;
};

export default CardCount;
