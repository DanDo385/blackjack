// Import necessary modules and functions
import { expect } from 'chai';
import pkg from 'hardhat';
const { ethers } = pkg;


describe("Blackjack Contract", function () {
  let Blackjack, blackjack, dealerHand, playerHand;

  // Deploy the contract before each test
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Blackjack = await ethers.getContractFactory("Blackjack");
    blackjack = await Blackjack.deploy();
    await blackjack.deployed();

    // Call the dealHands function to simulate a game start
    await blackjack.dealHands();

    // Fetch the dealer and player hands after dealing
    dealerHand = await blackjack.getDealerHand();
    playerHand = await blackjack.getPlayerHand();
  });

  it("should deal two cards to both player and dealer", async function () {
    // Check that both the player and the dealer have two cards each
    expect(dealerHand.length).to.equal(2);
    expect(playerHand.length).to.equal(2);

    // Log the hands to the console
    console.log("Player Hand:", playerHand);
    console.log("Dealer Hand:", dealerHand);
  });

  it("should deal cards in the correct format", async function () {
    // Using regular expression to match the card format (e.g., "A-S", "10-D")
    const cardFormat = /^[2-9]|10|[JQKA]-[CDHS]$/;

    // Check each card in the player and dealer hands matches the expected format
    playerHand.forEach(card => {
      expect(card).to.match(cardFormat);
      console.log("Player card:", card); // Log each player card
    });
    dealerHand.forEach(card => {
      expect(card).to.match(cardFormat);
      console.log("Dealer card:", card); // Log each dealer card
    });
  });

  
});
