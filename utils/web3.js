// utils/web3.js

import { ethers } from 'ethers';

let provider;

// Initializes a provider
export function initProvider() {
  // Use window.ethereum which is injected by MetaMask and other Ethereum wallet browser extensions.
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    // We're in the browser and MetaMask is running.
    window.ethereum.request({ method: 'eth_requestAccounts' }); // Request access to account
    provider = new ethers.providers.Web3Provider(window.ethereum);
  } else {
    // We're on the server *OR* the user is not running MetaMask
    const url = "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"; // Use an Infura node if not connected to MetaMask
    provider = new ethers.providers.JsonRpcProvider(url);
  }
  return provider;
}

// Fetches the current signer
export async function getSigner() {
  if (!provider) {
    initProvider();
  }
  return provider.getSigner();
}

// Connects to a smart contract
export function getContract(address, abi) {
  if (!provider) {
    initProvider();
  }
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  return contract;
}
