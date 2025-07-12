import OrderTrackerABI from './abi/OrderTracker.json';
import { ethers } from 'ethers';

// Contract ABI from JSON file
export const CONTRACT_ABI = OrderTrackerABI.abi;

// VS Code port forwarding URL (now public)
export const RPC_URL = "https://0982btxq-8545.inc1.devtunnels.ms/";

// Contract address (hardcoded for hackathon)
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Development environment check
if (process.env.NODE_ENV === 'development') {
  console.log('Blockchain Configuration:');
  console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
  console.log('RPC_URL:', RPC_URL);
}

// Helper function to get provider
export async function getProvider() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    // Test the connection
    await provider.getNetwork();
    return provider;
  } catch (error) {
    console.error('Failed to connect to blockchain network:', error);
    throw new Error('Failed to connect to blockchain network. Please check your connection.');
  }
} 