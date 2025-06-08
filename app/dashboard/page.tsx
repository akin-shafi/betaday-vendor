"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"

function DashboardContent() {
  const { vendor, logout } = useAuth()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    // Check onboarding status
    const onboardingComplete = localStorage.getItem("vendor_onboarding_complete")
    setIsOnboardingComplete(onboardingComplete === "true")
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem("vendor_onboarding_complete", "true")
    setIsOnboardingComplete(true)
  }

  // Mock data
  const stats = {
    totalProducts: 24,
    totalEarnings: 15420.5,
    averageRating: 4.8,
    totalOrders: 156,
  }

  const recentOrders = [
    { id: "001", customer: "John Doe", amount: 45.5, status: "completed", time: "2 hours ago" },
    { id: "002", customer: "Jane Smith", amount: 32.0, status: "pending", time: "4 hours ago" },
    { id: "003", customer: "Mike Johnson", amount: 78.25, status: "completed", time: "6 hours ago" },
  ]

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
              <h1 className="text-lg font-bold text-gray-900">BetaDay Vendor</h1>
              <p className="text-xs text-gray-500">Welcome back, {vendor?.fullName?.split(" ")[0]}!</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="space-y-3">
              <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Profile</span>
              </Link>
              <Link href="/wallet" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Wallet className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Wallet</span>
              </Link>
              <Link href="/products" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Products</span>
              </Link>
              <Link href="/orders" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Orders</span>
              </Link>
              <Link href="/reviews" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Reviews</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
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

      <main className="p-4 space-y-6">
        {/* Onboarding Alert */}
        {!isOnboardingComplete && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Complete Your Setup</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Create your product catalogue to start receiving orders from customers.
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
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
                <p className="text-2xl font-bold text-gray-900">₦{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/products/create"
              className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100"
            >
              <Plus className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Add Product</span>
            </Link>

            <Link
              href="/orders"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100"
            >
              <Eye className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">View Orders</span>
            </Link>

            <Link
              href="/wallet"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100"
            >
              <Wallet className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Wallet</span>
            </Link>

            <Link
              href="/reviews"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100"
            >
              <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Reviews</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/orders" className="text-orange-600 text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{order.customer}</p>
                  <p className="text-sm text-gray-600">
                    Order #{order.id} • {order.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦{order.amount}</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center py-2 text-orange-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center py-2 text-gray-600">
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1">Products</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center py-2 text-gray-600">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs mt-1">Orders</span>
          </Link>
          <Link href="/wallet" className="flex flex-col items-center py-2 text-gray-600">
            <Wallet className="w-5 h-5" />
            <span className="text-xs mt-1">Wallet</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
