const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack Contract", function () {
  let blackjack;
  const blackjackContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; // Make sure this is defined in your .env

  before(async function () {
    // Connect to the deployed contract
    const Blackjack = await ethers.getContractFactory("Blackjack");
    blackjack = await Blackjack.attach(blackjackContractAddress);
  });

  it("Should return the player and dealer hands with 2 cards each", async function () {
    const playerHand = await blackjack.getPlayerHand();
    const dealerHand = await blackjack.getDealerHand();

    console.log("Player Hand:", playerHand);
    console.log("Dealer Hand:", dealerHand);

    // Check if both hands have 2 cards
    expect(playerHand.length).to.equal(2);
    expect(dealerHand.length).to.equal(2);

    // Additional checks to ensure the format of the cards
    playerHand.forEach(card => {
      expect(card).to.match(/[2-9]|10|[JQKA]-[CDHS]/);
    });

    dealerHand.forEach(card => {
      expect(card).to.match(/[2-9]|10|[JQKA]-[CDHS]/);
    });
  });
});
