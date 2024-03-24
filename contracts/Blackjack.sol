// SPDX-License-Identifier: ISC
pragma solidity ^0.8.24;

contract Blackjack {
    string[][4] public decks;
    uint public currentDeckIndex = 0;
    int public cardCount = 0;
    int public trueCount = 0;
    uint public cardsDrawn = 0;
    uint constant totalCards = 52 * 4; // Total cards in 4 decks

    event DeckCreated(uint deckIndex);
    event DeckShuffled(uint deckIndex);
    event CardDrawn(string card, uint deckIndex);

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

    function getDeck(uint deckIndex) public view returns (string[] memory) {
        require(deckIndex < 4, "Invalid deck index");
        return decks[deckIndex];
    }

    function shuffleDeck(uint deckIndex) public {
        require(deckIndex < 4, "Invalid deck index");
        for (uint256 i = 0; i < decks[deckIndex].length - 1; i++) {
            uint256 j = i + pseudoRandom(i, decks[deckIndex].length - i);
            string memory temp = decks[deckIndex][i];
            decks[deckIndex][i] = decks[deckIndex][j];
            decks[deckIndex][j] = temp;
        }
        emit DeckShuffled(deckIndex);
    }

    function pseudoRandom(uint256 seed, uint256 max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % max;
    }

    function drawCard() public returns (string memory) {
        require(!listenShuffle(), "Shuffling... Please wait.");
        string memory cardDrawn = decks[currentDeckIndex][decks[currentDeckIndex].length - 1];
        decks[currentDeckIndex].pop();
        emit CardDrawn(cardDrawn, currentDeckIndex);
        currentDeckIndex = (currentDeckIndex + 1) % 4;
        return cardDrawn;
    }

    function calcCounts(string memory cardDrawn) public {
        if (bytes(cardDrawn)[0] == '2' || bytes(cardDrawn)[0] == '3' || bytes(cardDrawn)[0] == '4' || bytes(cardDrawn)[0] == '5' || bytes(cardDrawn)[0] == '6') {
            cardCount += 1;
        } else if (bytes(cardDrawn)[0] == '1' || bytes(cardDrawn)[0] == 'J' || bytes(cardDrawn)[0] == 'Q' || bytes(cardDrawn)[0] == 'K' || bytes(cardDrawn)[0] == 'A') {
            cardCount -= 1;
        }
        cardsDrawn++;
        uint decksRemaining = totalCards > cardsDrawn ? (totalCards - cardsDrawn) / 52 : 0;
        trueCount = decksRemaining > 0 ? int(cardCount) / int(decksRemaining) : int(cardCount);
        if (listenShuffle()) {
            shuffleDecks();
            cardCount = 0;
            cardsDrawn = 0;
            trueCount = 0;
        }
    }

    function listenShuffle() public view returns (bool) {
        return cardsDrawn >= (totalCards * 75) / 100;
    }
}
