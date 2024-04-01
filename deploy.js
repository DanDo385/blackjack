import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    if (!process.env.INFURA_API_KEY || !process.env.PRIVATE_KEY) {
        console.error('Please set the environment variables in .env file');
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    try {
        const abi = fs.readFileSync('./contracts/build/Blackjack.abi', 'utf8');
        const bytecode = fs.readFileSync('./contracts/build/Blackjack.bin', 'utf8');
        
        const BlackjackFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        console.log('Deploying Blackjack contract...');
        
        const blackjack = await BlackjackFactory.deploy();
        await blackjack.deployed();
        
        console.log(`Blackjack contract deployed to: ${blackjack.address}`);
    } catch (error) {
        console.error('Error deploying Blackjack contract:', error);
        process.exit(1);
    }
}

main();
