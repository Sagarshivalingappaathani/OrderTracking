'use client';

import { useState } from 'react';
import { Package, CheckCircle, Clock, Truck, ShieldCheck, CreditCard, User, Calendar } from 'lucide-react';
import { formatEther } from 'ethers';

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

interface Company {
  id: bigint;
  name: string;
  companyAddress: string;
  exists: boolean;
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

interface OrderTrackerProps {
  order: Order;
  product: Product;
  buyer: Company;
  seller: Company;
}

const DELIVERY_STAGES = [
  { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'from-green-400 to-green-600' },
  { key: 'packed', label: 'Packed', icon: Package, color: 'from-blue-400 to-blue-600' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'from-indigo-400 to-indigo-600' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'from-purple-400 to-purple-600' },
  { key: 'quality_checked', label: 'Quality Checked', icon: ShieldCheck, color: 'from-pink-400 to-pink-600' },
  { key: 'payment_sent', label: 'Payment Sent', icon: CreditCard, color: 'from-green-500 to-green-700' },
];

export default function OrderTracker({ order, product, buyer, seller }: OrderTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getCurrentStageIndex = () => {
    if (!order.deliveryEvents || order.deliveryEvents.length === 0) {
      return -1;
    }
    const currentEvent = order.deliveryEvents[order.deliveryEvents.length - 1];
    return DELIVERY_STAGES.findIndex(stage => stage.key === currentEvent.status);
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600">Order ID: #{order.id.toString()}</p>
        </div>

        {/* Main Tracking Card */}
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Progress Bar */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 text-center">Delivery Progress</h2>
            
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${currentStageIndex >= 0 ? ((currentStageIndex + 1) / DELIVERY_STAGES.length) * 100 : 0}%` 
                  }}
                />
              </div>

              {/* Stage indicators */}
              <div className="relative flex justify-between">
                {DELIVERY_STAGES.map((stage, index) => {
                  const Icon = stage.icon;
                  const isCompleted = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex flex-col items-center space-y-2">
                      <div 
                        className={`
                          w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-500 transform
                          ${isCompleted 
                            ? `bg-gradient-to-r ${stage.color} text-white scale-110 shadow-lg` 
                            : 'bg-gray-200 text-gray-400'
                          }
                          ${isCurrent ? 'animate-pulse ring-4 ring-blue-200' : ''}
                        `}
                      >
                        <Icon className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <span 
                        className={`
                          text-xs md:text-sm font-medium text-center max-w-[80px] md:max-w-[100px]
                          ${isCompleted ? 'text-gray-900' : 'text-gray-500'}
                        `}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="text-center space-y-2 bg-blue-50 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-blue-900">Current Status</h3>
            <p className="text-xl md:text-2xl font-bold text-blue-600 capitalize">
              {order.status.replace(/_/g, ' ')}
            </p>
            {order.deliveryEvents && order.deliveryEvents.length > 0 && (
              <p className="text-xs md:text-sm text-blue-700">
                Last updated: {formatTimestamp(order.deliveryEvents[order.deliveryEvents.length - 1].timestamp)}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Product Name:</span>
                  <span className="font-medium text-right">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium">#{order.productId.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{order.quantity.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">{formatEther(order.unitPrice)} ETH</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-bold text-lg">{formatEther(order.totalPrice)} ETH</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Parties
              </h3>
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <span className="text-gray-600">Buyer:</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{buyer.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{formatAddress(order.buyer)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-600">Seller:</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{seller.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{formatAddress(order.seller)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Type:</span>
                  <span className="font-medium capitalize">{order.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatTimestamp(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery History */}
          {order.deliveryEvents && order.deliveryEvents.length > 0 && (
            <div className="space-y-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Delivery History
                </h3>
                <span className="text-gray-500">{showDetails ? '−' : '+'}</span>
              </button>

              {showDetails && (
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  {order.deliveryEvents.map((event, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                        <div className="space-y-1">
                          <p className="font-medium capitalize text-gray-900">
                            {event.status.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            Updated by: {formatAddress(event.updatedBy)}
                          </p>
                        </div>
                        <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2 bg-yellow-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-yellow-900">Notes</h3>
              <p className="text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}