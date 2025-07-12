'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import OrderTracker from '@/components/OrderTracker';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

interface DeliveryEvent {
  timestamp: bigint;
  status: string;
  description: string;
  updatedBy: string;
}

interface Order {
  id: bigint;
  buyer: string;
  seller: string;
  productId: bigint;
  quantity: bigint;
  unitPrice: bigint;
  totalPrice: bigint;
  orderType: string;
  status: string;
  createdAt: bigint;
  approvalDeadline: bigint;
  paymentDeadline: bigint;
  notes: string;
  deliveryEvents: DeliveryEvent[];
  exists: boolean;
  isPartialTransfer: boolean;
  originalProductId: bigint;
  listingId: bigint;
}

const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with your contract address
const CONTRACT_ABI = [
  "function getOrder(uint256 _orderId) public view returns (tuple(uint256 id, address buyer, address seller, uint256 productId, uint256 quantity, uint256 unitPrice, uint256 totalPrice, string orderType, string status, uint256 createdAt, uint256 approvalDeadline, uint256 paymentDeadline, string notes, tuple(uint256 timestamp, string status, string description, address updatedBy)[] deliveryEvents, bool exists, bool isPartialTransfer, uint256 originalProductId, uint256 listingId))",
  "function getOrderDeliveryHistory(uint256 _orderId) public view returns (tuple(uint256 timestamp, string status, string description, address updatedBy)[])",
];

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if MetaMask is available
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed. Please install MetaMask to track orders.');
        }

        // Connect to Ethereum network
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Fetch order details
        const orderData = await contract.getOrder(orderId);
        
        if (!orderData.exists) {
          throw new Error('Order not found');
        }

        setOrder(orderData);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        if (err.message.includes('Order not found')) {
          setError('Order not found. Please check your order ID and try again.');
        } else if (err.message.includes('MetaMask')) {
          setError(err.message);
        } else if (err.message.includes('user rejected')) {
          setError('Connection was rejected. Please connect your wallet to track orders.');
        } else {
          setError('Failed to fetch order details. Please check your network connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return <LoadingState orderId={orderId} />;
  }

  if (error) {
    return <ErrorState error={error} orderId={orderId} />;
  }

  if (!order) {
    return <ErrorState error="Order not found" orderId={orderId} />;
  }

  return <OrderTracker order={order} />;
}