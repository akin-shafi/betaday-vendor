"use client"

import { useState } from "react"
import { getSession } from "@/lib/session"
import { useBusiness } from "@/hooks/useBusiness"

export interface ComboItem {
  productId: string
  quantity: number
  required:boolean
  product?: {
    id: string
    name: string
    price: number
    image: string | null
  }
}

export interface CreateComboData {
  name: string
  description: string
  items: ComboItem[]
  price: number
  businessId: string
  categories: string[]
  isAvailable: boolean
  isCombo: boolean
}

export function useComboProducts() {
  const { business } = useBusiness()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"

  const getAuthHeaders = () => {
    const session = getSession()
    if (!session?.token) {
      throw new Error("Authentication required")
    }
    return {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    }
  }

  const createCombo = async (comboData: CreateComboData) => {
    try {
      setIsLoading(true)
      setError(null)

      const payload = {
        ...comboData,
        categories: ["Combos"],
        isAvailable: true,
        isCombo: true,
      }

      console.log("Creating combo with payload:", payload)
      
      const response = await fetch(`${baseUrl}/products/single`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })

 

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create combo: ${response.status}`)
      }

      const data = await response.json()
      console.log("Combo created successfully:", data)
      return data.combo
    } catch (error) {
      console.error("Error creating combo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create combo"
      setError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCombo,
    isLoading,
    error,
  }
}