import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext'; // Update with your actual import path

const CardCount = () => {
  const [cardCount, setCardCount] = useState(null);
  const { blackjackContract } = useWallet(); // Adjust based on your context implementation

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
