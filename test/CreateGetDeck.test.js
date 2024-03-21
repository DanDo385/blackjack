// CreateGetDeck.test.js
const { expect } = require("chai");

describe("Blackjack", function () {
  it("Should deploy the contract and create a deck", async function () {
    const [owner] = await ethers.getSigners();
    const Blackjack = await ethers.getContractFactory("Blackjack");
    const blackjack = await Blackjack.deploy();

    await blackjack.deployTransaction.wait();
    const deployedBlackjack = await Blackjack.attach(blackjack.address);
    const deck = await deployedBlackjack.getDeck();
    expect(deck).to.be.an('array');
    console.log(deck);
  }).catch((error) => {
    console.error(error);
    throw error;
  });
});