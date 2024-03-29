// components/GameBoard.jsx
import Hand from './Hand'; // Import the Hand component
import DealButton from './DealButton'; // Import DealButton
import CheatsheetDrawer from './CheatsheetDrawer'; // Import CheatsheetDrawer
import ActionButtons from './ActionButtons'; // Import ActionButtons

const GameBoard = ({ dealerHand, playerHand, onDealCards, gameState, onHit, onStand /*, onDoubleDown, onSplit, onInsurance */ }) => {
  return (
    <div className="game-board bg-cover bg-center min-h-screen" style={{ backgroundImage: "url('/images/boards/eth-board.jpg')" }}>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="dealer-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Dealer's Hand:</h2>
          <Hand cards={dealerHand} />
        </div>
        <div className="player-hand mb-8">
          <h2 className="text-white text-2xl mb-2">Player's Hand:</h2>
          <Hand cards={playerHand} />
        </div>
        {/* Passing only the functions that are currently in use */}
        <ActionButtons
          onHit={onHit}
          onStand={onStand}
          // onDoubleDown={onDoubleDown}
          // onSplit={onSplit}
          // onInsurance={onInsurance}
          gameState={gameState}
        />
        <div className="flex justify-center my-4">
          <DealButton onClick={onDealCards} />
        </div>
        <CheatsheetDrawer />
      </div>
    </div>
  );
};

export default GameBoard;

