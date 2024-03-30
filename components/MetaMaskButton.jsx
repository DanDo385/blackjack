// components/MetaMaskButton.tsx
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';

const MetaMaskButton = () => {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    setError(''); 
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected with account:', accounts[0]);
        // Redirect to the game page after successful connection
        router.push('/game');
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
        <Image src="/images/metamask.jpg" alt="MetaMask" width={40} height={40} unoptimized />
        <span className="ml-2">Sign In to MetaMask</span>
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default MetaMaskButton;
