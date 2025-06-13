"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSession } from "@/lib/session";

interface OrderItem {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  itemType: string;
  packId: string | null;
  price: string;
  name: string;
  specialInstructions: string | null;
  created_at: string;
  updated_at: string;
  status: string;
}

interface RecentOrder {
  user: string;
  orderItems: OrderItem[];
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  walletBalance: number;
  recentOrders: RecentOrder[];
  ordersByStatus: Record<string, number>;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchDashboardStats = useCallback(
    async (
      period: "day" | "week" | "month" | "year" | "custom" = "month",
      customDateRange?: { startDate: string; endDate: string }
    ) => {
      console.log("Fetching stats with period:", period, "and date range:", customDateRange); // Debug log
      setIsLoading(true);
      setError(null);

      try {
        const session = getSession();
        if (!session?.token) {
          throw new Error("No authentication token found");
        }

        const queryParams = new URLSearchParams();
        if (period !== "custom") {
          queryParams.append("period", period);
        }
        if (customDateRange && period === "custom") {
          queryParams.append("startDate", customDateRange.startDate);
          queryParams.append("endDate", customDateRange.endDate);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vendors/dashboard-stats?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch dashboard statistics");
        }

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "Failed to fetch dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardStats("month");
    }
  }, [fetchDashboardStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboardStats,
  };
}