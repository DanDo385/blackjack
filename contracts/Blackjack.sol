// SPDX-License-Identifier: ISC  
// Blackjack.sol
pragma solidity 0.8.24;

contract Blackjack {
    string[] private deck;

    function createDeck() public {
        // Arrays of card values and suits
        string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];

        // Double loop to create each card and add it to the deck
        for (uint i = 0; i < suits.length; i++) {
            for (uint j = 0; j < values.length; j++) {
                deck.push(string(abi.encodePacked(values[j], "-", suits[i])));
            }
        }
    }

    // Function to retrieve the deck
    function getDeck() public view returns (string[] memory) {
        return deck;
    }

    function shuffleDeck() public {
        for (uint256 i = 0; i < deck.length; i++) {
            uint256 j = pseudoRandom(i, deck.length);
            (deck[i], deck[j]) = (deck[j], deck[i]);   
        }
    }

    function pseudoRandom(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, seed))) % max;
    }
}