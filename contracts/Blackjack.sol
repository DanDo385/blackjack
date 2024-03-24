// SPDX-License-Identifier: ISC
pragma solidity ^0.8.24;

contract Blackjack {
    string[][4] public decks; // Array of 4 decks, each deck is an array of strings
    uint public currentDeckIndex = 0; // Tracks the current deck to draw from

    // Events to signal actions within the contract
    event DeckCreated(uint deckIndex);
    event DeckShuffled(uint deckIndex);
    event CardDealt(string card, uint deckIndex);

    // Constructor to initialize the decks and shuffle them
    constructor() {
        createDecks();
        shuffleDecks();
    }

    // Internal function to create 4 decks of cards
    function createDecks() internal {
        for (uint deckIndex = 0; deckIndex < 4; deckIndex++) {
            delete decks[deckIndex]; // Clear existing deck
            string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
            string[4] memory suits = ["C", "D", "H", "S"];
            for (uint i = 0; i < suits.length; i++) {
                for (uint j = 0; j < values.length; j++) {
                    decks[deckIndex].push(string(abi.encodePacked(values[j], "-", suits[i])));
                }
            }
            emit DeckCreated(deckIndex); // Signal that a deck has been created
        }
    }

    // Internal function to shuffle each of the 4 decks
    function shuffleDecks() internal {
        for (uint i = 0; i < 4; i++) {
            shuffleDeck(i); // Shuffle each deck
        }
    }

    // Public function to shuffle a specific deck
    function shuffleDeck(uint deckIndex) public {
        require(deckIndex < 4, "Invalid deck index"); // Ensure the deck index is valid
        for (uint256 i = 0; i < decks[deckIndex].length - 1; i++) {
            uint256 j = i + pseudoRandom(i, decks[deckIndex].length - i);
            string memory temp = decks[deckIndex][j];
            decks[deckIndex][j] = decks[deckIndex][i];
            decks[deckIndex][i] = temp;
        }
        emit DeckShuffled(deckIndex); // Signal that a deck has been shuffled
    }

    // Private function to generate a pseudo-random number
    function pseudoRandom(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % max;
    }

    // Function to draw one card from the current deck and move to the next
    function drawCard() public returns (string memory) {
    uint lastIndex = decks[currentDeckIndex].length - 1; // Get the last index
    string memory drawnCard = decks[currentDeckIndex][lastIndex]; // Get the last card
    decks[currentDeckIndex].pop(); // Remove the card from the deck
    emit CardDealt(drawnCard, currentDeckIndex); // Signal that a card has been dealt

    // Move to the next deck, cycling back to 0 if we've reached the last deck
    currentDeckIndex = (currentDeckIndex + 1) % 4;
    return drawnCard; // Corrected to return 'drawnCard' instead of 'cardDrawn'
}
}
