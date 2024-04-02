// utils/handleHit.jsx
import { ethers } from 'ethers';
import contractABI from '../contracts/build/Blackjack.abi.json'; // Make sure this import path is correct
import { calculateHandTotal } from './calcHandTotal'; // Make sure this import path is correct

export async function handleHit(contractAddress, signer, playerHand, setPlayerHand, revealDealerSecondCard) {
  // Make sure you pass the correct contract address
  const blackjackContract = new ethers.Contract(contractAddress, contractABI, signer);

  try {
    // Assuming `dealCard` is correctly implemented in the smart contract
    const tx = await blackjackContract.dealCard();
    await tx.wait(); // Wait for the transaction to be confirmed

    // Now fetch the updated hand; you'll need to ensure you have a method to get the hand from your contract
    const updatedPlayerHand = await blackjackContract.getPlayerHand();
    
    // Calculate the new total and check if it's over 21 (bust)
    const playerTotal = calculateHandTotal(updatedPlayerHand);
    setPlayerHand(updatedPlayerHand); // Update the state with the new hand

    if (playerTotal > 21) {
      // Player has busted, so reveal the dealer's second card and end the round
      revealDealerSecondCard();
      // Handle end of round logic, such as updating the game state or UI
    }
  } catch (error) {
    console.error('Error during the hit process:', error);
  }
}
