// scripts/deploy.js
import { ethers } from "hardhat";
async function main() {
    const [deployer] = await ethers.getSigners();
    const provider = ethers.provider;
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await provider.getBalance(deployer.address)).toString());

    const Blackjack = await ethers.getContractFactory("Blackjack");
    const blackjack = await Blackjack.deploy(); // Deploy the contract

    console.log("Blackjack deployed to:", blackjack.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });