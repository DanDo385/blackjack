// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blackjack {
    string[] private deck;

    event CardDealt(string card);

    constructor() {
        initializeDeck();
        shuffleDeck();
    }

    function initializeDeck() internal {
        delete deck; // Clear the current deck
        string[13] memory ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];

        for(uint i = 0; i < suits.length; i++) {
            for(uint j = 0; j < ranks.length; j++) {
                deck.push(string(abi.encodePacked(ranks[j], "-",suits[i])));
            }
        }
    }

    function shuffleDeck() internal {
        for (uint256 i = 0; i < deck.length; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(block.timestamp))) % (deck.length - i);
            string memory temp = deck[i];
            deck[i] = deck[n];
            deck[n] = temp;
        }
    }

    // View function to see the top card without altering the deck
    function dealCard() public view returns (string memory) {
        require(deck.length > 0, "Deck is empty");
        return deck[deck.length - 1];
    }

    // Function to remove the top card from the deck
    function removeTopCard() public {
        require(deck.length > 0, "Deck is empty");
        deck.pop();
        emit CardDealt(deck[deck.length - 1]); // Emit the next top card after removal
    }
}
