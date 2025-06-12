"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Minus,
  ShoppingCart,
  Package,
  DollarSign,
  Sparkles,
  Check,
} from "lucide-react";
import { useBusiness } from "@/hooks/useBusiness";
import { useProducts } from "@/hooks/useProducts";
import { useComboProducts, type ComboItem } from "@/hooks/useComboProducts";
import { formatCurrency } from "@/lib/utils";

interface ComboForm {
  name: string;
  description: string;
  items: ComboItem[];
  customPrice: string;
  useCustomPrice: boolean;
  isAvailable: boolean;
}

export default function EditComboPage() {
  const router = useRouter();
  const { id } = useParams();
  const { business } = useBusiness();
  const {
    products,
    getProduct,
    updateProduct,
    isLoading: productsLoading,
  } = useProducts();
  const { isLoading: comboLoading, error: comboError } = useComboProducts();

  const [form, setForm] = useState<ComboForm>({
    name: "",
    description: "",
    items: [],
    customPrice: "",
    useCustomPrice: false,
    isAvailable: true,
  });

  const [showProductSelector, setShowProductSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFetching, setIsFetching] = useState(true);

  // Fetch combo data on mount
  useEffect(() => {
    if (!id || typeof id !== "string") {
      setErrors({ fetch: "Invalid combo ID" });
      setIsFetching(false);
      return;
    }

    const fetchCombo = async () => {
      try {
        setIsFetching(true);
        const combo = await getProduct(id);
        if (!combo) {
          throw new Error("Combo not found");
        }
        setForm({
          name: combo.name,
          description: combo.description || "",
          items:
            combo.items?.map((item: ComboItem) => ({
              ...item,
              required: item.required ?? false, // Ensure required field is set
              product:
                products.find((p) => p.id === item.productId) || item.product,
            })) || [],
          customPrice: combo.price.toString(),
          useCustomPrice: true,
          isAvailable: combo.isAvailable ?? true,
        });
      } catch (error) {
        console.error("Failed to fetch combo:", error);
        setErrors({ fetch: "Failed to load combo data" });
      } finally {
        setIsFetching(false);
      }
    };

    fetchCombo();
  }, [id, getProduct, products]);

  // Filter products for search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !form.items.some((item) => item.productId === product.id)
  );

  // Calculate total price
  const calculatedTotal = form.items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const finalPrice = form.useCustomPrice
    ? Number(form.customPrice) || 0
    : calculatedTotal;

  // Add product to combo
  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newItem: ComboItem = {
      productId,
      quantity: 1,
      required: false, // Default to optional
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
    };

    setForm((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setShowProductSelector(false);
    setSearchQuery("");
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  };

  // Toggle required status
  const toggleRequired = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId ? { ...item, required: !item.required } : item
      ),
    }));
  };

  // Remove item from combo
  const removeItem = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Combo name is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (form.items.length < 2) {
      newErrors.items = "Please select at least 2 products for the combo";
    }

    if (
      form.useCustomPrice &&
      (!form.customPrice || Number(form.customPrice) <= 0)
    ) {
      newErrors.customPrice = "Please enter a valid custom price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || !business?.id || !id) return;

    try {
      const comboData = {
        name: form.name.trim(),
        description: form.description.trim(),
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          required: item.required, // Include required field
        })),
        price: finalPrice,
        categories: ["Combos"],
        isAvailable: form.isAvailable,
        isCombo: true,
      };

      await updateProduct(id as string, comboData);
      router.push("/products");
    } catch (error) {
      console.error("Failed to update combo:", error);
      setErrors({ submit: "Failed to update combo" });
    }
  };

  if (!business || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading combo data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/products">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Edit Combo Meal
              </h1>
              <p className="text-sm text-gray-500">Update your combo product</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Combo Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Combo Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Combo Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 ${
                    errors.name ? "border-red-300" : ""
                  }`}
                  placeholder="e.g., Budget Rice Feast"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 resize-none ${
                    errors.description ? "border-red-300" : ""
                  }`}
                  placeholder="Describe your combo meal..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isAvailable: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="text-sm text-gray-700">
                  Available for Sale
                </label>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                <span>Category: Combos</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                <span>Marked as Combo</span>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Products
                </h2>
              </div>
              <button
                onClick={() => setShowProductSelector(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {errors.items && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{errors.items}</p>
              </div>
            )}

            {/* Selected Items */}
            {form.items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No products selected</p>
                <p className="text-sm text-gray-400">
                  Add products to build your combo meal
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.product?.image ? (
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.product?.price || 0)} each
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="checkbox"
                          id={`required-${item.productId}`}
                          checked={item.required}
                          onChange={() => toggleRequired(item.productId)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <label
                          htmlFor={`required-${item.productId}`}
                          className="text-sm text-gray-700"
                        >
                          Required
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(
                          (item.product?.price || 0) * item.quantity
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Pricing */}
          {form.items.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useCustomPrice"
                    checked={form.useCustomPrice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        useCustomPrice: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label
                    htmlFor="useCustomPrice"
                    className="text-sm text-gray-700"
                  >
                    Set custom price (override calculated total)
                  </label>
                </div>

                {form.useCustomPrice && (
                  <div>
                    <label
                      htmlFor="customPrice"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Custom Price (₦)
                    </label>
                    <input
                      type="number"
                      id="customPrice"
                      value={form.customPrice}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customPrice: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 ${
                        errors.customPrice ? "border-red-300" : ""
                      }`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.customPrice && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.customPrice}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Combo Preview */}
        <div className="lg:w-80 bg-white border-l border-gray-200 p-6">
          <div className="sticky top-24">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Combo Preview
              </h3>
            </div>

            <div className="space-y-4">
              {/* Combo Name */}
              <div>
                <h4 className="font-medium text-gray-900">
                  {form.name || "Untitled Combo"}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {form.description || "No description"}
                </p>
              </div>

              {/* Combo Status */}
              <div className="text-sm text-gray-600">
                <p>Category: Combos</p>
                <p>Status: {form.isAvailable ? "Available" : "Unavailable"}</p>
                <p>Type: Combo</p>
              </div>

              {/* Items Summary */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Items ({form.items.length})
                </h5>
                {form.items.length === 0 ? (
                  <p className="text-sm text-gray-500">No items selected</p>
                ) : (
                  <div className="space-y-2">
                    {form.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {item.quantity}x {item.product?.name}{" "}
                          {item.required ? "(Required)" : ""}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            (item.product?.price || 0) * item.quantity
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              {form.items.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Calculated Total:</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedTotal)}
                      </span>
                    </div>
                    {form.useCustomPrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Custom Price:</span>
                        <span className="font-medium">
                          {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Final Price:</span>
                      <span className="text-orange-600">
                        {formatCurrency(finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  comboLoading || productsLoading || form.items.length < 2
                }
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {comboLoading || productsLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Update Combo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          iniciando
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Product
              </h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Search products..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product.id)}
                      className="flex items-center justify-between w-full p-3 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-orange-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}