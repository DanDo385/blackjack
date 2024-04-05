import { createContext, useContext, useState } from 'react';
import { CardsContext } from './CardsContext';

export const LogicContext = createContext();

const LogicProvider = ({ children }) => {
  const { dealCard } = useContext(CardsContext);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameStatus, setGameStatus] = useState(''); // e.g., 'playing', 'playerBusts', 'dealerBusts', 'playerWins', 'dealerWins', 'tie'

  // Helper function to add a card to a hand and calculate the new score
  const addCardToHand = (hand) => {
    const card = dealCard();
    const newHand = [...hand, card];
    return newHand;
  };

  // Calculate the best score for a given hand
  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
      let [rank] = card.split('');
      if (rank === 'A') {
        aces += 1;
        score += 11;
      } else if (['J', 'Q', 'K', '0'].includes(rank)) { // '0' for '10'
        score += 10;
      } else {
        score += parseInt(rank);
      }
    });

    // Adjust aces from 11 to 1 as needed
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const playerHit = () => {
    const newHand = addCardToHand(playerHand);
    setPlayerHand(newHand);

    if (calculateScore(newHand) > 21) {
      setGameStatus('playerBusts');
      // More logic to handle bust (like resetting for a new game) could go here
    }
  };

  const dealerPlay = () => {
    let newHand = dealerHand;
    while (calculateScore(newHand) < 17) {
      newHand = addCardToHand(newHand);
    }
    setDealerHand(newHand);

    const dealerScore = calculateScore(newHand);
    if (dealerScore > 21) {
      setGameStatus('dealerBusts');
    } else {
      const playerScore = calculateScore(playerHand);
      // Compare scores to determine winner
      if (playerScore > dealerScore) {
        setGameStatus('playerWins');
      } else if (playerScore < dealerScore) {
        setGameStatus('dealerWins');
      } else {
        setGameStatus('tie');
      }
    }
  };

  // Implementations for playerStand, playerDoubleDown, playerSplit, and playerInsurance can follow a similar structure

  return (
    <LogicContext.Provider value={{
      playerHand,
      dealerHand,
      gameStatus,
      playerHit,
      dealerPlay,
      // Export additional logic functions as they are implemented
    }}>
      {children}
    </LogicContext.Provider>
  );
};

export { LogicProvider };
