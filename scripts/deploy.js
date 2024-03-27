// scripts/deploy.js
const { ethers } = require("hardhat");
require("dotenv").config(); // Load environment variables

async function main() {
  const Blackjack = await ethers.getContractFactory("Blackjack");

  // Start deployment, returning a promise that resolves to a contract object
  const blackjackContract = await Blackjack.deploy();

  console.log("Blackjack Contract deployed to:", blackjackContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
