const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Drawing 12 cards without redeploying", function () {
    let blackjack;
    let addr1;

    before(async function () {
        // Deploy the contract once before all tests
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [addr1] = await ethers.getSigners();
        blackjack = await Blackjack.deploy();
    });

    it("draws 12 cards sequentially from the same contract instance", async function () {
        let cardsDrawn = [];

        // Draw 12 cards and push each result into the cardsDrawn array
        for (let i = 0; i < 12; i++) {
            const card = await blackjack.connect(addr1).drawCard();
            cardsDrawn.push(card);
        }

        // Log each drawn card for verification
        console.log("Cards drawn:", cardsDrawn);

        // Perform your assertions here
        // Example: Check if 12 cards were indeed drawn
        expect(cardsDrawn.length).to.equal(12);
    });

    // Add any other tests here if needed
});
