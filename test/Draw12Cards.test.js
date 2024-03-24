const { ethers } = require("hardhat");

describe("Sequential card dealing from each deck", function () {
    let blackjack;
    let addr1;

    beforeEach(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();
        blackjack = await Blackjack.deploy();
    });

    it("should log the first twelve cards dealt from all 4 decks", async function () {
        blackjack.on("CardDealt", (card, deckIndex, event) => {
            console.log(`Card dealt from deck ${deckIndex.toNumber()}: ${card}`);
        });

        for (let i = 0; i < 12; i++) {
            await blackjack.connect(addr1).dealCard();
        }
    });
});