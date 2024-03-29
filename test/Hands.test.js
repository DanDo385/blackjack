// Import ethers from Hardhat environment
const { ethers } = require("hardhat");

async function main() {
  // Use the contract address from your .env file
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  // Assuming the Blackjack contract ABI is accessible at the specified path
  const contractABI = require("../artifacts/contracts/Blackjack.sol/Blackjack.json").abi;

  // Connect to the contract using the first signer
  const [signer] = await ethers.getSigners();
  const blackjackContract = new ethers.Contract(contractAddress, contractABI, signer);

  // Fetch the player and dealer hands
  const playerHand = await blackjackContract.getPlayerHand();
  const dealerHand = await blackjackContract.getDealerHand();

  // Log the hands to the console
  console.log("Player Hand:", playerHand);
  console.log("Dealer Hand:", dealerHand);

  // Perform any additional checks here
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
