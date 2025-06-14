"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/lib/utils";
import Footer from "@/components/footer";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { orders, pagination, isLoading, error, changePage, changeStatus } =
    useOrders({ page: 1, limit: 10, status: "pending" });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="p-4 space-y-6 mb-20">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("pending");
                changeStatus("pending");
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "pending"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => {
                setActiveTab("delivered");
                changeStatus("delivered");
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "delivered"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Delivered
            </button>
          </div>

          {/* Orders List */}
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>{error}</p>
                <button
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <>
                {orders.map((order) => {
                  const formattedDate = formatDate(order.date);
                  return (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate-text">
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
                          <p className="text-gray-600 text-sm">
                            {order.customerName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formattedDate.date} at {formattedDate.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(order.amount)}
                          </p>
                        </div>
                      </div>

                      {order.items && (
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
                      )}
                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} orders
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="p-2 rounded border border-gray-300 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded border border-gray-300 disabled:opacity-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
