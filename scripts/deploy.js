// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const BlackjackGame = await hre.ethers.getContractFactory("BlackjackGame");
  const blackjackGame = await BlackjackGame.deploy();

  await blackjackGame.deployed();

  console.log("BlackjackGame deployed to:", blackjackGame.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
