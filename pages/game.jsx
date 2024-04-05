// pages/game.jsx
import { GameProvider } from '../context/gameContext'; // Adjust the path as necessary
import GameBoard from '../components/GameBoard';

const GamePage = () => {
  return (
    <GameProvider>
      <div className="game-page">
        <GameBoard />
      </div>
    </GameProvider>
  );
};

export default GamePage;
