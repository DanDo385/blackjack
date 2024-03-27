const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Contract", function () {
    let blackjack;

    before(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        blackjack = await Blackjack.deploy();
    });

    it("Player and Dealer should have 2 cards each", async function () {
        const playerHand = await blackjack.getPlayerHand();
        const dealerHand = await blackjack.getDealerHand();

        console.log(`Player Hand: ${playerHand}`);
        console.log(`Dealer Hand: ${dealerHand}`);

        expect(playerHand.length).to.equal(2);
        expect(dealerHand.length).to.equal(2);
    });
});

