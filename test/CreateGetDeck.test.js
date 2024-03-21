// CreateGetDeck.test.js

const { expect } = require("chai");

describe("Blackjack", function () {
  it("Should deploy the contract, create a deck, and retrieve it", async function () {
    const [owner] = await ethers.getSigners();
    const Blackjack = await ethers.getContractFactory("Blackjack");
    const blackjack = await Blackjack.deploy();

    // Call createDeck() to populate the deck
    await blackjack.createDeck();

    // Retrieve the populated deck
    const deck = await blackjack.getDeck();
    expect(deck).to.be.an('array');
    expect(deck.length).to.equal(52); // There should be 52 cards in the deck
    console.log(deck); // This should now log the populated deck
  });
});



