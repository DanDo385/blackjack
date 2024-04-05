import { createContext, useState, useEffect } from 'react';

export const CardsContext = createContext();

const NUM_DECKS = 4;
const SHUFFLE_THRESHOLD = 0.75; // Shuffling when 75% of cards have been used

const CardsProvider = ({ children }) => {
  const [decks, setDecks] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState(0);

  useEffect(() => {
    initializeAndShuffleDecks();
  }, []);

  const initializeAndShuffleDecks = () => {
    let newDecks = [];
    const suits = ['C', 'D', 'H', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let d = 0; d < NUM_DECKS; d++) {
      suits.forEach((suit) => {
        ranks.forEach((rank) => {
          newDecks.push(`${rank}${suit}`);
        });
      });
    }

    newDecks = shuffle(newDecks);
    setDecks(newDecks);
    setCardsDrawn(0);
  };

  const shuffle = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const dealCard = () => {
    if (cardsDrawn >= decks.length * SHUFFLE_THRESHOLD) {
      initializeAndShuffleDecks();
    }

    setCardsDrawn(cardsDrawn + 1);
    return decks.pop();
  };

  return (
    <CardsContext.Provider value={{ dealCard }}>
      {children}
    </CardsContext.Provider>
  );
};

export { CardsProvider };
