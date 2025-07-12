//@ts-nocheck
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        
        <div className="relative text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl shadow-lg w-fit mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">TrustFlow</h2>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Order #{orderId}</h3>
          <p className="text-gray-600 text-sm">Fetching tracking data from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        
        <div className="relative text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl shadow-lg w-fit mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">TrustFlow</h2>
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Track Order</h1>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order || !product || !buyer || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        
        <div className="relative text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-xl shadow-lg w-fit mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">TrustFlow</h2>
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Information Incomplete</h1>
          <p className="text-gray-600 text-sm">Failed to load complete order information for Order #{orderId}</p>
        </div>
      </div>
    );
  }

  return <OrderTracker order={order} product={product} buyer={buyer} seller={seller} />;
}