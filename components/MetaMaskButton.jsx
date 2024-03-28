import Image from 'next/future/image'; // For Next.js 12 and newer
import { useState } from 'react';

const MetaMaskButton = () => {
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError(''); 
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected with account:', accounts[0]);
        
      } else {
        setError('MetaMask is not installed. Please install it to use this app.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setError('Failed to connect to MetaMask. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handleSignIn} className="bg-orange-400 p-4 rounded-lg flex items-center text-slate-900 hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
        <Image src="/images/metamask.jpg" alt="MetaMask" width={40} height={40} fill={false} />
        <span className="ml-2">Sign In to MetaMask</span>
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default MetaMaskButton;
