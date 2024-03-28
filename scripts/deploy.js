// scripts/deploy.js
const hre = require("@nomicfoundation/hardhat-ethers");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("Blackjack");
  const contract = await Contract.deploy();
  
  // The contract is deployed when the promise resolves
  console.log("Blackjack contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
