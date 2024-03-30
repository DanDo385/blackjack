// DealCards.js

const { ethers } = require("hardhat");

async function main() {
  // You need to replace 'YOUR_CONTRACT_ADDRESS' with the actual contract address.
  const contractAddress = '0x8ae2a91f34fa0a1a88584b43696eee88d609d219';
  
  // Getting the contract ABI and deployed contract instance
  const Blackjack = await ethers.getContractFactory("Blackjack");
  const blackjack = await Blackjack.attach(contractAddress);

  // Running the contract functions
  console.log("Initializing the deck...");
  await blackjack.initializeDeck();

  console.log("Shuffling the deck...");
  await blackjack.shuffleDeck();

  console.log("Dealing hands...");
  const tx = await blackjack.dealHands();
  await tx.wait(); // Wait for the transaction to be mined

  // Getting the updated hands and card count
  const dealerHand = await blackjack.getDealerHand();
  const playerHand = await blackjack.getPlayerHand();
  const cardCount = await blackjack.getCardCount();

  console.log("Dealer Hand:", dealerHand);
  console.log("Player Hand:", playerHand);
  console.log("Card Count:", cardCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
