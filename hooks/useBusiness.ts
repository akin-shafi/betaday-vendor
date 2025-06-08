"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/session"
import { useAuth } from "@/providers/auth-provider"
import type { Business } from "@/types/vendor"

// Add this helper function at the top of the file
function parseDeliveryOptions(options: string | string[] | undefined): string[] {
  if (!options) return []
  if (Array.isArray(options)) return options

  try {
    // Try to parse it as JSON if it's a string representation of an array
    const parsed = JSON.parse(options)
    return Array.isArray(parsed) ? parsed : [options]
  } catch (e) {
    // If it can't be parsed as JSON, treat it as a single string or split by comma
    return options.includes(",") ? options.split(",").map((o) => o.trim()) : [options]
  }
}

export function useBusiness() {
  const { vendor } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBusiness = async () => {
    if (!vendor?.id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const session = getSession()
      if (!session?.token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"}/businesses/user/${vendor.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        if (response.status === 404) {
          setBusiness(null)
          return
        }
        throw new Error(`Failed to fetch business data: ${response.status}`)
      }

      const data = await response.json()

      if (!data.businesses || !Array.isArray(data.businesses) || data.businesses.length === 0) {
        setBusiness(null)
        return
      }

      // Get the first business from the array
      const businessInfo = data.businesses[0]

      // Add this to ensure deliveryOptions is properly parsed:
      if (businessInfo) {
        // Parse deliveryOptions if it exists
        if (businessInfo.deliveryOptions) {
          businessInfo.deliveryOptions = parseDeliveryOptions(businessInfo.deliveryOptions)
        }
      }

      // Then set the business state:
      setBusiness(businessInfo)
    } catch (error) {
      console.error("Error fetching business data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch business data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBusiness()
  }, [vendor?.id])

  const refetch = () => {
    fetchBusiness()
  }

  return {
    business,
    isLoading,
    error,
    refetch,
  }
}
