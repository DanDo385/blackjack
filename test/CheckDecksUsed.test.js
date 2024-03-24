const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Verifying card counts in decks after drawing 12 cards", function () {
  let blackjack;
  let addr1;

  beforeEach(async function () {
    const Blackjack = await ethers.getContractFactory("Blackjack");
    const signers = await ethers.getSigners();
    addr1 = signers[1]; // Using the second signer for interactions

    blackjack = await Blackjack.deploy();
    // Assuming the contract's constructor handles initial deck creation and shuffling.
  });

  it("Verifies that each deck has 49 cards left after drawing 12 cards", async function () {
    // Draw 12 cards to simulate gameplay
    for (let i = 0; i < 12; i++) {
      await blackjack.connect(addr1).drawCard();
      // Note: Here we're not logging the drawn cards, focusing solely on the after-state of the decks
    }

    // Check that each of the 4 decks has 49 cards remaining
    for (let i = 0; i < 4; i++) {
      const deck = await blackjack.getDeck(i);
      expect(deck.length).to.equal(49, `Deck ${i+1} does not have 49 cards left.`);
    }
  });
});
