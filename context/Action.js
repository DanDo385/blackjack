import { createContext, useContext, useCallback } from 'react';
import { CardsContext } from './CardsContext'; // Ensure the path is correct
import { LogicContext } from './LogicContext'; // Ensure the path is correct
import { WagerContext } from './WagerContext'; // For handling wagers in actions like Double Down

export const ActionContext = createContext();

const ActionProvider = ({ children }) => {
  const { dealCard } = useContext(CardsContext);
  const { playerHand, setPlayerHand, dealerHand, setDealerHand, evaluateHands } = useContext(LogicContext);
  const { chipCount, setChipCount, wager, setWager } = useContext(WagerContext);

  const playerHit = useCallback(() => {
    const newCard = dealCard();
    setPlayerHand([...playerHand, newCard]);
    // Optionally, evaluate hand immediately for busts or auto-stand scenarios
  }, [playerHand, setPlayerHand, dealCard]);

  const playerStand = useCallback(() => {
    // Logic for standing could involve triggering the dealer's play and then evaluating hands
    // This is just a placeholder to illustrate the setup
    console.log('Player stands.');
    // Trigger dealer's actions here
    // evaluateHands();
  }, [evaluateHands]);

  const playerDoubleDown = useCallback(() => {
    if (chipCount >= wager) {
      const newCard = dealCard();
      setPlayerHand([...playerHand, newCard]);
      setWager(wager * 2);
      setChipCount(chipCount - wager); // Double the wager
      playerStand(); // Usually, a player stands after doubling down
    } else {
      alert('Not enough chips to double down.');
    }
  }, [playerHand, chipCount, wager, dealCard, playerStand]);

  const playerSplit = useCallback(() => {
    // Placeholder for split logic
    console.log('Split to be implemented.');
    // Split logic involves checking for pairs, splitting hands, and possibly duplicating wagers
  }, [playerHand, wager]);

  const playerInsurance = useCallback(() => {
    // Placeholder for insurance logic
    console.log('Insurance to be implemented.');
    // Implement insurance logic, typically involving checking dealer's up card for an Ace
  }, []);

  return (
    <ActionContext.Provider value={{ playerHit, playerStand, playerDoubleDown, playerSplit, playerInsurance }}>
      {children}
    </ActionContext.Provider>
  );
};

export { ActionProvider };
