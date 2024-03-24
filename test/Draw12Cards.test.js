const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Deal and log cards from each deck", function () {
    let blackjack;
    let addr1;

    beforeEach(async function () {
        // Deploy the Blackjack contract
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();
        blackjack = await Blackjack.deploy();
    });

    it("should deal and log 12 cards, cycling through each of the 4 decks", async function () {
        // Array to keep track of dealt cards for verification
        let cardsDealt = [];

        // Listen for the CardDealt event to log the dealt cards
        await new Promise((resolve, reject) => {
            blackjack.on("CardDealt", (card, deckIndex) => {
                console.log(`Card dealt from deck ${deckIndex.toNumber()}: ${card}`);
                cardsDealt.push(card);

                // Resolve the promise once 12 cards have been dealt
                if (cardsDealt.length === 12) {
                    resolve();
                }
            });

            // Trigger the dealCard function 12 times
            const dealCards = async () => {
                for (let i = 0; i < 12; i++) {
                    await blackjack.connect(addr1).dealCard();
                }
            };

            // Deal the cards
            dealCards().catch(reject);
        });

        // Optional: Verify that 12 cards were indeed dealt
        expect(cardsDealt.length).to.equal(12);

        // Verify each deck has 49 cards left after dealing 12 cards
        for (let i = 0; i < 4; i++) {
            const deckSize = (await blackjack.getDeck(i)).length;
            expect(deckSize).to.equal(49, `Deck ${i + 1} does not have 49 cards left.`);
        }
    });
});
