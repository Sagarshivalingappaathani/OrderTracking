'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';

// TypeScript JSX types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Contract configuration
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// VS Code port forwarding URL (now public)
const RPC_URL = "https://0982btxq-8545.inc1.devtunnels.ms/";

// Contract ABI - TrustFlow contract functions
const CONTRACT_ABI = [
  "function getProduct(uint256 _productId) public view returns (tuple(uint256 id, string name, string description, string imageHash, tuple(uint256 productId, uint256 quantityUsed, address supplier, uint256 timestamp)[] components, bool isManufactured, address originalCreator, address[] ownershipHistory, uint256 quantity, uint256 pricePerUnit, address currentOwner, uint256 createdTime, bool exists))",
  "function getCompany(address _address) public view returns (tuple(uint256 id, string name, address companyAddress, bool exists))",
  "function getProductTraceability(uint256 _productId) public view returns (address[] memory)",
  "function getProductTree(uint256 _productId) public view returns (tuple(uint256 productId, uint256 quantityUsed, address supplier, uint256 timestamp)[] memory)"
];

interface Product {
  id: number;
  name: string;
  description: string;
  imageHash: string;
  components: Component[];
  isManufactured: boolean;
  originalCreator: string;
  ownershipHistory: string[];
  quantity: number;
  pricePerUnit: bigint;
  currentOwner: string;
  createdTime: number;
  exists: boolean;
}

interface Component {
  productId: number;
  quantityUsed: number;
  supplier: string;
  timestamp: number;
}

interface Company {
  id: number;
  name: string;
  companyAddress: string;
  exists: boolean;
}

