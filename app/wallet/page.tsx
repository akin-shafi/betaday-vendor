"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Download,
  Plus,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { message } from "antd";
import Footer from "@/components/footer";
import { getSessionToken } from "@/lib/session";
import { useAuth } from "@/providers/auth-provider";

// Define types for API responses
interface WalletBalance {
  balance: number;
  formattedBalance: string;
  currency: string;
  lastUpdated: string;
}

interface DvaDetails {
  accountNumber: string | null;
  bankName: string | null;
}

interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  amount: string;
  type: "credit" | "debit";
  status: string;
  reference: string;
  provider: string;
  description: string;
  metadata: any;
  gatewayReference: string | null;
  gatewayStatus: string | null;
  gatewayResponse: any;
  orderId: string | null;
  category: string;
  currency: string;
  fee: string;
  balanceAfter: string;
  createdAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null
  );
  const [dvaDetails, setDvaDetails] = useState<DvaDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { vendor } = useAuth();
  const token = getSessionToken();
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8500";

  // Load balance visibility preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("showWalletBalance");
    if (savedPreference !== null) {
      setShowBalance(JSON.parse(savedPreference));
    }
  }, []);

  // Save balance visibility preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("showWalletBalance", JSON.stringify(showBalance));
  }, [showBalance]);

  // Fetch wallet data on mount and when vendor or token changes
  useEffect(() => {
    if (vendor?.id && token) {
      fetchWalletData();
    }
  }, [vendor?.id, token]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch wallet balance
      const balanceResponse = await fetch(`${API_URL}/api/wallet/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!balanceResponse.ok) {
        const errorData = await balanceResponse.json();
        throw new Error(errorData.message || "Failed to fetch wallet balance");
      }
      const balanceData: ApiResponse<WalletBalance> =
        await balanceResponse.json();
      setWalletBalance(balanceData.data);

      // Fetch DVA details
      const dvaResponse = await fetch(`${API_URL}/api/wallet/dva-details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!dvaResponse.ok) {
        const errorData = await dvaResponse.json();
        throw new Error(errorData.message || "Failed to fetch DVA details");
      }
      const dvaData: ApiResponse<DvaDetails> = await dvaResponse.json();
      setDvaDetails(dvaData.data);

      // Fetch transactions
      const transactionsResponse = await fetch(
        `${API_URL}/api/wallet/transactions?page=1&limit=20`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!transactionsResponse.ok) {
        const errorData = await transactionsResponse.json();
        throw new Error(errorData.message || "Failed to fetch transactions");
      }
      const transactionsData: ApiResponse<{ transactions: Transaction[] }> =
        await transactionsResponse.json();
      setTransactions(transactionsData.data.transactions);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load wallet data";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleBalanceVisibility = () => {
    setShowBalance((prev) => !prev);
  };

  const formatBalance = (amount: number | string) => {
    if (!showBalance) {
      const formattedLength = String(Number(amount).toLocaleString()).length;
      return "*".repeat(formattedLength);
    }
    return `₦${Number(amount).toLocaleString()}`;
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal logic with API call
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    message.success("Withdrawal request submitted successfully");
  };

  // Calculate derived stats for display
  const totalEarnings = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "debit" && t.category === "payment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

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
              <h1 className="text-lg font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-500">Manage your earnings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* Balance Card */}
        {walletBalance && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wallet className="w-6 h-6" />
                <span className="text-lg font-semibold">Available Balance</span>
              </div>
              <button onClick={toggleBalanceVisibility} className="p-1">
                {showBalance ? (
                  <Eye className="w-5 h-5 opacity-75" />
                ) : (
                  <EyeOff className="w-5 h-5 opacity-75" />
                )}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold">
                {formatBalance(walletBalance.balance)}
              </p>
              <p className="text-orange-100 text-sm mt-1">
                Pending: {formatBalance(0)} {/* Pending balance not in API */}
              </p>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full bg-white text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Withdraw Funds
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatBalance(totalEarnings)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Withdrawals</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatBalance(totalWithdrawals)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <div className="flex min-w-max border-b border-gray-200">
              <button
                onClick={() => setActiveTab("overview")}
                className={`whitespace-nowrap flex-1 sm:flex-grow py-3 px-4 text-sm font-medium ${
                  activeTab === "overview"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("withdrawals")}
                className={`whitespace-nowrap flex-1 sm:flex-grow py-3 px-4 text-sm font-medium ${
                  activeTab === "withdrawals"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500"
                }`}
              >
                Withdrawals
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₦
                        {Math.abs(Number(transaction.amount)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "withdrawals" && (
              <div className="space-y-3">
                {transactions
                  .filter((t) => t.type === "debit" && t.category === "payment")
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          ₦
                          {Math.abs(
                            Number(transaction.amount)
                          ).toLocaleString()}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawModal && walletBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Withdraw Funds
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Amount (₦)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="mobile-input"
                  placeholder="Enter amount to withdraw"
                  max={walletBalance.balance}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {formatBalance(walletBalance.balance)}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Withdrawals are processed within 1-3
                  business days. A processing fee of ₦50 applies to all
                  withdrawals.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={
                    !withdrawAmount ||
                    Number(withdrawAmount) <= 0 ||
                    Number(withdrawAmount) > walletBalance.balance
                  }
                  className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <Footer />
    </div>
  );
}
