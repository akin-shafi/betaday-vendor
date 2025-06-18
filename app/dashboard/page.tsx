"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  DollarSign,
  TrendingUp,
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
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import Footer from "@/components/footer";

function DashboardContent() {
  const { vendor, logout } = useAuth();
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedOrderIndex, setExpandedOrderIndex] = useState<number | null>(
    null
  );
  const [filter, setFilter] = useState<{
    period: "day" | "week" | "month" | "year" | null;
    startDate?: string;
    endDate?: string;
  }>({ period: "week" });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");

  const toggleOrderDetails = (index: number) => {
    setExpandedOrderIndex(expandedOrderIndex === index ? null : index);
  };

  const handlePeriodChange = (period: "day" | "week" | "month" | "year") => {
    setFilter({ period });
    setShowCustomDatePicker(false);
    setTempStartDate("");
    setTempEndDate("");
    refetch(period);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setTempStartDate(value);
    } else if (name === "endDate") {
      setTempEndDate(value);
    }
  };

  const applyCustomDateRange = () => {
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        setFilter({
          period: null,
          startDate: tempStartDate,
          endDate: tempEndDate,
        });
        refetch("custom", { startDate: tempStartDate, endDate: tempEndDate });
      }
    }
  };

  const toggleCustomDatePicker = () => {
    setShowCustomDatePicker((prev) => {
      if (prev) {
        setTempStartDate("");
        setTempEndDate("");
        setFilter({ period: "month" });
        refetch("month");
      }
      return !prev;
    });
  };

  // Use API data or fallback to defaults
  const dashboardStats = {
    totalProducts: stats?.totalProducts || 0,
    totalEarnings: stats?.totalRevenue || 0,
    averageRating: 4.8,
    totalOrders: stats?.totalOrders || 0,
    pendingOrders: stats?.pendingOrders || 0,
    deliveredOrders: stats?.ordersByStatus?.delivered || 0,
    walletBalance: stats?.walletBalance || 0,
  };

  // Determine onboarding message and action based on onboardingStep
  const getOnboardingInfo = () => {
    if (!vendor || vendor.onboardingStep >= 3) {
      return null;
    }

    switch (vendor.onboardingStep) {
      case 1:
        return {
          title: "Register Your Business",
          message: "Set up your business details to start selling on BetaDay.",
          actionText: "Register Business",
          actionLink: "/onboarding/business",
        };
      case 2:
        return {
          title: "Add Your First Product",
          message: "Create your product catalogue to start receiving orders.",
          actionText: "Add Product",
          actionLink: "/products/create",
        };
      default:
        return null;
    }
  };

  const onboardingInfo = getOnboardingInfo();

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
        {onboardingInfo && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">
                  {onboardingInfo.title}
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  {onboardingInfo.message}
                </p>
                <div className="mt-3">
                  <Link
                    href={onboardingInfo.actionLink}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700"
                  >
                    {onboardingInfo.actionText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Filter by Time Period
          </h3>
          <div className="flex flex-col space-y-2">
            <select
              value={filter.period || ""}
              onChange={(e) =>
                handlePeriodChange(
                  e.target.value as "day" | "week" | "month" | "year"
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-600"
              disabled={showCustomDatePicker}
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 365 Days</option>
            </select>
            <button
              onClick={toggleCustomDatePicker}
              className="flex items-center space-x-2 text-orange-600 text-sm font-medium hover:text-orange-800"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {showCustomDatePicker
                  ? "Hide Custom Range"
                  : "Select Custom Date Range"}
              </span>
            </button>
            {showCustomDatePicker && (
              <div className="flex flex-col space-y-2 mt-2">
                <input
                  type="date"
                  name="startDate"
                  value={tempStartDate}
                  onChange={handleCustomDateChange}
                  className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  name="endDate"
                  value={tempEndDate}
                  onChange={handleCustomDateChange}
                  className="p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="End Date"
                />
                <button
                  onClick={applyCustomDateRange}
                  disabled={!tempStartDate || !tempEndDate}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered Orders</p>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.deliveredOrders}
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
                <p className="text-sm text-gray-600">Total Sales</p>
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
                const amount = order.orderItems.reduce(
                  (sum, item) => sum + Number(item.price) * item.quantity,
                  0
                );
                const orderDate = order.orderItems[0]?.created_at;
                if (!orderDate || isNaN(new Date(orderDate).getTime())) {
                  return null;
                }
                const { date, time } = formatDate(orderDate);
                const itemName = order.orderItems[0]?.name || "Unknown Item";
                const status = order.orderItems[0]?.status || "Unknown";

                return (
                  <div key={index} className="bg-gray-50 rounded-lg">
                    <button
                      onClick={() => toggleOrderDetails(index)}
                      className="w-full flex items-center justify-between p-3 text-left"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{itemName}</p>
                        <p className="text-sm text-gray-600">
                          {order.user} ({date} • {time})
                        </p>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(amount)}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              status.toLowerCase() === "delivered" ||
                              status.toLowerCase() === "completed"
                                ? "bg-green-100 text-green-800"
                                : status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {(status.toLowerCase() === "delivered" ||
                              status.toLowerCase() === "completed") && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {status}
                          </span>
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
                                <span className="font-medium">Status:</span>{" "}
                                {item.status}
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

      <Footer />
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
