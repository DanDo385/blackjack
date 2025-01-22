import { useState, useEffect } from 'react';
import Button from '../components/Button';
import ChipSelector from '../components/ChipSelector';

export default function Home() {
  const [gameState, setGameState] = useState(null);
  const [showInsurancePrompt, setShowInsurancePrompt] = useState(false);
  const [chips, setChips] = useState(1000);
  const [betAmount, setBetAmount] = useState(0);

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
    <div className="min-h-screen bg-green-800 flex justify-center items-center p-8">
      <div className="bg-green-700 p-8 rounded-lg shadow-xl max-w-4xl w-full">
        <h1 className="text-3xl mb-6 text-white text-center">Blackjack Game</h1>
        
        <div className="mb-6 flex justify-between text-white">
          <div>
            <p>Count: {gameState?.count || 0}</p>
            <p>True Count: {gameState?.trueCount?.toFixed(2) || 0}</p>
          </div>
          <ChipSelector 
            chips={chips} 
            setChips={setChips}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl text-white mb-2">Dealer's Hand</h2>
          <div className="flex justify-center">
            {gameState?.dealerHand.map((card, index) => (
              <img
                key={index}
                src={`/cards/${card.rank}-${card.suit}.png`}
                alt={`${card.rank} of ${card.suit}`}
                className="w-20 h-30 -ml-4 first:ml-0"
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl text-white mb-2">Your Hand</h2>
          <div className="flex justify-center">
            {gameState?.playerHand.map((card, index) => (
              <img
                key={index}
                src={`/cards/${card.rank}-${card.suit}.png`}
                alt={`${card.rank} of ${card.suit}`}
                className="w-20 h-30 -ml-4 first:ml-0"
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button onClick={hit} variant="success">Hit</Button>
          <Button onClick={stand} variant="primary">Stand</Button>
          <Button onClick={split} variant="warning">Split</Button>
          <Button onClick={doubleDown} variant="danger">Double Down</Button>
        </div>

        {showInsurancePrompt && (
          <div className="mt-4 text-center text-white">
            <p>Dealer is showing an Ace. Would you like to buy Insurance?</p>
            <div className="flex gap-2 justify-center mt-2">
              <Button onClick={() => handleInsuranceResponse('yes')} variant="success">Yes</Button>
              <Button onClick={() => handleInsuranceResponse('no')} variant="danger">No</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
