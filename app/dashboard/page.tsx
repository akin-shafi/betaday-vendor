"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Bell,
  Menu,
  User,
  Wallet,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

function DashboardContent() {
  const { vendor, logout } = useAuth();
  const { stats, isLoading, error } = useDashboardStats();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Check onboarding status
    const onboardingComplete = localStorage.getItem(
      "vendor_onboarding_complete"
    );
    setIsOnboardingComplete(onboardingComplete === "true");
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("vendor_onboarding_complete", "true");
    setIsOnboardingComplete(true);
  };

  const toggleOrderDetails = (index: number) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };

  // Use API data or fallback to defaults
  const dashboardStats = {
    totalProducts: stats?.totalProducts || 0,
    totalEarnings: stats?.totalRevenue || 0,
    averageRating: 4.8, // This might come from a different endpoint
    totalOrders: stats?.totalOrders || 0,
    pendingOrders: stats?.pendingOrders || 0,
    walletBalance: stats?.walletBalance || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                BetaDay Vendor
              </h1>
              <p className="text-xs text-gray-500">
                Welcome back, {vendor?.fullName?.split(" ")[0]}!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="space-y-3">
              <Link
                href="/profile"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Profile</span>
              </Link>
              <Link
                href="/wallet"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <Wallet className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Wallet</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Products</span>
              </Link>
              <Link
                href="/orders"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Orders</span>
              </Link>
              <Link
                href="/reviews"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Reviews</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Settings</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 w-full text-left text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="p-4 space-y-6 mb-20">
        {/* Onboarding Alert */}
        {!isOnboardingComplete && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">
                  Complete Your Setup
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  Create your product catalogue to start receiving orders from
                  customers.
                </p>
                <div className="mt-3 flex space-x-3">
                  <Link
                    href="/products/create"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                  >
                    Add Products
                  </Link>
                  <button
                    onClick={completeOnboarding}
                    className="text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">
                  Unable to load dashboard data
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-red-600 text-sm font-medium hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalProducts}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earnings</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardStats.totalEarnings)}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.pendingOrders}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardStats.walletBalance)}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>



        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/orders"
              className="text-orange-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">
                Loading recent orders...
              </span>
            </div>
          ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order, index) => {
                // Calculate total amount from orderItems
                const amount = order.orderItems.reduce(
                  (sum, item) => sum + Number(item.price) * item.quantity,
                  0
                );
                // Use the first orderItem's created_at as the order date
                const orderDate = order.orderItems[0]?.created_at;
                // Skip rendering if no valid date
                if (!orderDate || isNaN(new Date(orderDate).getTime())) {
                  return null;
                }
                const { date, time } = formatDate(orderDate);
                const itemName = order.orderItems[0]?.name || "Unknown Item";

                return (
                  <div key={index} className="bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleOrderDetails(index)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{itemName}</p>
                        <p className="text-sm text-gray-600">
                          {order.user} ({time})
                        </p>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(amount)}
                          </p>
                          <p className="text-sm text-yellow-600">Pending</p>
                        </div>
                        {expandedOrderIndex === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>
                    {expandedOrderIndex === index && (
                      <div className="p-3 bg-gray-100 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Order Details
                        </h4>
                        <ul className="space-y-2">
                          {order.orderItems.map((item) => (
                            <li key={item.id} className="text-sm text-gray-700">
                              <p>
                                <span className="font-medium">Item:</span>{" "}
                                {item.name}
                              </p>
                              <p>
                                <span className="font-medium">Quantity:</span>{" "}
                                {item.quantity}
                              </p>
                              <p>
                                <span className="font-medium">Price:</span>{" "}
                                {formatCurrency(Number(item.price))}
                              </p>
                              <p>
                                <span className="font-medium">Order ID:</span>{" "}
                                {item.orderId}
                              </p>
                              <p>
                                <span className="font-medium">Item ID:</span>{" "}
                                {item.itemId}
                              </p>
                              {item.specialInstructions && (
                                <p>
                                  <span className="font-medium">
                                    Instructions:
                                  </span>{" "}
                                  {item.specialInstructions}
                                </p>
                              )}
                              <p>
                                <span className="font-medium">Ordered At:</span>{" "}
                                {formatDateTime(item.created_at)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center py-2 text-orange-600"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            href="/products"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1">Products</span>
          </Link>
          <Link
            href="/orders"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs mt-1">Orders</span>
          </Link>
          <Link
            href="/wallet"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs mt-1">Wallet</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
