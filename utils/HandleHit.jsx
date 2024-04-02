// utils/handleHit.js
import { ethers } from 'ethers';
import contractABI from '../path/to/BlackjackABI.json';

export async function handleHit(contractAddress, signer) {
    const blackjackContract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
        const tx = await blackjackContract.dealCard(); // Adjust based on your contract method
        await tx.wait(); // Wait for the transaction to be mined
        console.log('Card dealt to player.');
    } catch (error) {
        console.error('Error dealing card to player:', error);
    }
}
