const DealButton = ({ onDeal }) => {
    return (
      <button
        onClick={onDeal}
        className="bg-green-400 text-slate-900 px-4 py-2 rounded hover:bg-green-600 transition-colors"
      >
        Deal
      </button>
    );
  };
  
  export default DealButton;