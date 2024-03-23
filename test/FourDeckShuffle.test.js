// test/FourDeckShuffle.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Four-Deck Shuffle", function () {
    let blackjack;

    before(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        blackjack = await Blackjack.deploy();
        await blackjack.createDecks(); // Use createDecks() to create all four decks
        for (let i = 0; i < 4; i++) {
            await blackjack.shuffleDeck(i); // Shuffle each deck
        }
    });

    it("Should create and shuffle all four decks", async function () {
        for (let i = 0; i < 4; i++) {
            const deck = await blackjack.getDeck(i); // Fetch each deck by index

            expect(deck).to.be.an('array');
            expect(deck.length).to.equal(52);

            console.log(`Shuffled Deck ${i + 1}:`, deck);

            deck.forEach(card => {
                expect(card).to.match(/^\d+|\w+-[CDHS]$/); // Check card format
            });
        }
    });
});
