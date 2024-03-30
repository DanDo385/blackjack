import { useState, useEffect } from 'react';

const CardCount = ({ blackjackContract }) => {
  const [cardCount, setCardCount] = useState(0);

  // Function to fetch card count from the contract
  const fetchCardCount = async () => {
    try {
      const count = await blackjackContract.getCardCount();
      setCardCount(count.toNumber()); // Assuming cardCount is an integer
    } catch (error) {
      console.error("Error fetching card count:", error);
    }
  };

  // Fetch card count when the component mounts
  useEffect(() => {
    fetchCardCount();
  }, []);

  return (
    <div className="card-count bg-slate-900 text-green-400 p-4 rounded">
      <p className="text-sm">Card Count:</p>
      <p className="text-xl">{cardCount}</p>
    </div>
  );
};

export default CardCount;
