// ignition/modules/BlackjackModule.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BlackjackModule", async (m) => {
  const blackjack = await m.contract("Blackjack", []);
  return { blackjack };
});
