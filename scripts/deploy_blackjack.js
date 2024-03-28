// scripts/deploy_blackjack.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Blackjack = await ethers.getContractFactory("Blackjack");
  const blackjack = await Blackjack.deploy();

  await blackjack.deployed();
  console.log("Blackjack contract deployed to:", blackjack.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
