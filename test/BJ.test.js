const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Contract", function () {
    let blackjack;
    let accounts;

    before(async function () {
        accounts = await ethers.getSigners();
        const Blackjack = await ethers.getContractFactory("Blackjack");
        blackjack = await Blackjack.deploy();
    });

    it("Should view and then remove the top 20 cards from the deck, checking card count", async function () {
        for (let i = 0; i < 20; i++) {
            let topCard = await blackjack.dealCard();
            console.log(`Viewed Card ${i + 1}: ${topCard}`);
            await blackjack.removeTopCard();
        }
        let cardCount = await blackjack.getCardCount();
        console.log(`Card Count after 20 cards: ${cardCount}`);
        // Add an expect here to automatically check cardCount if you have a specific expected value
        // expect(cardCount).to.equal(<expected_value>);
    });
});
