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
import Footer from "@/components/footer";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  // Mock data
  const walletData = {
    balance: 450230.75,
    pendingBalance: 21050.0,
    totalEarnings: 1254300.5,
    totalWithdrawals: 800199.75,
  };

  const transactions = [
    {
      id: "1",
      type: "earning",
      description: "Order #001 - John Doe",
      amount: 45.5,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "withdrawal",
      description: "Bank Transfer",
      amount: -500.0,
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      type: "earning",
      description: "Order #002 - Jane Smith",
      amount: 32.0,
      date: "2024-01-14",
      status: "pending",
    },
    {
      id: "4",
      type: "earning",
      description: "Order #003 - Mike Johnson",
      amount: 78.25,
      date: "2024-01-13",
      status: "completed",
    },
  ];

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

  const toggleBalanceVisibility = () => {
    setShowBalance((prev) => !prev);
  };

  const formatBalance = (amount: number) => {
    if (!showBalance) {
      // Return asterisks roughly matching the length of the formatted number
      const formattedLength = amount.toLocaleString().length;
      return "*".repeat(formattedLength);
    }
    return `₦${amount.toLocaleString()}`;
  };

  const handleWithdraw = () => {
    // TODO: Implement withdrawal logic
    setShowWithdrawModal(false);
    setWithdrawAmount("");
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
              <h1 className="text-lg font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-500">Manage your earnings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Balance Card */}
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
              {formatBalance(walletData.balance)}
            </p>
            <p className="text-orange-100 text-sm mt-1">
              Pending: {formatBalance(walletData.pendingBalance)}
            </p>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full bg-white text-orange-600 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Withdraw Funds
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatBalance(walletData.totalEarnings)}
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
                  {formatBalance(walletData.totalWithdrawals)}
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
                          {transaction.date}
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
                          transaction.type === "earning"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "earning" ? "+" : ""}₦
                        {Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "withdrawals" && (
              <div className="space-y-3">
                {transactions
                  .filter((t) => t.type === "withdrawal")
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
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">
                          ₦{Math.abs(transaction.amount).toLocaleString()}
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
      {showWithdrawModal && (
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
                  max={walletData.balance}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {formatBalance(walletData.balance)}
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
                    Number(withdrawAmount) > walletData.balance
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
