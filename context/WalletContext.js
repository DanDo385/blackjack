// contexts/WalletContext.js

import { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = () => {
    setIsConnected(true);
    // Here, you can add the logic to actually connect to the wallet, if needed
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    // And here, logic for disconnecting, if necessary
  };

  return (
    <WalletContext.Provider value={{ isConnected, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

