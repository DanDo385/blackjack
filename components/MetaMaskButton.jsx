import Image from 'next/image';
const MetaMaskButton = () => {
  const handleSignIn = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Successfully logged in
        console.log('Connected with account:', accounts[0]);
        alert(`Connected with account: ${accounts[0]}`); // Optional: alert the user
      } else {
        alert('MetaMask is not installed. Please install it to use this app.');
        console.log('MetaMask is not installed. Please install it to use this app.');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  return (
    <button onClick={handleSignIn} className="bg-orange-400 p-4 rounded-lg flex items-center text-slate-900 hover:bg-orange-600 transition-colors">
      <Image src="/images/metamask.jpg" alt="MetaMask" width={40} height={40} layout="fixed" />
      <span className="ml-2">Sign In to MetaMask</span>
    </button>
  );
};

export default MetaMaskButton;
