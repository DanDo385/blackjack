const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Card count and remaining cards in each deck after drawing 12 cards", function () {
  let blackjack;
  let addr1;

  beforeEach(async function () {
    const Blackjack = await ethers.getContractFactory("Blackjack");
    const signers = await ethers.getSigners();
    addr1 = signers[1]; // Using the second signer for interactions

    blackjack = await Blackjack.deploy();
  });

  it("Draw 12 cards and check counts and remaining cards", async function () {
    let drawnCards = [];

    for (let i = 0; i < 12; i++) {
      const tx = await blackjack.connect(addr1).drawCard();
      const receipt = await tx.wait();
      const cardDrawnEvent = receipt.events?.filter(e => e.event === 'CardDrawn');
      if (cardDrawnEvent && cardDrawnEvent.length > 0) {
        const cardDrawn = cardDrawnEvent[0].args.card;
        drawnCards.push(cardDrawn);
        console.log(`Card ${i + 1} drawn: ${cardDrawn}`);
      } else {
        console.error('No CardDrawn event found for this transaction.');
      }
    }

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
