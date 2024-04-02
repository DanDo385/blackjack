// utils/calcHandTotal.js

/**
 * Calculates the total score of a hand.
 * @param {string[]} hand Array of card codes from the smart contract.
 * @returns {number} The total score.
 */
export function calcHandTotal(hand) {
    let total = 0;
    let aceCount = 0;

    hand.forEach(card => {
        let value = card.substring(0, card.length - 2); // Assuming the format is "VALUE-SUIT"
        if (value === "A") {
            aceCount += 1;
            total += 11; // Initially consider Ace as 11
        } else if (["J", "Q", "K", "10"].includes(value)) {
            total += 10;
        } else {
            total += parseInt(value, 10);
        }
    });

    // Adjust for Aces after calculating the initial total
    while (total > 21 && aceCount > 0) {
        total -= 10; // Convert an Ace from 11 to 1
        aceCount -= 1;
    }

    return total;
}
