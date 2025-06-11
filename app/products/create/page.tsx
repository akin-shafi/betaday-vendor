"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Plus,
  X,
  DollarSign,
  Package,
  Save,
  Sparkles,
} from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";
import { useProducts } from "@/hooks/useProducts";
import { useProductDescriptionSuggestion } from "@/hooks/useProductDescriptionSuggestion";
import { ImageUploadModal } from "@/components/modals/image-upload-modal";
import {
  getProductSuggestions,
  type ProductSuggestion,
} from "@/hooks/useProductNameSuggestion";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image: File | null;
  isAvailable: boolean;
}

const DEFAULT_CATEGORIES = [
  "Food & Beverages",
  "Electronics",
  "Clothing",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Other",
];

export default function CreateProductPage() {
  const router = useRouter();
  const { business } = useBusiness();
  const {
    createProduct,
    updateProductImage,
    categories,
    createMultipleProducts,
  } = useProducts();
  const { generateDescription, isLoading: suggestionLoading } =
    useProductDescriptionSuggestion();

  const [products, setProducts] = useState<ProductForm[]>([
    {
      name: "",
      description: "",
      price: "",
      category: "",
      image: null,
      isAvailable: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(
    null
  );
  const [suggestionErrors, setSuggestionErrors] = useState<
    Record<number, string>
  >({});

  // Simple suggestion states
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Use categories from API or fallback to default
  const availableCategories =
    categories.length > 0
      ? categories.map((cat) => cat.name)
      : DEFAULT_CATEGORIES;

  // Handle name input change and show suggestions
  const handleNameChange = (index: number, value: string) => {
    // Update the product name
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], name: value };
    setProducts(updatedProducts);

    // Set current editing index
    setCurrentEditingIndex(index);

    // Get suggestions
    if (value.length >= 2) {
      const newSuggestions = getProductSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setActiveSuggestionIndex(-1);

    // Clear error
    const errorKey = `${index}_name`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (
    index: number,
    suggestion: ProductSuggestion
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      name: suggestion.name,
      category: suggestion.category,
      price: suggestion.estimatedPrice
        ? suggestion.estimatedPrice.toString()
        : "",
      description: suggestion.description || "",
    };
    setProducts(updatedProducts);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentEditingIndex(null);

    // Clear any errors for the fields we just filled
    const fieldsToCheck = ["name", "category", "price", "description"];
    const clearedErrors = { ...errors };
    fieldsToCheck.forEach((field) => {
      const errorKey = `${index}_${field}`;
      if (clearedErrors[errorKey]) {
        delete clearedErrors[errorKey];
      }
    });
    setErrors(clearedErrors);
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSelectSuggestion(index, suggestions[activeSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".suggestion-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductChange = (
    index: number,
    field: keyof ProductForm,
    value: any
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);

    // Clear error when user starts typing
    const errorKey = `${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleImageUpload = (index: number) => {
    setCurrentImageIndex(index);
    setImageModalOpen(true);
  };

  const handleImageSelected = async (file: File) => {
    if (currentImageIndex !== null) {
      handleProductChange(currentImageIndex, "image", file);
    }
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
        isAvailable: true,
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    }
  };

  const validateProducts = () => {
    const newErrors: Record<string, string> = {};

    products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`${index}_name`] = "Product name is required";
      }
      if (!product.description.trim()) {
        newErrors[`${index}_description`] = "Description is required";
      }
      if (!product.price.trim()) {
        newErrors[`${index}_price`] = "Price is required";
      } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
        newErrors[`${index}_price`] = "Please enter a valid price";
      }
      if (!product.category) {
        newErrors[`${index}_category`] = "Category is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuggestDescription = async (index: number) => {
    const product = products[index];

    // Clear previous errors
    setSuggestionErrors((prev) => ({ ...prev, [index]: "" }));

    // Validate required fields
    if (!product.name.trim()) {
      setSuggestionErrors((prev) => ({
        ...prev,
        [index]: "Product name is required for suggestion",
      }));
      return;
    }

    if (!product.category) {
      setSuggestionErrors((prev) => ({
        ...prev,
        [index]: "Category is required for suggestion",
      }));
      return;
    }

    // Generate description
    const description = await generateDescription(
      product.name,
      product.category
    );

    if (description) {
      handleProductChange(index, "description", description);
    }
  };

  const handleSubmit = async () => {
    if (!validateProducts() || !business?.id) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Prepare product data array
      const productDataArray = products.map((product) => ({
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        category: product.category,
        isAvailable: product.isAvailable,
        businessId: business.id,
      }));

      // Use different approach based on number of products
      if (productDataArray.length === 1) {
        // Single product creation
        const createdProduct = await createProduct(productDataArray[0]);

        // Upload image if provided
        if (products[0].image) {
          try {
            await updateProductImage(createdProduct.id, products[0].image);
          } catch (imageError) {
            console.error(
              "Failed to upload image for product:",
              createdProduct.id,
              imageError
            );
          }
        }
      } else {
        // Multiple products creation
        const createdProducts = await createMultipleProducts(productDataArray);

        // Upload images for products that have them
        for (let i = 0; i < createdProducts.length; i++) {
          if (products[i].image) {
            try {
              await updateProductImage(
                createdProducts[i].id,
                products[i].image
              );
            } catch (imageError) {
              console.error(
                "Failed to upload image for product:",
                createdProducts[i].id,
                imageError
              );
            }
          }
        }
      }

      // Navigate to products list
      router.push("/products");
    } catch (error) {
      console.error("Error creating products:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to create products. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    // Save to localStorage for later
    localStorage.setItem("draft_products", JSON.stringify(products));
    router.push("/dashboard");
  };

  const renderProductForm = (product: ProductForm, index: number) => (
    <div
      key={index}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Product {index + 1}
        </h3>
        {products.length > 1 && (
          <button
            onClick={() => removeProduct(index)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Product Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={URL.createObjectURL(product.image) || "/placeholder.svg"}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => handleImageUpload(index)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {product.image ? "Change Image" : "Add Image"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Name with Auto-suggestions */}
        <div className="relative suggestion-container">
          <label
            htmlFor={`name-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Name *
          </label>
          <input
            type="text"
            id={`name-${index}`}
            value={product.name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => {
              if (product.name.length >= 2) {
                setCurrentEditingIndex(index);
                setSuggestions(getProductSuggestions(product.name));
                setShowSuggestions(true);
              }
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 ${
              errors[`${index}_name`] ? "border-red-300" : ""
            }`}
            placeholder="Start typing product name..."
            disabled={isLoading}
          />
          {errors[`${index}_name`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_name`]}
            </p>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions &&
            suggestions.length > 0 &&
            currentEditingIndex === index && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                {suggestions.map((suggestion, suggestionIndex) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(index, suggestion)}
                    className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                      suggestionIndex === activeSuggestionIndex
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {suggestion.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {suggestion.category}
                        </p>
                        {suggestion.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
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

        {/* Category */}
        <div>
          <label
            htmlFor={`category-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category *
          </label>
          <select
            id={`category-${index}`}
            value={product.category}
            onChange={(e) =>
              handleProductChange(index, "category", e.target.value)
            }
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 ${
              errors[`${index}_category`] ? "border-red-300" : ""
            }`}
            disabled={isLoading}
          >
            <option value="">Select category</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors[`${index}_category`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_category`]}
            </p>
          )}
        </div>

        {/* Description with Suggestion Button */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={`description-${index}`}
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <button
              type="button"
              onClick={() => handleSuggestDescription(index)}
              disabled={
                isLoading ||
                suggestionLoading ||
                !product.name ||
                !product.category
              }
              className={`px-3 py-1 text-sm rounded font-medium transition-colors flex items-center gap-1 ${
                isLoading ||
                suggestionLoading ||
                !product.name ||
                !product.category
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
          {suggestionErrors[index] && (
            <p className="text-amber-600 text-xs mb-1">
              {suggestionErrors[index]}
            </p>
          )}
          <textarea
            id={`description-${index}`}
            value={product.description}
            onChange={(e) =>
              handleProductChange(index, "description", e.target.value)
            }
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 resize-none ${
              errors[`${index}_description`] ? "border-red-300" : ""
            }`}
            placeholder="Describe your product"
            disabled={isLoading}
          />
          {errors[`${index}_description`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_description`]}
            </p>
          )}
          {product.category === "Food & Beverages" && !product.description && (
            <p className="text-xs text-gray-500 mt-1">
              Tip: For Nigerian food items like Jollof Rice, Egusi Soup, or
              Pounded Yam, click "Suggest Description" for an authentic
              description.
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor={`price-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Price (₦) *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400">₦ </div>
            <input
              type="number"
              id={`price-${index}`}
              value={product.price}
              onChange={(e) =>
                handleProductChange(index, "price", e.target.value)
              }
              className={`w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 ${
                errors[`${index}_price`] ? "border-red-300" : ""
              }`}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          {errors[`${index}_price`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_price`]}
            </p>
          )}
        </div>

        {/* Availability */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id={`available-${index}`}
            checked={product.isAvailable}
            onChange={(e) =>
              handleProductChange(index, "isAvailable", e.target.checked)
            }
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            disabled={isLoading}
          />
          <label
            htmlFor={`available-${index}`}
            className="text-sm text-gray-700"
          >
            Product is available for sale
          </label>
        </div>
      </div>
    </div>
  );

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Add Products</h1>
              <p className="text-sm text-gray-500">
                Create your product catalogue
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Helper Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Start typing a product name to see
            suggestions. Selecting a suggestion will auto-fill the name,
            category, price, and description for you!
          </p>
        </div>

        {/* Products */}
        {products.map((product, index) => renderProductForm(product, index))}

        {/* Add Another Product */}
        <button
          onClick={addProduct}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Another Product
        </button>

        {/* Submit Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || products.length === 0}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Create Products ({products.length})
              </>
            )}
          </button>

          <button
            onClick={handleSaveAsDraft}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save as Draft & Continue Later
          </button>
        </div>
      </main>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setCurrentImageIndex(null);
        }}
        onUpload={handleImageSelected}
        title="Upload Product Image"
      />
    </div>
  );
}
