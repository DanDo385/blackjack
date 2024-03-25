const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blackjack", function () {
  let blackjack;
  let owner;
  let addr1;

  beforeEach(async function () {
    const Blackjack = await ethers.getContractFactory("Blackjack");
    [owner, addr1] = await ethers.getSigners();
    blackjack = await Blackjack.deploy();
  });

  it("Should draw and log the first 10 cards", async function () {
    const firstTen = [];

    await new Promise(async (resolve, reject) => {
      blackjack.on("CardDealt", (card, event) => {
        console.log(`Card dealt: ${card}`);
        firstTen.push(card);

        if (firstTen.length === 10) {
          resolve();
        }
      });

      for (let i = 0; i < 10; i++) {
        try {
          await blackjack.drawCard();
        } catch (error) {
          reject(error);
        }
      }
    });

    expect(firstTen).to.have.lengthOf(10);
  });
});