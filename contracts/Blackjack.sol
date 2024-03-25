// SPDX-License-Identifier: ISC
// contracts/BlackjackCards.sol
pragma solidity 0.8.24;

contract BlackjackCards {
    string[] public deck; // Single deck of cards

    event DeckShuffled();
    event CardDealt(string card);

    constructor() {
        createDeck();
        shuffleDeck();
    }

    function createDeck() internal {
        delete deck; // Clear existing deck
        string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];
        for (uint i = 0; i < suits.length; i++) {
            for (uint j = 0; j < values.length; j++) {
                deck.push(string(abi.encodePacked(values[j], "-", suits[i])));
            }
        }
    }

    function shuffleDeck() public {
        for (uint256 i = 0; i < deck.length - 1; i++) {
            uint256 j = i + pseudoRandom(i, deck.length - i);
            // Use a temporary variable for the swap
            string memory temp = deck[i];
            deck[i] = deck[j];
            deck[j] = temp;
        }
        emit DeckShuffled();
    }

    function pseudoRandom(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % max;
    }

    function drawCard() public returns (string memory) {
        uint lastIndex = deck.length - 1;
        string memory drawnCard = deck[lastIndex];
        deck.pop();
        emit CardDealt(drawnCard);
        return drawnCard;
    }
}
