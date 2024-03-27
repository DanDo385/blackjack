require("@nomicfoundation/hardhat-ethers");
require("dotenv").config(); // Add this line

const { INFURA_API_KEY, PRIVATE_KEY } = process.env; // Use destructuring to access environment variables

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`, // Use the Infura URL for Sepolia
      accounts: [`0x${PRIVATE_KEY}`] // Use your private key from the environment variable
    },
  },
};
