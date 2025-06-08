"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Share2,
  MoreVertical,
  Trash2,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  orders: number;
}

export default function ViewProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [showActions, setShowActions] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockProduct = {
      id: params.id,
      name: "Jollof Rice",
      description:
        "Delicious Nigerian jollof rice with chicken and vegetables. Made with premium ingredients and traditional spices for an authentic taste experience.",
      price: 1500,
      category: "Food & Beverages",
      isAvailable: true,
      image: null,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      views: 245,
      orders: 18,
    };
    setProduct(mockProduct);
  }, [params.id]);

  const toggleAvailability = () => {
    if (product) {
      setProduct((prev) =>
        prev ? { ...prev, isAvailable: !prev.isAvailable } : null
      );
    }
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/products">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Product Details
              </h1>
              <p className="text-sm text-gray-500">View product information</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10">
                <Link href={`/products/edit/${product.id}`}>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit Product</span>
                  </button>
                </Link>
                <button
                  onClick={toggleAvailability}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  {product.isAvailable ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>
                    {product.isAvailable ? "Hide Product" : "Show Product"}
                  </span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Product</span>
                </button>
                <hr className="my-2" />
                <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Product</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Product Image */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex justify-center">
            {product.image ? (
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-48 h-48 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-orange-600 font-bold text-2xl">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">No image</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {product.name}
              </h2>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                ₦{product.price.toLocaleString()}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
              {product.category}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            Product Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {product.views}
              </p>
              <p className="text-sm text-blue-600">Views</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {product.orders}
              </p>
              <p className="text-sm text-green-600">Orders</p>
            </div>
          </div>
        </div>

        {/* Product History */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Product History</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(product.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/products/edit/${product.id}`}>
            <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center">
              <Edit className="w-5 h-5 mr-2" />
              Edit Product
            </button>
          </Link>

          <button
            onClick={toggleAvailability}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
              product.isAvailable
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {product.isAvailable ? (
              <EyeOff className="w-5 h-5 mr-2" />
            ) : (
              <Eye className="w-5 h-5 mr-2" />
            )}
            {product.isAvailable ? "Hide Product" : "Show Product"}
          </button>
        </div>
      </main>
    </div>
  );
}
