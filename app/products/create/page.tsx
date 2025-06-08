"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Plus, X, DollarSign, Package } from "lucide-react";

interface Product {
  name: string;
  description: string;
  price: string;
  category: string;
  image: File | null;
  isAvailable: boolean;
}

const CATEGORIES = [
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
  const [products, setProducts] = useState<Product[]>([
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

  const handleProductChange = (
    index: number,
    field: keyof Product,
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

  const handleImageChange = (index: number, file: File | null) => {
    handleProductChange(index, "image", file);
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

  const handleSubmit = async () => {
    if (!validateProducts()) return;

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark onboarding as complete
      localStorage.setItem("vendor_onboarding_complete", "true");

      router.push("/dashboard");
    } catch (error) {
      setErrors({ general: "Failed to create products. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductForm = (product: Product, index: number) => (
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(index, e.target.files?.[0] || null)
                }
                className="hidden"
                id={`image-${index}`}
              />
              <label
                htmlFor={`image-${index}`}
                className="mobile-button-secondary cursor-pointer text-center"
              >
                {product.image ? "Change Image" : "Add Image"}
              </label>
            </div>
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label
            htmlFor={`name-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Name
          </label>
          <input
            type="text"
            id={`name-${index}`}
            value={product.name}
            onChange={(e) => handleProductChange(index, "name", e.target.value)}
            className={`mobile-input ${
              errors[`${index}_name`] ? "border-red-300" : ""
            }`}
            placeholder="Enter product name"
          />
          {errors[`${index}_name`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_name`]}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor={`description-${index}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id={`description-${index}`}
            value={product.description}
            onChange={(e) =>
              handleProductChange(index, "description", e.target.value)
            }
            rows={3}
            className={`mobile-input resize-none ${
              errors[`${index}_description`] ? "border-red-300" : ""
            }`}
            placeholder="Describe your product"
          />
          {errors[`${index}_description`] && (
            <p className="text-red-600 text-sm mt-1">
              {errors[`${index}_description`]}
            </p>
          )}
        </div>

        {/* Price and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={`price-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Price (₦)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                id={`price-${index}`}
                value={product.price}
                onChange={(e) =>
                  handleProductChange(index, "price", e.target.value)
                }
                className={`mobile-input pl-10 ${
                  errors[`${index}_price`] ? "border-red-300" : ""
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            {errors[`${index}_price`] && (
              <p className="text-red-600 text-sm mt-1">
                {errors[`${index}_price`]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`category-${index}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            <select
              id={`category-${index}`}
              value={product.category}
              onChange={(e) =>
                handleProductChange(index, "category", e.target.value)
              }
              className={`mobile-input ${
                errors[`${index}_category`] ? "border-red-300" : ""
              }`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((category) => (
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

        {/* Products */}
        {products.map((product, index) => renderProductForm(product, index))}

        {/* Add Another Product */}
        <button
          onClick={addProduct}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-300 hover:text-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Another Product
        </button>

        {/* Submit Button */}
        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="mobile-button flex items-center justify-center gap-2"
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

          <Link href="/dashboard">
            <button className="mobile-button-secondary">
              Save as Draft & Continue Later
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
