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

    it("Should view and then remove the top 20 cards from the deck", async function () {
        for (let i = 0; i < 20; i++) {
            let topCard = await blackjack.dealCard();
            console.log(`Viewed Card ${i + 1}: ${topCard}`);
            await blackjack.removeTopCard();
        }
    });
});
