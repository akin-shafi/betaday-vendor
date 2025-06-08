"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    promotions: false,
    reviews: true,
  });

  const handleLogout = () => {
    localStorage.removeItem("vendor_token");
    localStorage.removeItem("vendor_onboarding_complete");
    window.location.href = "/auth/login";
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
              <h1 className="text-lg font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Manage your preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified when you receive new orders
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.orderAlerts}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    orderAlerts: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-500">
                  Receive updates about new features and offers
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.promotions}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    promotions: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Reviews</p>
                <p className="text-sm text-gray-500">
                  Get notified when customers leave reviews
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.reviews}
                onChange={(e) =>
                  setNotifications((prev) => ({
                    ...prev,
                    reviews: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Change Password</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Two-Factor Authentication</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Support</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Help Center</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Contact Support</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Terms of Service</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-900">Privacy Policy</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </main>
    </div>
  );
}
