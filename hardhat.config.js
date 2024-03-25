require("@nomiclabs/hardhat-ethers");

const ALCHEMY_API_KEY = "6o-fd07qH90Dzpteuy94IMNZTPvaF-1Q";
const SEPOLIA_PRIVATE_KEY = "0x77f2C0AccB989322F5a91Aa7D438FB0f43828c11";

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${ALCHEMY_API_KEY}`,
      accounts: [`${SEPOLIA_PRIVATE_KEY}`]
    }
  }
};
