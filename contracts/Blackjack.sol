// SPDX-License-Identifier: ISC
pragma solidity ^0.8.24;

contract Blackjack {
    string[][4] public decks;
    uint public currentDeckIndex = 0;

    event DeckCreated(uint deckIndex);
    event DeckShuffled(uint deckIndex);
    event CardDealt(string card, uint deckIndex);

    constructor() {
        createDecks();
        shuffleDecks();
    }

    function createDecks() internal {
        for (uint deckIndex = 0; deckIndex < 4; deckIndex++) {
            delete decks[deckIndex];
            string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
            string[4] memory suits = ["C", "D", "H", "S"];
            for (uint i = 0; i < suits.length; i++) {
                for (uint j = 0; j < values.length; j++) {
                    decks[deckIndex].push(string(abi.encodePacked(values[j], "-", suits[i])));
                }
            }
            emit DeckCreated(deckIndex);
        }
    }

    function shuffleDecks() internal {
        for (uint i = 0; i < 4; i++) {
            shuffleDeck(i);
        }
    }

    // Retrieve the current state of a specific deck
    function getDeck(uint deckIndex) public view returns (string[] memory) {
        require(deckIndex < 4, "Invalid deck index");
        return decks[deckIndex];
    }

    function shuffleDeck(uint deckIndex) public {
        require(deckIndex < 4, "Invalid deck index");
        for (uint256 i = 0; i < decks[deckIndex].length - 1; i++) {
            uint256 j = i + pseudoRandom(i, decks[deckIndex].length - i);
            string memory temp = decks[deckIndex][j];
            decks[deckIndex][j] = decks[deckIndex][i];
            decks[deckIndex][i] = temp;
        }
        emit DeckShuffled(deckIndex);
    }

    function pseudoRandom(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % max;
    }

    function dealCard() public returns (string memory) {
        require(decks[currentDeckIndex].length > 0, "Deck is empty");
        string memory cardDealt = decks[currentDeckIndex][decks[currentDeckIndex].length - 1];
        decks[currentDeckIndex].pop();
        
        emit CardDealt(cardDealt, currentDeckIndex);
        
        currentDeckIndex = (currentDeckIndex + 1) % 4;
        return cardDealt;
    }
}
