"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Mock orders data
  const orders = [
    {
      id: "001",
      customer: "John Doe",
      items: ["Jollof Rice", "Chicken"],
      total: 2500,
      status: "pending",
      date: "2024-01-15",
      time: "2:30 PM",
    },
    {
      id: "002",
      customer: "Jane Smith",
      items: ["Fried Rice", "Fish"],
      total: 3200,
      status: "completed",
      date: "2024-01-15",
      time: "1:15 PM",
    },
    {
      id: "003",
      customer: "Mike Johnson",
      items: ["Amala", "Ewedu", "Meat"],
      total: 1800,
      status: "cancelled",
      date: "2024-01-14",
      time: "6:45 PM",
    },
    {
      id: "004",
      customer: "Sarah Wilson",
      items: ["Pounded Yam", "Egusi"],
      total: 2800,
      status: "completed",
      date: "2024-01-14",
      time: "5:20 PM",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
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
              <h1 className="text-lg font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500">Manage your orders</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "all"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "pending"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "completed"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Orders List */}
          <div className="p-4 space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status}
                          </span>
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{order.customer}</p>
                      <p className="text-gray-500 text-xs">
                        {order.date} at {order.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₦{order.total.toLocaleString()}
                      </p>
                      <button className="text-orange-600 text-sm mt-1 flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-600 mb-2">Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <span
                          key={index}
                          className="bg-white px-2 py-1 rounded text-xs text-gray-700 border"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="flex space-x-2 mt-4">
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium">
                        Accept
                      </button>
                      <button className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium">
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
