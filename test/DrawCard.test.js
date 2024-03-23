// test/DrawCard.test.js 
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Card Drawing", function () {
    let blackjack;

    before(async function () {
        const Blackjack = await ethers.getContractFactory("Blackjack");
        blackjack = await Blackjack.deploy();
        await blackjack.createDecks(); // Create all four decks
        for (let i = 0; i < 4; i++) {
            await blackjack.shuffleDeck(i); // Shuffle each deck
        }
    });

    it("Should draw the last card from the first deck and log the deck", async function () {
        // Fetch the state of the first deck before drawing a card
        const initialDeck = await blackjack.getDeck(0);
        console.log(`Deck before drawing a card: ${JSON.stringify(initialDeck)}`);
        
        // Draw the last card from the current deck
        const drawTx = await blackjack.drawCard(); // Initiates the draw operation
        await drawTx.wait(); // Wait for the transaction to be mined
        
        // Optional: Fetch the state of the deck after drawing the card to see the updated state
        const updatedDeck = await blackjack.getDeck(0);
        console.log(`Deck after drawing a card: ${JSON.stringify(updatedDeck)}`);
        
        // Fetch the CardDrawn event from the transaction receipt to verify the drawn card
        const receipt = await ethers.provider.getTransactionReceipt(drawTx.hash);
        const cardDrawnEvent = receipt.logs.map(log => blackjack.interface.parseLog(log)).find(log => log.name === "CardDrawn");
        
        // Verify the drawn card is the last card we expected
        const lastCard = initialDeck[initialDeck.length - 1]; // Get the last card for verification
        expect(cardDrawnEvent.args.card).to.equal(lastCard);
        console.log(`Drawn Card: ${cardDrawnEvent.args.card}`);
    });
});
