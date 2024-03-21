// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blackjack {
    string[] public deck;
    // Include an array to keep track of random numbers for demonstration
    uint256[] public randomNumbers;

    // Modify the DeckShuffled event to include the random number
    event DeckShuffled(uint256 indexed randomNumber);

    constructor() {
        createDeck();
    }

    function createDeck() public {
        delete deck; // Reset the deck
        string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];

        for (uint i = 0; i < suits.length; i++) {
            for (uint j = 0; j < values.length; j++) {
                deck.push(string(abi.encodePacked(values[j], suits[i])));
            }
        }
    }

    function shuffleDeck() public {
        uint256 deckSize = deck.length;
        for (uint256 i = 0; i < deckSize; i++) {
            uint256 j = pseudoRandom(i, deckSize);
            // Store the random number for demonstration
            randomNumbers.push(j);
            (deck[i], deck[j]) = (deck[j], deck[i]);
            emit DeckShuffled(j); // Emit the event with the random number
        }
    }

    function pseudoRandom(uint256 nonce, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, nonce))) % max;
    }

    function getDeck() public view returns (string[] memory) {
        return deck;
    }

    // Added for demonstration to retrieve random numbers
    function getRandomNumbers() public view returns (uint256[] memory) {
        return randomNumbers;
    }
}
