"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/session"

export interface Order {
  id: string
  customerName: string
  amount: number
  status: string
  date: string
  items?: string[]
}

interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface UseOrdersOptions {
  status?: string
  page?: number
  limit?: number
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: options.page || 1,
    limit: options.limit || 10,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async (params: UseOrdersOptions = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const session = getSession()
      if (!session?.token) {
        throw new Error("No authentication token found")
      }

      const queryParams = new URLSearchParams()
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status)
      }
      queryParams.append("page", String(params.page || pagination.page))
      queryParams.append("limit", String(params.limit || pagination.limit))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/orders?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch orders")
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      })
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "Failed to fetch orders")
    } finally {
      setIsLoading(false)
    }
  }

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    fetchOrders({ ...options, page: newPage })
  }

  const changeStatus = (status: string) => {
    fetchOrders({ ...options, status, page: 1 })
  }

  useEffect(() => {
    fetchOrders(options)
  }, [])

  return {
    orders,
    pagination,
    isLoading,
    error,
    refetch: fetchOrders,
    changePage,
    changeStatus,
  }
}
