// utils/handleHit.js
import { ethers } from 'ethers';
import contractABI from '../path/to/BlackjackABI.json';
import { calculateHandTotal } from './calcHandTotal';

export async function handleHit(contractAddress, signer, playerHand, setPlayerHand, revealDealerSecondCard) {
    const blackjackContract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
        await blackjackContract.dealCard();
        const updatedPlayerHand = await blackjackContract.getPlayerHand();

        // Calculate the new total
        const playerTotal = calculateHandTotal(updatedPlayerHand);

        // Update the player's hand in the state
        setPlayerHand(updatedPlayerHand);

        if (playerTotal > 21) {
            // Player busts, reveal dealer's second card and determine winner
            revealDealerSecondCard(); // This should be implemented to update the game state accordingly
            console.log('Player busts. Dealer wins.');
        }
    } catch (error) {
        console.error('Error dealing card to player:', error);
    }
}