export default function ProductTrackingPage() {
  const params = useParams();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [currentOwnerCompany, setCurrentOwnerCompany] = useState<Company | null>(null);
  const [originalCreatorCompany, setOriginalCreatorCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Connecting to RPC URL:', RPC_URL);
      console.log('Contract Address:', CONTRACT_ADDRESS);
      
      // Connect to blockchain
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Fetch product details
      const productData = await contract.getProduct(parseInt(productId));
      
      if (!productData.exists) {
        setError('Product not found');
        return;
      }

      const productInfo: Product = {
        id: Number(productData.id),
        name: productData.name,
        description: productData.description,
        imageHash: productData.imageHash,
        components: productData.components.map((comp: any) => ({
          productId: Number(comp.productId),
          quantityUsed: Number(comp.quantityUsed),
          supplier: comp.supplier,
          timestamp: Number(comp.timestamp)
        })),
        isManufactured: productData.isManufactured,
        originalCreator: productData.originalCreator,
        ownershipHistory: productData.ownershipHistory,
        quantity: Number(productData.quantity),
        pricePerUnit: productData.pricePerUnit,
        currentOwner: productData.currentOwner,
        createdTime: Number(productData.createdTime),
        exists: productData.exists
      };

      setProduct(productInfo);

      // Fetch current owner company info
      try {
        const companyData = await contract.getCompany(productData.currentOwner);
        if (companyData.exists) {
          setCurrentOwnerCompany({
            id: Number(companyData.id),
            name: companyData.name,
            companyAddress: companyData.companyAddress,
            exists: companyData.exists
          });
        }
      } catch (err) {
        console.log('No company info found for current owner');
      }

      // Fetch original creator company info
      try {
        const creatorCompanyData = await contract.getCompany(productData.originalCreator);
        if (creatorCompanyData.exists) {
          setOriginalCreatorCompany({
            id: Number(creatorCompanyData.id),
            name: creatorCompanyData.name,
            companyAddress: creatorCompanyData.companyAddress,
            exists: creatorCompanyData.exists
          });
        }
      } catch (err) {
        console.log('No company info found for original creator');
      }
      
    } catch (err: any) {
      console.error('Error fetching product data:', err);
      setError(err.message || 'Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Product Data</h3>
          <p className="text-gray-600 text-sm">Fetching information from blockchain...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
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

  if (!product || !product.exists) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 text-sm">Product #{productId} does not exist or has been removed from the blockchain.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      
      {/* Navigation */}
      <nav className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">TrustFlow</span>
                <div className="text-xs text-gray-500 font-medium">Product Tracking</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Powered by Blockchain
            </div>
          </div>
        </div>
      </nav>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Product #{productId}</h1>
              <p className="text-lg sm:text-xl text-gray-700">{product.name}</p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-green-100 text-green-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-lg flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="hidden sm:inline">Verified on Blockchain</span>
                <span className="sm:hidden">Verified</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{product.description}</p>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Product Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              <span className="hidden sm:inline">Product Information</span>
              <span className="sm:hidden">Product Info</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Product ID:</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">#{product.id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Quantity:</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">{product.quantity}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Price per Unit:</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">{ethers.formatEther(product.pricePerUnit)} ETH</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Created:</span>
                <span className="font-bold text-gray-900 text-xs sm:text-base break-words">{formatDate(product.createdTime)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 space-y-2 sm:space-y-0">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Type:</span>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-center w-fit ${
                  product.isManufactured 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.isManufactured ? 'Manufactured' : 'Raw Material'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Owner */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-green-600">👤</span>
              <span className="hidden sm:inline">Current Owner</span>
              <span className="sm:hidden">Owner</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {currentOwnerCompany ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Company:</span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base break-words">{currentOwnerCompany.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-3 border-b border-gray-100 space-y-1 sm:space-y-0">
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Company ID:</span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">#{currentOwnerCompany.id}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2 text-sm">Individual Owner</p>
                </div>
              )}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <span className="text-gray-600 font-medium block mb-1 text-sm sm:text-base">Wallet Address:</span>
                <span className="font-mono text-xs sm:text-sm text-gray-800 break-all">{product.currentOwner}</span>
              </div>
              <div className="flex justify-center">
                <span className="text-green-600 font-semibold bg-green-50 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm">
                  ✅ Verified Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-purple-600">🌳</span>
            <span className="hidden sm:inline">Ownership Tree & Transfer History</span>
            <span className="sm:hidden">Ownership History</span>
          </h2>
          
          {product.ownershipHistory.length > 1 ? (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Complete ownership trail showing all transfers of this product:
              </p>
              {product.ownershipHistory.map((owner: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm sm:text-base">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {index === 0 ? 'Original Creator' : `Owner #${index + 1}`}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 break-all">
                        {formatAddress(owner)}
                      </p>
                      {index === product.ownershipHistory.length - 1 && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                          Current Owner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Transfer History</h3>
              <p className="text-gray-600 mb-2 text-sm sm:text-base">This product is still with its original creator.</p>
              <p className="text-xs sm:text-sm text-gray-500">
                Transfer history will appear here when the product changes ownership.
              </p>
            </div>
          )}
        </div>

        {/* Manufacturing Details */}
        {product.isManufactured && product.components.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-orange-600">🏭</span>
              <span className="hidden sm:inline">Manufacturing Details</span>
              <span className="sm:hidden">Manufacturing</span>
            </h2>
            <div className="bg-orange-50 p-4 sm:p-6 rounded-lg">
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                <strong>This is a manufactured product</strong> created from the following source materials:
              </p>
              <div className="grid gap-3 sm:gap-4">
                {product.components.map((component: Component, index: number) => (
                  <div key={index} className="bg-white p-3 sm:p-4 rounded-lg border border-orange-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          Product #{component.productId}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Quantity Used: {component.quantityUsed}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 break-all">
                          Supplier: {formatAddress(component.supplier)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500">
                          {formatDate(component.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Original Creator Info */}
            <div className="mt-4 sm:mt-6 bg-blue-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Original Creator</h3>
              {originalCreatorCompany ? (
                <div className="space-y-1">
                  <p className="text-gray-700 text-sm sm:text-base"><strong>Company:</strong> {originalCreatorCompany.name}</p>
                  <p className="text-gray-700 text-sm sm:text-base break-all"><strong>Address:</strong> {formatAddress(product.originalCreator)}</p>
                </div>
              ) : (
                <p className="text-gray-700 text-sm sm:text-base break-all">{formatAddress(product.originalCreator)}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 sm:p-8 text-white">
            <h3 className="text-lg sm:text-2xl font-bold mb-4">🔒 Blockchain Verified</h3>
            <p className="text-blue-100 mb-4 text-sm sm:text-base">
              All data is cryptographically secured and verified on the blockchain
            </p>
            <div className="bg-white/20 rounded-lg p-3 sm:p-4">
              <p className="text-white text-xs sm:text-sm break-all">
                Product ID: {productId} • Contract: {formatAddress(CONTRACT_ADDRESS)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}