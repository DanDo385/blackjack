const { ethers } = require("hardhat");

describe("Log and verify the first twelve cards drawn", function () {
    let blackjack;
    let addr1;

    beforeEach(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();
        blackjack = await Blackjack.deploy();
    });

    it("should log the first twelve cards and verify the total drawn", async function () {
        let drawnCards = [];

        // Draw 12 cards and log each one
        for (let i = 0; i < 12; i++) {
            const tx = await blackjack.connect(addr1).drawCard();
            const receipt = await tx.wait(); // Wait for the transaction to be mined

            const cardDrawnEvent = receipt.events?.find(e => e.event === 'CardDrawn');
            if (cardDrawnEvent) {
                const cardDrawn = cardDrawnEvent.args.card;
                drawnCards.push(cardDrawn);
                console.log(`Card ${i + 1} drawn: ${cardDrawn}`);
            } else {
                console.log(`No CardDrawn event found for transaction ${i + 1}.`);
            }
        }

        // Assert that exactly 12 cards were drawn
        expect(drawnCards.length).to.equal(12);
        console.log("Total cards drawn:", drawnCards.length);
    });
});
