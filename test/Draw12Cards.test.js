const { ethers } = require("hardhat");

describe("Sequential card drawing from each deck", function () {
    let blackjack;
    let addr1;

    beforeEach(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();

        blackjack = await Blackjack.deploy();
    });

    it("should draw the first twelve cards by alternating through each of the four decks", async function () {
        for (let i = 0; i < 12; i++) {
            const tx = await blackjack.connect(addr1).drawCard();
            const receipt = await tx.wait(); // Wait for the transaction to be mined

            const cardDrawnEvent = receipt.events?.find(e => e.event === 'CardDrawn');
            if (cardDrawnEvent) {
                const cardDrawn = cardDrawnEvent.args.card;
                const deckIndex = cardDrawnEvent.args.deckIndex;
                console.log(`Card ${i + 1} drawn from deck ${deckIndex}: ${cardDrawn}`);
            } else {
                console.log(`No CardDrawn event found for transaction ${i + 1}.`);
            }
        }
    });
});
