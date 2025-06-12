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
  X,
  RefreshCw,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useBusiness } from "@/hooks/useBusiness";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { ProductSkeleton } from "@/components/skeletons/ProductSkeleton";

export default function ProductsPage() {
  const { business } = useBusiness();
  const { products, isLoading, error, updateProduct, deleteProduct, refetch } =
    useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filter products based on search and category
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

  // Get unique categories from products
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  ).filter(Boolean);

  const toggleAvailability = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setIsUpdating(productId);
    try {
      await updateProduct(productId, {
        isAvailable: !product.isAvailable,
      });
    } catch (error) {
      console.error("Failed to update product availability:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const productToDeleteName = productToDelete
    ? products.find((p) => p.id === productToDelete)?.name
    : "";

  if (!business) {
    return <ProductSkeleton />;
  }

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
              <p className="text-sm text-gray-500">
                {products.length} product{products.length !== 1 ? "s" : ""} •{" "}
                {business.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <Link href="/products/create">
              <button className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700">
                <Plus className="w-5 h-5" />
              </button>
            </Link>
            {products.length >= 2 && (
              <Link href="/products/create-combo">
                <button
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
                  title="Create Combo"
                >
                  <Package className="w-5 h-5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
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
              All Products ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory("available")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "available"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Available ({products.filter((p) => p.isAvailable).length})
            </button>
            <button
              onClick={() => setSelectedCategory("unavailable")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "unavailable"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Unavailable ({products.filter((p) => !p.isAvailable).length})
            </button>
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-sm text-gray-500 flex-shrink-0">
                Categories:
              </span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {category} (
                  {products.filter((p) => p.category === category).length})
                </button>
              ))}
            </div>
          )}

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

        {/* Loading State */}
        {isLoading && products.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {!isLoading &&
          filteredProducts.length === 0 &&
          products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start building your product catalog to attract customers.
              </p>
              <Link href="/products/create">
                <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2 mx-auto">
                  <Plus className="w-5 h-5" />
                  Add Your First Product
                </button>
              </Link>
            </div>
          ) : !isLoading && filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No products found{searchQuery ? ` for "${searchQuery}"` : ""}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {product.name.charAt(0).toUpperCase()}
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
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      {/* Availability Toggle - Top Right */}
                      <div className="flex flex-col items-center space-y-1 ml-4">
                        <button
                          onClick={() => toggleAvailability(product.id)}
                          disabled={isUpdating === product.id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 ${
                            product.isAvailable ? "bg-green-600" : "bg-gray-300"
                          }`}
                        >
                          {isUpdating === product.id ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                          ) : (
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.isAvailable
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          )}
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            product.isAvailable
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Product Meta Info */}
                    <div className="flex items-center space-x-2 mt-3">
                      {product.createdAt && (
                        <span className="text-xs text-gray-500">
                          Added{" "}
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-1 mt-4">
                      <Link href={`/products/view/${product.id}`}>
                        <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          View
                        </button>
                      </Link>
                      <Link
                        href={
                          product.isCombo
                            ? `/products/edit-combo/${product.id}`
                            : `/products/edit/${product.id}`
                        }
                      >
                        <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1">
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enhanced Action CTAs */}
        {!isLoading && products.length > 0 && (
          <div className="space-y-4">
            {/* Primary CTA - Add Product */}
            <div className="text-center py-6">
              <Link href="/products/create">
                <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2 mx-auto">
                  <Plus className="w-5 h-5" />
                  Add Another Product
                </button>
              </Link>
            </div>

            {/* Secondary CTA - Create Combo */}
            {products.length >= 2 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Create Combo Meals
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Bundle your products together to create attractive combo
                    meals and increase your average order value.
                  </p>
                  <Link href="/products/create-combo">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2 mx-auto transition-colors">
                      <Package className="w-5 h-5" />
                      Create Combo Meal
                    </button>
                  </Link>
                  <p className="text-sm text-purple-600 mt-2">
                    You have {products.length} products available for combos
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDeleteName}"? This action cannot be undone and will remove the product from your catalog.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
