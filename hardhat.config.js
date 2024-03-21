require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
      // If your local node requires specific settings like accounts, you can add them here
    }
    // You can add other network configurations here as needed
  },
  solidity: "0.8.24",
};
