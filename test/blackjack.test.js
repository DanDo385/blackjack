// test/blackjack.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Contract", function () {
  let blackjack;

  beforeEach(async function () {
    const Blackjack = await ethers.getContractFactory("Blackjack");
    blackjack = await Blackjack.deploy();
    
    // Initialize and shuffle the deck, then deal hands explicitly
    await blackjack.initializeDeck();
    await blackjack.shuffleDeck();
    await blackjack.dealHands();

    const playerHand = await blackjack.getPlayerHand();
    const dealerHand = await blackjack.getDealerHand();

    console.log("Player Hand:", playerHand);
    console.log("Dealer Hand:", dealerHand);
  });

  it("should have two cards each in playerHand and dealerHand", async function () {
    const playerHand = await blackjack.getPlayerHand();
    const dealerHand = await blackjack.getDealerHand();
    
    expect(playerHand.length).to.equal(2);
    expect(dealerHand.length).to.equal(2);
  });
});
