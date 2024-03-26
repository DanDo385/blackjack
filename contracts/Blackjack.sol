// SPDX-License-Identifier: ISC
pragma solidity 0.8.24;

contract Blackjack {
    string[][4] public decks; // Array of 4 decks
    uint256 public currentDeckIndex = 0; // Index to track the current deck in use
    int256 public cardCount = 0; // Initialize card counting variable
    int256 public trueCount = 0; // Initialize true count variable
    uint256 public cardsDealt = 0; // Initialize cards dealt counter

    event DeckShuffled(uint256 deckIndex);
    event CardDealt(string card, uint256 deckIndex, int256 cardCount, int256 trueCount);
    event TrueCountUpdated(int256 trueCount);

    constructor() {
        for (uint256 i = 0; i < decks.length; i++) {
            createDeck(i);
            shuffleDeck(i);
        }
    }

    function createDeck(uint256 deckIndex) internal {
        delete decks[deckIndex]; // Clear the deck at index
        string[13] memory values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        string[4] memory suits = ["C", "D", "H", "S"];
        for (uint i = 0; i < suits.length; i++) {
            for (uint j = 0; j < values.length; j++) {
                decks[deckIndex].push(string(abi.encodePacked(values[j], "-", suits[i])));
            }
        }
    }

    function shuffleDeck(uint256 deckIndex) public {
        for (uint256 i = 0; i < decks[deckIndex].length - 1; i++) {
            uint256 j = i + pseudoRandom(i, decks[deckIndex].length - i, deckIndex);
            string memory temp = decks[deckIndex][i];
            decks[deckIndex][i] = decks[deckIndex][j];
            decks[deckIndex][j] = temp;
        }
        cardCount = 0; // Reset card count when deck is shuffled
        emit DeckShuffled(deckIndex);
    }

    function pseudoRandom(uint256 seed, uint256 max, uint256 deckIndex) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, seed, deckIndex))) % max;
    }

    function drawCard() public returns (string memory) {
        uint256 deckIndex = currentDeckIndex % decks.length;
        uint lastIndex = decks[deckIndex].length - 1;
        string memory drawnCard = decks[deckIndex][lastIndex];
        decks[deckIndex].pop();
        cardsDealt++;

        // Update card count based on the card value
        updateCardCount(drawnCard);

        // Update true count
        updateTrueCount();

        emit CardDealt(drawnCard, deckIndex, cardCount, trueCount);

        // Rotate to the next deck if needed
        if (lastIndex == 0) {
            currentDeckIndex++;
            if (decks[deckIndex].length == 0) { // Recreate and reshuffle if deck is empty
                createDeck(deckIndex);
                shuffleDeck(deckIndex);
            }
        }

        return drawnCard;
    }

    function updateCardCount(string memory card) internal {
        bytes memory value = bytes(card);
        if (value[0] == '2' || value[0] == '3' || value[0] == '4' || value[0] == '5' || value[0] == '6') {
            cardCount += 1;
        } else if (value[0] == '1' || value[0] == 'J' || value[0] == 'Q' || value[0] == 'K' || value[0] == 'A') {
            cardCount -= 1;
        }
    }

    function updateTrueCount() internal {
        uint256 decksRemaining = ((208 - cardsDealt) + 51) / 52; // +51 to ensure rounding up
        if(decksRemaining == 0) decksRemaining = 1; // Prevent division by zero
        trueCount = cardCount / int256(decksRemaining);
    }
}
