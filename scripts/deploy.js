// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Blackjack = await hre.ethers.getContractFactory("Blackjack");
  const blackjack = await Blackjack.deploy(); // Include any constructor arguments inside deploy()

  console.log("Blackjack contract deployed to:", blackjack.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

