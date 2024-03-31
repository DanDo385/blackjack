// utils/web3.js
import Web3 from 'web3';

let web3;

export function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error("User denied account access");
    }
  }
  else if (window.web3) { // Legacy dapp browsers...
    web3 = new Web3(window.web3.currentProvider);
  }
  else { // If no injected web3 instance is detected, fall back to Ganache
    const provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(provider);
  }
  return web3;
}

export const getContract = async (abi, contractAddress) => {
  const web3 = initWeb3();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = contractAddress[networkId];
  return new web3.eth.Contract(abi, deployedNetwork && deployedNetwork.address);
};
