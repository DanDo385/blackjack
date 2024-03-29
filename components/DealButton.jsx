// components/DealButton.jsx
const DealButton = ({ onClick }) => {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700"
      onClick={onClick}
    >
      Deal
    </button>
  );
};

export default DealButton;
