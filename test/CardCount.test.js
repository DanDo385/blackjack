// tests/CardCount.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack", function () {
  let blackjack;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const Blackjack = await ethers.getContractFactory("Blackjack");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new contract before each test.
    blackjack = await Blackjack.deploy();
    await blackjack.deployed();
  });

  it("Should deal 20 cards and update cardCount correctly", async function () {
    // Draw 20 cards.
    for (let i = 0; i < 20; i++) {
      await blackjack.drawCard();
    }

    // Retrieve the cardCount from the contract.
    const cardCount = await blackjack.cardCount();

    // We are not sure what the card count should be because it's pseudo-random,
    // but we know it should be an integer between -20 and 20.
    expect(cardCount).to.be.at.least(-20);
    expect(cardCount).to.be.at.most(20);

    // Check the number of cards dealt.
    const cardsDealt = await blackjack.cardsDealt();
    expect(cardsDealt).to.equal(20);
  });
});
