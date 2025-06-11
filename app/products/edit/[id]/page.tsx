"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Save, Loader2, Sparkles } from "lucide-react"
import { useProducts } from "@/hooks/useProducts"
import { useProductDescriptionSuggestion } from "@/hooks/useProductDescriptionSuggestion"
import { ImageUploadModal } from "@/components/modals/image-upload-modal"
import type { Product, UpdateProductData } from "@/types/product"
import { getProductSuggestions, type ProductSuggestion } from "@/hooks/useProductNameSuggestion"

const DEFAULT_CATEGORIES = [
  "Food & Beverages",
  "Electronics",
  "Clothing",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Other",
]

interface FormData {
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  image: string
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getProduct, updateProduct, updateProductImage, categories } = useProducts()
  const { generateDescription, isLoading: suggestionLoading } = useProductDescriptionSuggestion()

  const [originalProduct, setOriginalProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    isAvailable: true,
    image: "",
  })
  const [isProductLoading, setIsProductLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const availableCategories = categories.length > 0 ? categories.map((cat) => cat.name) : DEFAULT_CATEGORIES

  // Fetch product on mount
  useEffect(() => {
    async function fetchProduct() {
      setIsProductLoading(true)
      setErrors({})

      try {
        const product = await getProduct(params.id)
        if (product) {
          console.log("Initializing form with product:", product)
          setOriginalProduct(product)
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: Number(product.price) || 0,
            category: product.category || "",
            isAvailable: product.isAvailable ?? true,
            image: product.image || "",
          })
        } else {
          setErrors({ general: "Product not found" })
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setErrors({
          general: error instanceof Error ? error.message : "Failed to load product. Please try again.",
        })
      } finally {
        setIsProductLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, getProduct])

  const handleSelectSuggestion = (suggestion: ProductSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      category: suggestion.category,
      price: suggestion.estimatedPrice || prev.price,
      description: suggestion.description || prev.description,
    }))
    setShowSuggestions(false)
    setSuggestions([])

    const fieldsToCheck = ["name", "category", "price", "description"]
    const clearedErrors = { ...errors }
    fieldsToCheck.forEach((field) => {
      if (clearedErrors[field]) {
        delete clearedErrors[field]
      }
    })
    setErrors(clearedErrors)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (activeSuggestionIndex >= 0) {
          handleSelectSuggestion(suggestions[activeSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".suggestion-container")) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    console.log("Input change:", name, value)

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : name === "price" ? Number(value) : value,
    }))

    if (name === "name") {
      if (value.length >= 2) {
        const newSuggestions = getProductSuggestions(value)
        setSuggestions(newSuggestions)
        setShowSuggestions(newSuggestions.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
      setActiveSuggestionIndex(-1)
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!originalProduct) return

    try {
      console.log("Starting image upload for product:", originalProduct.id)
      console.log("File type:", file.type)
      console.log("File size:", Math.round(file.size / 1024), "KB")

      const updatedProduct = await updateProductImage(originalProduct.id, file)
      console.log("Upload successful, updated product:", updatedProduct)

      if (updatedProduct && updatedProduct.image) {
        setFormData((prev) => ({
          ...prev,
          image: updatedProduct.image,
        }))
        console.log("Form data updated with new image:", updatedProduct.image)
      }

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }))
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      setErrors({
        ...errors,
        image: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
      })
    }
  }

  const handleSuggestDescription = async () => {
    setSuggestionError(null)

    if (!formData.name.trim()) {
      setSuggestionError("Product name is required for suggestion")
      return
    }

    if (!formData.category) {
      setSuggestionError("Category is required for suggestion")
      return
    }

    const description = await generateDescription(formData.name, formData.category)

    if (description) {
      setFormData((prev) => ({
        ...prev,
        description,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Please enter a valid price"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalProduct || !validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const updateData: UpdateProductData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        category: formData.category,
        isAvailable: formData.isAvailable,
      }

      console.log("Submitting update data:", updateData)
      await updateProduct(originalProduct.id, updateData)
      router.push("/products")
    } catch (error) {
      console.error("Failed to update product:", error)
      setErrors({
        general: error instanceof Error ? error.message : "Failed to update product. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!originalProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Product not found</p>
          <Link href="/products" className="mt-4 inline-block text-orange-600 hover:underline">
            Return to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/products">
              <button className="p-2 hover:bg-gray-100 rounded-lg" disabled={isLoading}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-500">Update product details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Start typing a product name to see suggestions. Selecting a suggestion will
            auto-fill the name, category, price, and description for you!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Image</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                {formData.image ? (
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Product"
                    className="w-full h-full object-cover rounded-lg"
                    key={formData.image}
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <Camera className="w-4 h-4 mr-2" />
                {formData.image ? "Change Image" : "Upload Image"}
              </button>
              {errors.image && <p className="text-red-600 text-sm">{errors.image}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-semibold text-gray-900">Product Details</h3>
            <div className="relative suggestion-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (formData.name.length >= 2) {
                    setSuggestions(getProductSuggestions(formData.name))
                    setShowSuggestions(true)
                  }
                }}
                required
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 ${
                  errors.name ? "border-red-300" : ""
                }`}
                placeholder="Start typing product name..."
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {suggestions.map((suggestion, suggestionIndex) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        suggestionIndex === activeSuggestionIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{suggestion.name}</p>
                          <p className="text-sm text-gray-600">{suggestion.category}</p>
                          {suggestion.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{suggestion.description}</p>
                          )}
                        </div>
                        {suggestion.estimatedPrice && (
                          <span className="text-sm font-medium text-orange-600">
                            ₦{suggestion.estimatedPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 ${
                  errors.category ? "border-red-300" : ""
                }`}
              >
                <option value="">Select category</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <button
                  type="button"
                  onClick={handleSuggestDescription}
                  disabled={isLoading || suggestionLoading || !formData.name || !formData.category}
                  className={`px-3 py-1 text-sm rounded font-medium transition-colors flex items-center gap-1 ${
                    isLoading || suggestionLoading || !formData.name || !formData.category
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {suggestionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Suggest Description
                    </>
                  )}
                </button>
              </div>
              {suggestionError && <p className="text-amber-600 text-xs mb-1">{suggestionError}</p>}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 ${
                  errors.description ? "border-red-300" : ""
                }`}
                placeholder="Describe your product"
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                disabled={isLoading}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 ${
                  errors.price ? "border-red-300" : ""
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
              />
              <label className="text-sm font-medium text-gray-700">Product is available for sale</label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Updating Product...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Product
              </>
            )}
          </button>
        </form>
      </main>

      <ImageUploadModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onUpload={handleImageUpload}
        currentImage={formData.image}
        title="Update Product Image"
      />
    </div>
  )
}