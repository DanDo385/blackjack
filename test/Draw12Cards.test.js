const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Sequential card dealing from each deck", function () {
    let blackjack;
    let addr1;

    beforeEach(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();
        blackjack = await Blackjack.deploy();
    });

    it("should log the first twelve cards dealt from all 4 decks", async function () {
        let cardsDealt = [];

        blackjack.on("CardDealt", (card, deckIndex, event) => {
            console.log(`Card dealt from deck ${deckIndex.toNumber()}: ${card}`);
            cardsDealt.push(card);
        });

        for (let i = 0; i < 12; i++) {
            await blackjack.connect(addr1).dealCard();
        }

        // Optional: Verify that 12 cards were indeed logged
        expect(cardsDealt.length).to.equal(12);

        // Verify each deck has 49 cards left
        for (let i = 0; i < 4; i++) {
            const deckSize = (await blackjack.getDeck(i)).length;
            expect(deckSize).to.equal(49, `Deck ${i + 1} does not have 49 cards left.`);
        }
    });
});