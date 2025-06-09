"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/session"

interface RecentOrder {
  id: string
  customerName: string
  amount: number
  status: string
  date: string
}

export interface DashboardStats {
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalRevenue: number
  recentOrders: RecentOrder[]
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const session = getSession()
      if (!session?.token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch dashboard statistics")
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err)
      setError(err.message || "Failed to fetch dashboard statistics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboardStats,
  }
}
