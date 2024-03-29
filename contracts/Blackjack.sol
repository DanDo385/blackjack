// SPDX-License-Identifier: MIT
// contracts/Blackjack.sol
pragma solidity 0.8.24;

contract Blackjack {
    string[] private deck;
    string[] private playerHand;
    string[] private dealerHand;
    int private cardCount;
    uint private constant INITIAL_DECK_SIZE = 52; // Standard deck size

    event CardDealt(string card);
    event DeckShuffled();

    constructor() {
        initializeDeck();
        shuffleDeck();
        dealHands(); // Deal hands upon contract deployment
    }

    function initializeDeck() public {
        delete deck; // Clear any existing deck
        string[13] memory ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];
        for(uint i = 0; i < suits.length; i++) {
            for(uint j = 0; j < ranks.length; j++) {
                deck.push(string(abi.encodePacked(ranks[j], "-", suits[i])));
            }
        }
    }

    function shuffleDeck() public {
        for(uint256 i = 0; i < deck.length; i++) {
            uint256 n = i + uint256(keccak256(abi.encodePacked(block.timestamp, i))) % (deck.length - i);
            string memory temp = deck[n];
            deck[n] = deck[i];
            deck[i] = temp;
        }
        emit DeckShuffled();
    }

    function dealHands() public {
        for(int i = 0; i < 2; i++) {
            playerHand.push(dealCard());
            dealerHand.push(dealCard());
        }
    }

    function dealCard() internal returns (string memory) {
        require(deck.length > 0, "Deck is empty");
        if (deck.length <= INITIAL_DECK_SIZE / 4) {
            shuffleDeck();
        }
        string memory card = deck[deck.length - 1];
        deck.pop();
        updateCardCount(card);
        return card;
    }

    function updateCardCount(string memory card) internal {
        bytes memory cardBytes = bytes(card);
        if(cardBytes[0] >= '2' && cardBytes[0] <= '6') {
            cardCount += 1;
        } else if(cardBytes[0] == '1' || (cardBytes[0] == 'J' || cardBytes[0] == 'Q' || cardBytes[0] == 'K' || cardBytes[0] == 'A')) {
            cardCount -= 1;
        }
    }

    function getPlayerHand() public view returns (string[] memory) {
        return playerHand;
    }

    function getDealerHand() public view returns (string[] memory) {
        return dealerHand;
    }

    function getCardCount() public view returns (int) {
        return cardCount;
    }
}
