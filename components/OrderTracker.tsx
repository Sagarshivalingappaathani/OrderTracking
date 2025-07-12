'use client';

import { useState } from 'react';
import { Package, CheckCircle, Clock, Truck, ShieldCheck, CreditCard, User, DollarSign, Calendar } from 'lucide-react';
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

interface OrderTrackerProps {
  order: Order;
}

const DELIVERY_STAGES = [
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'quality_checked', label: 'Quality Checked', icon: ShieldCheck },
  { key: 'payment_sent', label: 'Payment Sent', icon: CreditCard },
];

export default function OrderTracker({ order }: OrderTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getCurrentStageIndex = () => {
    const currentStatus = order.status.toLowerCase();
    return DELIVERY_STAGES.findIndex(stage => stage.key === currentStatus);
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
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
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
                          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform
                          ${isCompleted 
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white scale-110 shadow-lg' 
                            : 'bg-gray-200 text-gray-400'
                          }
                          ${isCurrent ? 'animate-pulse ring-4 ring-blue-200' : ''}
                        `}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <span 
                        className={`
                          text-sm font-medium text-center max-w-20
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
          <div className="text-center space-y-2 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900">Current Status</h3>
            <p className="text-2xl font-bold text-blue-600 capitalize">
              {order.status.replace('_', ' ')}
            </p>
            {order.deliveryEvents.length > 0 && (
              <p className="text-sm text-blue-700">
                Last updated: {formatTimestamp(order.deliveryEvents[order.deliveryEvents.length - 1].timestamp)}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </h3>
              <div className="space-y-3 text-sm">
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-medium font-mono">{formatAddress(order.buyer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-medium font-mono">{formatAddress(order.seller)}</span>
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
          {order.deliveryEvents.length > 0 && (
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
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium capitalize text-gray-900">
                            {event.status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            Updated by: {formatAddress(event.updatedBy)}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
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