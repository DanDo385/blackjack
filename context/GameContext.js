// context/gameContext.js

import { createContext, useState, useEffect } from 'react';

export const GameContext = createContext();

const INITIAL_DECK_SIZE = 52;
const NUM_DECKS = 4;
const TOTAL_CARDS = INITIAL_DECK_SIZE * NUM_DECKS;
const SHUFFLE_THRESHOLD = TOTAL_CARDS * 0.75; // 75% of total cards

const GameProvider = ({ children }) => {
  const [decks, setDecks] = useState([]);
  const [cardsDrawn, setCardsDrawn] = useState(0);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [needsShuffle, setNeedsShuffle] = useState(false);

  useEffect(() => {
    shuffleAllDecks();
  }, []);

  const createDecks = () => {
    const suits = ['C', 'D', 'H', 'S'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return new Array(NUM_DECKS).fill(0).map(() =>
      suits.flatMap(suit => ranks.map(rank => `${rank}-${suit}`))
    );
  };

  const shuffleAllDecks = () => {
    const newDecks = createDecks().map(deck =>
      deck.sort(() => Math.random() - 0.5)
    );
    setDecks(newDecks);
    setCardsDrawn(0);
    setNeedsShuffle(false);
    alert("Shuffling Decks..."); // Alert the player that the decks are being shuffled
  };

  const dealCardFromCurrentDeck = () => {
    let card = decks[currentDeckIndex].pop();
    const newCardsDrawn = cardsDrawn + 1;
    setCardsDrawn(newCardsDrawn);

    if (newCardsDrawn >= SHUFFLE_THRESHOLD) {
      setNeedsShuffle(true);
    }

    // Move to the next deck if the current deck is exhausted
    if (decks[currentDeckIndex].length === 0) {
      setCurrentDeckIndex((currentDeckIndex + 1) % NUM_DECKS);
    }

    return card;
  };

  const dealHands = () => {
    // Check if decks need shuffling at the start of a new hand
    if (needsShuffle) {
      shuffleAllDecks();
    }

    const newPlayerHand = [dealCardFromCurrentDeck(), dealCardFromCurrentDeck()];
    const newDealerHand = [dealCardFromCurrentDeck(), dealCardFromCurrentDeck()];
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);

    // Rotate to the next deck for the next hand
    setCurrentDeckIndex((currentDeckIndex + 1) % NUM_DECKS);
  };

  return (
    <GameContext.Provider value={{
      playerHand,
      dealerHand,
      dealHands,
      shuffleAllDecks
    }}>
      {children}
    </GameContext.Provider>
  );
};

export { GameProvider };
