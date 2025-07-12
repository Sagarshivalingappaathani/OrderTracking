'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import OrderTracker from '@/components/OrderTracker';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { CONTRACT_ABI, CONTRACT_ADDRESS, getProvider } from '@/lib/config';

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

interface Product {
  id: bigint;
  name: string;
  description: string;
  imageHash: string;
  parentHistory: string[];
  quantity: bigint;
  pricePerUnit: bigint;
  currentOwner: string;
  createdTime: bigint;
  exists: boolean;
}

interface Company {
  id: bigint;
  name: string;
  companyAddress: string;
  exists: boolean;
}

// This is a client component
export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [buyer, setBuyer] = useState<Company | null>(null);
  const [seller, setSeller] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!CONTRACT_ADDRESS) {
          throw new Error('Contract address is not configured');
        }

        // Get the Hardhat provider
        const provider = await getProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Fetch order details
        const orderData = await contract.getOrder(orderId);
        
        if (!orderData.exists) {
          throw new Error('Order not found');
        }

        setOrder(orderData);

        // Fetch product details
        const productData = await contract.getProduct(orderData.productId);
        setProduct(productData);

        // Fetch buyer details
        const buyerData = await contract.getCompany(orderData.buyer);
        setBuyer(buyerData);

        // Fetch seller details
        const sellerData = await contract.getCompany(orderData.seller);
        setSeller(sellerData);

      } catch (err: any) {
        console.error('Error fetching order details:', err);
        
        if (err.message.includes('Order not found')) {
          setError('Order not found. Please check your order ID and try again.');
        } else if (err.message.includes('Contract address is not configured')) {
          setError('The application is not properly configured. Please contact support.');
        } else if (err.message.includes('local Hardhat network')) {
          setError('Cannot connect to local blockchain. Please make sure Hardhat node is running.');
        } else if (err.code === 'CALL_EXCEPTION') {
          setError('Failed to fetch order details. The order might not exist or the contract address might be incorrect.');
        } else {
          setError('Failed to fetch order details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <LoadingState orderId={orderId} />;
  }

  if (error) {
    return <ErrorState error={error} orderId={orderId} />;
  }

  if (!order || !product || !buyer || !seller) {
    return <ErrorState error="Failed to load complete order information" orderId={orderId} />;
  }

  return <OrderTracker order={order} product={product} buyer={buyer} seller={seller} />;
}