// pages/index.js
export default function Home() {
    async function loginWithMetaMask() {
      // Logic to handle MetaMask login
      // For simplicity, it's not implemented here
      console.log("Logging in with MetaMask");
    }
  
    return (
      <div className="h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/br-eth-green.jpg')" }}>
        <div className="flex h-full justify-center items-center">
          <button
            onClick={loginWithMetaMask}
            className="text-slate-900 bg-orange-500 hover:bg-orange-600 font-bold py-2 px-4 rounded"
          >
            Log Into MetaMask to Sign into the Sepolia Network
          </button>
        </div>
      </div>
    );
  }
  