"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Camera,
  Save,
  MapPin,
  Clock,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getSessionUser } from "@/lib/session";
import { useBusiness } from "@/hooks/useBusiness";
import Footer from "@/components/footer";

// Define interface for formData to ensure type safety
interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bank_name: string;
}

// Add this helper function before the ProfilePage component
function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    // Try to parse it as JSON if it's a string representation of an array
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch (e) {
    // If it can't be parsed as JSON, treat it as a single string
    return [value];
  }
}

export default function ProfilePage() {
  const {
    vendor,
    updateProfile,
    isLoading: authLoading,
    refreshVendor,
  } = useAuth();
  const {
    business,
    isLoading: businessLoading,
    error: businessError,
    refetch: refetchBusiness,
  } = useBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    bank_name: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh both user and business data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshVendor(), refetchBusiness()]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      setErrors({ general: "Failed to refresh data. Please try again." });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update form data when vendor changes
  useEffect(() => {
    const sessionUser = getSessionUser();
    const user = sessionUser || vendor;

    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        bank_name: user.bank_name || "",
      });
    }
  }, [vendor]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (
      formData.phoneNumber &&
      !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Invalid phone number";
    }
    if (
      formData.dateOfBirth &&
      isNaN(new Date(formData.dateOfBirth).getTime())
    ) {
      newErrors.dateOfBirth = "Invalid date of birth";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // Prepare payload (exclude read-only fields)
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth || undefined,
        bank_name: formData.bank_name || undefined,
      };

      await updateProfile(payload);
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      setErrors({ general: errorMessage });
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});

    // Reset form data from current session/vendor data
    const sessionUser = getSessionUser();
    const user = sessionUser || vendor;

    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        bank_name: user.bank_name || "",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Use session utility to get current user
  const currentUser = vendor || getSessionUser();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Login
          </Link>
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
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshAllData}
              disabled={isRefreshing}
              className="text-gray-600 font-medium p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={isEditing ? handleCancel : () => setIsEditing(true)}
              className="text-orange-600 font-medium"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Business Error */}
        {businessError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-700 text-sm">
              Business data: {businessError}
            </p>
          </div>
        )}

        {/* Profile Image */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                {formData.fullName ? (
                  <span className="text-2xl font-bold text-orange-600">
                    {formData.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                ) : (
                  <User className="w-12 h-12 text-orange-600" />
                )}
              </div>
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center"
                  disabled // Placeholder for future implementation
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {formData.fullName || "Vendor Name"}
            </h2>
            <p className="text-gray-600">{business?.name || "Business Name"}</p>
            {businessLoading && (
              <p className="text-sm text-gray-500">Loading business info...</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Enter full name"
                />
              ) : (
                <p className="text-gray-900">
                  {formData.fullName || "Not provided"}
                </p>
              )}
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formData.email || "Not provided"}
                  </p>
                )}
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900">
                    {formData.phoneNumber || "Not provided"}
                  </p>
                )}
              </div>
              {errors.phoneNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Select date"
                />
              ) : (
                <p className="text-gray-900">
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </p>
              )}
              {errors.dateOfBirth && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) =>
                    handleInputChange("bank_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Enter bank name"
                />
              ) : (
                <p className="text-gray-900">
                  {formData.bank_name || "Not provided"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Business Information
            </h3>
            <div className="flex items-center gap-3">
              {businessLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              )}
              {business && (
                <Link
                  href="/onboarding/business/settings"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Edit Business
                </Link>
              )}
            </div>
          </div>

          {business ? (
            <div className="space-y-6">
              {/* Business Header */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {business.image ? (
                    <img
                      src={business.image || "/placeholder.svg"}
                      alt={business.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-gray-900 truncate">
                    {business.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {business.businessType}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          business.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-gray-600">
                        {business.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-gray-600">
                        {business.rating} ({business.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Description */}
              {business.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About
                  </label>
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}

              {/* Contact & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 border-b pb-2">
                    Contact Information
                  </h5>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Business Phone
                      </p>
                      <p className="text-gray-900">
                        {business.contactNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 text-gray-400 flex-shrink-0 flex items-center justify-center">
                        🌐
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Website
                        </p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 border-b pb-2">
                    Location
                  </h5>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Address
                      </p>
                      <p className="text-gray-900">
                        {business.address || "Not provided"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {business.city}, {business.state}
                        {business.localGovernment &&
                          ` • ${business.localGovernment}`}
                      </p>
                    </div>
                  </div>

                  {business.latitude && business.longitude && (
                    <div className="text-xs text-gray-500">
                      Coordinates: {Number(business.latitude).toFixed(4)},{" "}
                      {Number(business.longitude).toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Business Operations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Operating Hours */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 border-b pb-2">
                    Operating Hours
                  </h5>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Business Hours
                      </p>
                      <p className="text-gray-900">
                        {business.openingTime && business.closingTime
                          ? `${business.openingTime.substring(
                              0,
                              5
                            )} - ${business.closingTime.substring(0, 5)}`
                          : "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {business.businessDays || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 border-b pb-2">
                    Service Details
                  </h5>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Delivery Options
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {business.deliveryOptions ? (
                        ensureArray(business.deliveryOptions).map(
                          (option, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                            >
                              {option}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </p>
                    <p className="text-gray-900">
                      {business.priceRange || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Delivery Time
                    </p>
                    <p className="text-gray-900">
                      {business.deliveryTimeRange || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              {business.productCategories &&
                business.productCategories.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 border-b pb-2 mb-3">
                      Product Categories
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {business.productCategories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Payment Information */}
              <div>
                <h5 className="font-medium text-gray-900 border-b pb-2 mb-4">
                  Payment Information
                </h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Bank Name
                          </p>
                          <p className="text-gray-900">
                            {business.bankName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Account Name
                          </p>
                          <p className="text-gray-900">
                            {business.accountName || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Account Number
                          </p>
                          <p className="text-gray-900 font-mono">
                            {business.accountNumber
                              ? `****${business.accountNumber.slice(-4)}`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Metrics */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">
                  Business Metrics
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {business.rating}
                    </p>
                    <p className="text-sm text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {business.ratingCount}
                    </p>
                    <p className="text-sm text-gray-600">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {business.productCategories?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {ensureArray(business.deliveryOptions).length}
                    </p>
                    <p className="text-sm text-gray-600">Delivery Options</p>
                  </div>
                </div>
              </div>

              {/* Business ID & Slug (for reference) */}
              <div className="text-xs text-gray-500 border-t pt-4">
                <p>
                  <strong>Business ID:</strong> {business.id}
                </p>
                <p>
                  <strong>Slug:</strong> {business.slug}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Business Found
              </h4>
              <p className="text-gray-600 mb-6">
                You haven't set up your business profile yet.
              </p>
              <Link
                href="/onboarding/business"
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Building className="w-5 h-5" />
                Set up your business
              </Link>
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}
