import OrderTrackerABI from './abi/OrderTracker.json';
import { ethers } from 'ethers';

// Contract ABI from JSON file
export const CONTRACT_ABI = OrderTrackerABI.abi;

// Local Hardhat network configuration
export const RPC_URL = "http://127.0.0.1:8545";

// Contract address from environment variable
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

// Development environment check for environment variables
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables Status:');
  console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS ? '✅ Set' : '❌ Not Set');
  console.log('Using local Hardhat network:', RPC_URL);
}

// Validation function to ensure required environment variables are set
export function validateConfig() {
  if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS environment variable is not set');
  }
}

// Helper function to get provider
export async function getProvider() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    // Test the connection
    await provider.getNetwork();
    return provider;
  } catch (error) {
    console.error('Failed to connect to local Hardhat network:', error);
    throw new Error('Failed to connect to local Hardhat network. Make sure it is running with: npx hardhat node');
  }
} 