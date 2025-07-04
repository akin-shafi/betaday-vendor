"use client"

import { useState, useEffect, useCallback } from "react"
import { getSession } from "@/lib/session"
import { useBusiness } from "@/hooks/useBusiness"
import type { Product, CreateProductData, UpdateProductData, ProductCategory } from "@/types/product"

export function useProducts() {
  const { business } = useBusiness()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  const fetchProducts = useCallback(async () => {
    if (!business?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${baseUrl}/products/business/${business.id}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch products")
    } finally {
      setIsLoading(false)
    }
  }, [business?.id])

  const fetchCategories = useCallback(async () => {
    if (!business?.id) return

    try {
      const response = await fetch(`${baseUrl}/product-categories/all?isPredefined=true`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`)
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [business?.id])

  const createProduct = async (productData: CreateProductData): Promise<Product> => {
    try {
      const response = await fetch(`${baseUrl}/products/single`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create product: ${response.status}`)
      }

      const data = await response.json()
      const newProduct = data.product

      setProducts((prev) => [newProduct, ...prev])
      return newProduct
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  const createMultipleProducts = async (productsData: CreateProductData[]): Promise<Product[]> => {
    try {
      const response = await fetch(`${baseUrl}/products/multiple`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ products: productsData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create products: ${response.status}`)
      }

      const data = await response.json()
      const newProducts = data.products || []

      setProducts((prev) => [...newProducts, ...prev])
      return newProducts
    } catch (error) {
      console.error("Error creating multiple products:", error)
      throw error
    }
  }

  const updateProduct = async (productId: string, updateData: UpdateProductData): Promise<Product> => {
    try {
      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update product: ${response.status}`)
      }

      const data = await response.json()
      const updatedProduct = data.product

      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)))
      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  const updateProductImage = async (productId: string, image: File | string): Promise<any> => {
    try {
      const session = getSession()
      if (!session?.token) {
        throw new Error("Authentication required")
      }

      console.log("Starting product image update...")
      console.log("Product ID:", productId)
      console.log("Image type:", image instanceof File ? "File" : "URL")

      let response
      if (image instanceof File) {
        const formData = new FormData()
        formData.append("image", image)
        console.log("Sending file upload request...")
        response = await fetch(`${baseUrl}/products/${productId}/image`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
          body: formData,
        })
        console.log("File upload response:", response.status)
      } else {
        console.log("Sending URL update request...")
        response = await fetch(`${baseUrl}/products/${productId}/image`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image }),
        })
        console.log("URL update response:", response.status)
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(errorData.message || "Failed to update product image")
      }

      const data = await response.json()
      console.log("Image update successful:", data)

      if (data.product) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)))
        return data.product
      }

      return data
    } catch (error) {
      console.error("Error in updateProductImage:", error)
      throw error
    }
  }

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      const response = await fetch(`${baseUrl}/products/${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to delete product: ${response.status}`)
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  const getProduct = useCallback(
    async (productId: string): Promise<Product | null> => {
      // Check local state first
      const foundProduct = products.find((p) => p.id === productId)
      if (foundProduct) {
        return foundProduct
      }

      // Fetch directly from API if not found locally
      try {
        const response = await fetch(`${baseUrl}/products/${productId}`, {
          headers: getAuthHeaders(),
        })

        if (!response.ok) {
          if (response.status === 404) {
            return null // Product not found
          }
          throw new Error(`Failed to fetch product: ${response.status}`)
        }

        const data = await response.json()
        const product = data.product
        if (product) {
          // Avoid updating state to prevent re-renders
          return product
        }
        return null
      } catch (error) {
        console.error("Error fetching product:", error)
        return null
      }
    },
    [products] // Depend on products for local lookup
  )

  useEffect(() => {
    if (business?.id) {
      fetchProducts()
      fetchCategories()
    }
  }, [business?.id, fetchProducts, fetchCategories])

  const refetch = () => {
    fetchProducts()
    fetchCategories()
  }

  return {
    products,
    categories,
    isLoading,
    error,
    createProduct,
    createMultipleProducts,
    updateProduct,
    updateProductImage,
    deleteProduct,
    getProduct,
    refetch,
  }
}