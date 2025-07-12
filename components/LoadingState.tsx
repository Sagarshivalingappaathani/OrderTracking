import { Package, Loader2 } from 'lucide-react';

interface LoadingStateProps {
  orderId: string;
}

export default function LoadingState({ orderId }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Package className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Tracking Order #{orderId}
            </h1>
            <p className="text-gray-600">
              Fetching order details from the blockchain...
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-blue-600 font-medium">Loading...</span>
          </div>

          {/* Loading skeleton */}
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}