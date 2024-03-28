// ignition/modules/BlackjackModule.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BlackjackModule", (m) => {
  // This will prepare a deployment action for the "Blackjack" contract.
  // The actual deployment is handled by Hardhat Ignition asynchronously.
  const blackjack = m.contract("Blackjack", []);

  // Return the contract Future for possible use in other modules or for exporting.
  return { blackjack };
});
