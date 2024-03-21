// Import ethers from Hardhat package
const { ethers } = require("hardhat");
const { expect } = require("chai");
describe("Blackjack contract", function () {
    let blackjack;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // Deploy the contract before running tests
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        const Blackjack = await ethers.getContractFactory("Blackjack");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        blackjack = await Blackjack.deploy();
       
    });

    // Test case for shuffling the deck
    it("Should shuffle the deck", async function () {
        // Create the deck
        await blackjack.createDeck();
        
        // Get the deck before shuffling
        let deckBeforeShuffle = await blackjack.getDeck();
        console.log("Deck before shuffle:", deckBeforeShuffle);

        // Shuffle the deck
        await blackjack.shuffleDeck();

        // Get the deck after shuffling
        let deckAfterShuffle = await blackjack.getDeck();
        console.log("Deck after shuffle:", deckAfterShuffle);

        // Check if the deck has been shuffled
        // Note: This is a simplistic check. In reality, you might need a more robust way to ensure the deck is shuffled properly.
        expect(deckBeforeShuffle.toString()).to.not.equal(deckAfterShuffle.toString(), "The deck should be shuffled");
    });
});
