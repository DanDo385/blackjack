const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Card count and remaining cards in each deck after drawing 12 cards", function () {
  let blackjack;
  let addr1;

  beforeEach(async function () {
    const Blackjack = await ethers.getContractFactory("Blackjack");
    [addr1] = await ethers.getSigners();

    blackjack = await Blackjack.deploy();
  });

  it("Draw 12 cards and check counts and remaining cards", async function () {
    let drawnCards = [];

    for (let i = 0; i < 12; i++) {
      await blackjack.connect(addr1).drawCard();
    }

    // Fetch the logs for drawn cards
    const filter = blackjack.filters.CardDrawn(null, null);
    const logs = await blackjack.queryFilter(filter, "latest");
    logs.forEach((log, index) => {
      drawnCards.push(log.args.card);
      console.log(`Card ${index + 1} drawn: ${log.args.card}`);
    });

    console.log("First 12 drawn cards:", drawnCards.join(", "));

    const cardCount = await blackjack.cardCount();
    const trueCount = await blackjack.trueCount();
    
    console.log("Card Count after 12th draw:", cardCount.toString());
    console.log("True Count after 12th draw:", trueCount.toString());

    for (let i = 0; i < 4; i++) {
      const deck = await blackjack.getDeck(i);
      expect(deck.length).to.equal(49, `Deck ${i+1} does not have 49 cards left.`);
    }
  });
});
