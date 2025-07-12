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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Product Data</h2>
          <p className="text-gray-600">Fetching information from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product || !product.exists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600">Product #{productId} does not exist or has been removed from the blockchain.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Product #{productId}</h1>
              <p className="text-xl text-gray-700">{product.name}</p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold text-lg flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Verified on Blockchain
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              Product Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Product ID:</span>
                <span className="font-bold text-gray-900">#{product.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Quantity:</span>
                <span className="font-bold text-gray-900">{product.quantity}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Price per Unit:</span>
                <span className="font-bold text-gray-900">{ethers.formatEther(product.pricePerUnit)} ETH</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Created:</span>
                <span className="font-bold text-gray-900">{formatDate(product.createdTime)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-medium">Type:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-green-600">👤</span>
              Current Owner
            </h2>
            <div className="space-y-4">
              {currentOwnerCompany ? (
                <>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Company:</span>
                    <span className="font-bold text-gray-900">{currentOwnerCompany.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Company ID:</span>
                    <span className="font-bold text-gray-900">#{currentOwnerCompany.id}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Individual Owner</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-gray-600 font-medium block mb-1">Wallet Address:</span>
                <span className="font-mono text-sm text-gray-800 break-all">{product.currentOwner}</span>
              </div>
              <div className="flex justify-center">
                <span className="text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full">
                  ✅ Verified Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-purple-600">🌳</span>
            Ownership Tree & Transfer History
          </h2>
          
          {product.ownershipHistory.length > 1 ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Complete ownership trail showing all transfers of this product:
              </p>
              {product.ownershipHistory.map((owner: string, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {index === 0 ? 'Original Creator' : `Owner #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transfer History</h3>
              <p className="text-gray-600 mb-2">This product is still with its original creator.</p>
              <p className="text-sm text-gray-500">
                Transfer history will appear here when the product changes ownership.
              </p>
            </div>
          )}
        </div>

        {/* Manufacturing Details */}
        {product.isManufactured && product.components.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-orange-600">🏭</span>
              Manufacturing Details
            </h2>
            <div className="bg-orange-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                <strong>This is a manufactured product</strong> created from the following source materials:
              </p>
              <div className="grid gap-4">
                {product.components.map((component: Component, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Product #{component.productId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity Used: {component.quantityUsed}
                        </p>
                        <p className="text-sm text-gray-600">
                          Supplier: {formatAddress(component.supplier)}
                        </p>
                      </div>
                      <div className="text-right">
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
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Creator</h3>
              {originalCreatorCompany ? (
                <div>
                  <p className="text-gray-700"><strong>Company:</strong> {originalCreatorCompany.name}</p>
                  <p className="text-gray-700"><strong>Address:</strong> {formatAddress(product.originalCreator)}</p>
                </div>
              ) : (
                <p className="text-gray-700">{formatAddress(product.originalCreator)}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-gray-600 text-sm mb-2">
              🔒 All data is cryptographically secured and verified on the blockchain
            </p>
            <p className="text-gray-500 text-xs">
              Product ID: {productId} • Contract: {formatAddress(CONTRACT_ADDRESS)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}