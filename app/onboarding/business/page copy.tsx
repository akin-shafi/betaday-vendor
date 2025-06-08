"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setSession, useAuth } from "@/providers/auth-provider";
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { getSession } from "@/providers/auth-provider"; // Import getSession
import { Vendor } from "@/types/vendor";

interface BusinessData {
  name: string;
  description: string;
  businessType: string;
  contactNumber: string;
  website: string;
  address: string;
  city: string;
  state: string;
  localGovernment: string;
  openingTime: string;
  closingTime: string;
  businessDays: string;
  deliveryOptions: string[];
  accountNumber: string;
  bankName: string;
  accountName: string;
}

const DELIVERY_OPTIONS = ["In-house", "Pickup", "Delivery"];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const { vendor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);

  const [businessData, setBusinessData] = useState<BusinessData>({
    name: "",
    description: "",
    businessType: "",
    contactNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    localGovernment: "",
    openingTime: "08:00",
    closingTime: "18:00",
    businessDays: "Monday - Friday",
    deliveryOptions: ["In-house"],
    accountNumber: "",
    bankName: "",
    accountName: "",
  });

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/groups?isActive=true`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch business types");
        }

        const data = await response.json();
        // Map over data.groups instead of data
        const types = data.groups.map((item: any) => item.name);
        setBusinessTypes(types);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch business types";
        setErrors((prev) => ({ ...prev, businessType: errorMessage }));
      }
    };

    fetchBusinessTypes();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setBusinessData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDeliveryOptionsChange = (option: string) => {
    setBusinessData((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(option)
        ? prev.deliveryOptions.filter((o) => o !== option)
        : [...prev.deliveryOptions, option],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!businessData.name.trim()) newErrors.name = "Business name is required";
    if (!businessData.description.trim())
      newErrors.description = "Description is required";
    if (!businessData.businessType)
      newErrors.businessType = "Business type is required";
    if (!businessData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";
    if (!businessData.address.trim()) newErrors.address = "Address is required";
    if (!businessData.city.trim()) newErrors.city = "City is required";
    if (!businessData.state.trim()) newErrors.state = "State is required";
    if (!businessData.openingTime)
      newErrors.openingTime = "Opening time is required";
    if (!businessData.closingTime)
      newErrors.closingTime = "Closing time is required";
    if (businessData.deliveryOptions.length === 0)
      newErrors.deliveryOptions = "Select at least one delivery option";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const session = getSession();
      if (!session?.token || !vendor) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/businesses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            ...businessData,
            userId: vendor.id,
            openingTime: `${businessData.openingTime}:00`,
            closingTime: `${businessData.closingTime}:00`,
            isActive: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create business");
      }

      // Update user's onboarding status
      const updateResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/auth/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify({
            isOnboardingComplete: true,
            onboardingStep: 3,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(
          errorData.message || "Failed to update onboarding status"
        );
      }

      const updatedVendor: Vendor = await updateResponse.json();
      setSession({ ...session, user: updatedVendor });
      router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create business";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandmain mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-brandmain rounded-full flex items-center justify-center mx-auto mb-2">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Business Setup</h1>
            <p className="text-gray-600 text-sm">
              Complete your business profile
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        <div className="bg-custom-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {vendor.fullName}!
            </h2>
          </div>
          <p className="text-gray-600">
            Your account has been created successfully. Now let's set up your
            business profile to start selling.
          </p>
        </div>

        <div className="bg-custom-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Name *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={businessData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.name ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your business name"
                />
              </div>
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="businessType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={businessData.businessType}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                  errors.businessType ? "border-red-300" : ""
                }`}
                disabled={isLoading || businessTypes.length === 0}
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.businessType}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={businessData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                  errors.description ? "border-red-300" : ""
                }`}
                placeholder="Describe your business and what you offer"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={businessData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.contactNumber ? "border-red-300" : ""
                  }`}
                  placeholder="Business phone number"
                />
              </div>
              {errors.contactNumber && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={businessData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                placeholder="https://your-website.com"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={businessData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.address ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your business address"
                />
              </div>
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={businessData.city}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.city ? "border-red-300" : ""
                  }`}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={businessData.state}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.state ? "border-red-300" : ""
                  }`}
                  placeholder="State"
                />
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="localGovernment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Local Government (Optional)
              </label>
              <input
                type="text"
                id="localGovernment"
                name="localGovernment"
                value={businessData.localGovernment}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                placeholder="Local Government Area"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="openingTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Opening Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    id="openingTime"
                    name="openingTime"
                    value={businessData.openingTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                      errors.openingTime ? "border-red-300" : ""
                    }`}
                  />
                </div>
                {errors.openingTime && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.openingTime}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="closingTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Closing Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    id="closingTime"
                    name="closingTime"
                    value={businessData.closingTime}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                      errors.closingTime ? "border-red-300" : ""
                    }`}
                  />
                </div>
                {errors.closingTime && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.closingTime}
                  </p>
                )}
              </div>
            </div>

            {/* Business Days */}
            <div>
              <label
                htmlFor="businessDays"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Days
              </label>
              <input
                type="text"
                id="businessDays"
                name="businessDays"
                value={businessData.businessDays}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                placeholder="e.g., Monday - Friday"
              />
            </div>

            {/* Delivery Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Options *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DELIVERY_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={businessData.deliveryOptions.includes(option)}
                      onChange={() => handleDeliveryOptionsChange(option)}
                      className="rounded border-gray-300 text-brandmain focus:ring-brandmain"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.deliveryOptions && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.deliveryOptions}
                </p>
              )}
            </div>

            {/* Bank Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Bank Account Details (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bankName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={businessData.bankName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                    placeholder="Enter bank name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="accountName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={businessData.accountName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                    placeholder="Enter account name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="accountNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={businessData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors"
                      placeholder="Enter account number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brandmain text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
