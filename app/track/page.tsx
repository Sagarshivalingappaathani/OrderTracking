'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search } from 'lucide-react';

export default function TrackingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      router.push(`/track/${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Package className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Track Your Order
            </h1>
            <p className="text-gray-600">
              Enter your order ID to track its current status
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <Search className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
            </div>
            
            <button
              type="submit"
              disabled={!orderId.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Track Order
            </button>
          </form>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              Powered by Ethereum blockchain technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 