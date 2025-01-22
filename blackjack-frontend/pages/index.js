import { useState, useEffect } from 'react';
import Button from '../components/Button';

export default function Home() {
  const [gameState, setGameState] = useState(null);
  const [showInsurancePrompt, setShowInsurancePrompt] = useState(false);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = async () => {
    try {
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGameState(data);
      checkForInsurance(data);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const checkForInsurance = (data) => {
    if (data.dealerHand[0].rank === 'A') {
      setShowInsurancePrompt(true);
    }
  };

  const handleInsuranceResponse = async (response) => {
    setShowInsurancePrompt(false);
    try {
      const res = await fetch(`/api/insurance?response=${response}`, { method: 'POST' });
      const data = await res.json();
      setGameState(data);
    } catch (error) {
      console.error('Error handling insurance:', error);
    }
  };

  const hit = async () => {
    try {
      const response = await fetch('/api/hit', { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error hitting:', error);
    }
  };

  const stand = async () => {
    try {
      const response = await fetch('/api/stand', { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error standing:', error);
    }
  };

  const split = async () => {
    try {
      const response = await fetch('/api/split', { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error splitting:', error);
    }
  };

  const doubleDown = async () => {
    try {
      const response = await fetch('/api/double-down', { method: 'POST' });
      const data = await response.json();
      setGameState(data);
    } catch (error) {
      console.error('Error doubling down:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Blackjack Game</h1>
      <div className="mb-4">
        <h2>Dealer's Hand</h2>
        <div className="flex">
          {gameState?.dealerHand.map((card, index) => (
            <img
              key={index}
              src={`/cards/${card.rank}-${card.suit}.png`}
              alt={`${card.rank} of ${card.suit}`}
              className="w-16 h-24"
            />
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h2>Your Hand</h2>
        <div className="flex">
          {gameState?.playerHand.map((card, index) => (
            <img
              key={index}
              src={`/cards/${card.rank}-${card.suit}.png`}
              alt={`${card.rank} of ${card.suit}`}
              className="w-16 h-24"
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={hit} variant="success">Hit</Button>
        <Button onClick={stand} variant="primary">Stand</Button>
        <Button onClick={split} variant="warning">Split</Button>
        <Button onClick={doubleDown} variant="danger">Double Down</Button>
      </div>
      {showInsurancePrompt && (
        <div className="mt-4">
          <p>Dealer is showing an Ace. Would you like to buy Insurance?</p>
          <Button onClick={() => handleInsuranceResponse('yes')} variant="success">Yes</Button>
          <Button onClick={() => handleInsuranceResponse('no')} variant="danger">No</Button>
        </div>
      )}
    </div>
  );
}
