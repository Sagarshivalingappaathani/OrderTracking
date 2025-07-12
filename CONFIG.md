# OrderTracking Configuration

## Contract Details (Already Configured)

Contract details are set in `/app/product/[productId]/page.tsx`:

```javascript
// Contract address (hardcoded)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// RPC URL (currently set for local development)
const RPC_URL = "http://localhost:8545";
```

**Note**: For production deployment, you may need to update the RPC_URL to your provider's endpoint.

## Features

The product tracking page now includes:

1. **Product Information** - Basic details, quantity, price, creation date
2. **Current Owner** - Shows company info if registered, otherwise shows wallet address
3. **Ownership History** - Complete chain of ownership from creation to current owner
4. **Manufacturing Details** (if applicable) - Shows source materials and components used
5. **Original Creator** - Information about who originally created the product
6. **Blockchain Verification** - All data is verified on-chain

## URL Structure

The tracking page is accessible at:
- **Product Tracking**: `https://order-tracking-plum.vercel.app/product/{productId}`
- **Order Tracking**: `https://order-tracking-plum.vercel.app/track/{orderId}`

## Testing

1. Deploy your OrderTracking app
2. Update the contract address and RPC URL
3. Generate QR codes from your main frontend
4. Scan QR codes to test the tracking functionality

## Error Handling

The page handles:
- Product not found
- Network connection issues
- Invalid product IDs
- Loading states
- Company data not available