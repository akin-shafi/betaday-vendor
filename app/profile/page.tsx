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
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getSessionUser } from "@/lib/session";

// Define interface for formData to ensure type safety
interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bank_name: string;
  businessName: string;
  businessType: string;
  isOnboardingComplete: boolean;
  onboardingStep: number;
}

export default function ProfilePage() {
  // Add refreshUserData function
  const { vendor, updateProfile, isLoading, refreshVendor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    bank_name: "",
    businessName: "",
    businessType: "",
    isOnboardingComplete: false,
    onboardingStep: 1,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add refreshUserData function
  const refreshUserData = async () => {
    setIsRefreshing(true);
    try {
      await refreshVendor();
      // The vendor state will be updated by refreshVendor
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      setErrors({ general: "Failed to refresh user data. Please try again." });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update the useEffect to better handle business data
  useEffect(() => {
    // Use session utility instead of calling getSession from auth provider
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
        businessName: user.business?.name || "",
        businessType: user.business?.businessType || "",
        isOnboardingComplete: user.isOnboardingComplete || false,
        onboardingStep: user.onboardingStep || 1,
      });
    }
  }, [vendor]); // Only depend on vendor, not session

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

    // Reset form data from current session/vendor data using session utility
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
        businessName: user.business?.name || "",
        businessType: user.business?.businessType || "",
        isOnboardingComplete: user.isOnboardingComplete || false,
        onboardingStep: user.onboardingStep || 1,
      });
    }
  };

  if (isLoading) {
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

  // Add a debug section to help troubleshoot
  const renderDebugInfo = () => {
    const sessionUser = getSessionUser();

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Session User ID: {sessionUser?.id || "Not set"}</p>
        <p>Vendor User ID: {vendor?.id || "Not set"}</p>
        <p>
          Business Name from Session: {sessionUser?.business?.name || "Not set"}
        </p>
        <p>
          Business Type from Session:{" "}
          {sessionUser?.business?.businessType || "Not set"}
        </p>
        <p>Business Name from Vendor: {vendor?.business?.name || "Not set"}</p>
        <p>
          Business Type from Vendor:{" "}
          {vendor?.business?.businessType || "Not set"}
        </p>
      </div>
    );
  };

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
              onClick={refreshUserData}
              disabled={isRefreshing}
              className="text-gray-600 font-medium p-2 hover:bg-gray-100 rounded-lg"
            >
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              ) : (
                "Refresh"
              )}
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

        {/* Debug Info - Remove in production */}
        {renderDebugInfo()}

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
            <p className="text-gray-600">
              {formData.businessName || "Business Name"}
            </p>
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
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Business Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-400" />
                <p className="text-gray-900">
                  {formData.businessName || "Not provided"}
                </p>
              </div>
              {isEditing && (
                <p className="text-sm text-gray-500 mt-1">
                  To update business name, go to{" "}
                  <Link
                    href="/business-settings"
                    className="text-orange-600 hover:underline"
                  >
                    Business Settings
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <p className="text-gray-900">
                {formData.businessType || "Not provided"}
              </p>
              {isEditing && (
                <p className="text-sm text-gray-500 mt-1">
                  To update business type, go to{" "}
                  <Link
                    href="/business-settings"
                    className="text-orange-600 hover:underline"
                  >
                    Business Settings
                  </Link>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onboarding Status
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    formData.isOnboardingComplete
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                ></div>
                <p className="text-gray-900">
                  {formData.isOnboardingComplete
                    ? "Complete"
                    : `Step ${formData.onboardingStep || 1} of 4`}
                </p>
              </div>
            </div>
          </div>
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
    </div>
  );
}
