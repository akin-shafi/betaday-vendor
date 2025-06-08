"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock products data
  const products = [
    {
      id: "1",
      name: "Jollof Rice",
      description: "Delicious Nigerian jollof rice with chicken",
      price: 1500,
      category: "Food & Beverages",
      isAvailable: true,
      image: null,
    },
    {
      id: "2",
      name: "Fried Rice",
      description: "Tasty fried rice with vegetables and meat",
      price: 1800,
      category: "Food & Beverages",
      isAvailable: true,
      image: null,
    },
    {
      id: "3",
      name: "Amala & Ewedu",
      description: "Traditional amala with ewedu soup",
      price: 1200,
      category: "Food & Beverages",
      isAvailable: false,
      image: null,
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "available" && product.isAvailable) ||
      (selectedCategory === "unavailable" && !product.isAvailable);

    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (productId: string) => {
    // TODO: Implement toggle availability
    console.log("Toggle availability for product:", productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500">Manage your products</p>
            </div>
          </div>
          <Link href="/products/create">
            <button className="bg-orange-600 text-white p-2 rounded-lg">
              <Plus className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedCategory("available")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setSelectedCategory("unavailable")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "unavailable"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Unavailable
            </button>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} result
                {filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
              </p>
              {filteredProducts.length === 0 && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No products found</p>
              <Link href="/products/create">
                <button className="mobile-button">
                  Add Your First Product
                </button>
              </Link>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold text-gray-900">
                            ₦{product.price.toLocaleString()}
                          </p>
                          <span className="text-xs text-gray-500">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/products/view/${product.id}`}>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleAvailability(product.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          {product.isAvailable ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <Link href={`/products/edit/${product.id}`}>
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
