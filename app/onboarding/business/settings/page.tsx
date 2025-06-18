"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getSession } from "@/lib/session";
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  Save,
} from "lucide-react";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";
import { useDescriptionSuggestion } from "@/hooks/useDescriptionSuggestion";
import { Select } from "antd";
import type { SelectProps } from "antd";

const { Option } = Select;

interface Bank {
  name: string;
  code: string;
  slug: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  businessType: string;
  contactNumber: string;
  website: string;
  address: string;
  city: string;
  state: string;
  localGovernment: string;
  latitude: number | null;
  longitude: number | null;
  openingTime: string;
  closingTime: string;
  businessDays: string;
  deliveryOptions: string[];
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountName: string;
}

const DELIVERY_OPTIONS = ["In-house", "Pickup", "Delivery"];

export default function BusinessSettingsPage() {
  const router = useRouter();
  const { vendor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isFetchingBanks, setIsFetchingBanks] = useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [fetchSuggestion, setFetchSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [businessData, setBusinessData] = useState<Business>({
    id: "",
    name: "",
    description: "",
    businessType: "",
    contactNumber: "",
    website: "",
    address: "",
    city: "",
    state: "",
    localGovernment: "",
    latitude: null,
    longitude: null,
    openingTime: "08:00",
    closingTime: "18:00",
    businessDays: "Monday - Friday",
    deliveryOptions: ["In-house"],
    accountNumber: "",
    bankName: "",
    bankCode: "",
    accountName: "",
  });

  const {
    input: addressInput,
    setInput: setAddressInput,
    suggestions,
    loading: addressLoading,
    debouncing,
    error: addressError,
  } = useAddressAutocomplete();

  const { suggestedDescription, isLoading: suggestionLoading } =
    useDescriptionSuggestion({
      businessType: businessData.businessType,
      businessName: businessData.name,
    });

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setIsFetching(true);
        const session = getSession();
        if (!session?.token || !vendor?.id) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"
          }/businesses/user/${vendor.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("No business found for this user");
          }
          throw new Error(`Failed to fetch business data: ${response.status}`);
        }

        const data = await response.json();

        if (
          !data.businesses ||
          !Array.isArray(data.businesses) ||
          data.businesses.length === 0
        ) {
          throw new Error("No business found for this user");
        }

        const businessInfo = data.businesses[0];

        if (!businessInfo || !businessInfo.id) {
          throw new Error("Invalid business data received");
        }

        const formatTime = (timeString: string) => {
          if (!timeString) return "";
          return timeString.substring(0, 5);
        };

        const parseDeliveryOptions = (
          options: string | string[] | undefined
        ) => {
          if (Array.isArray(options)) return options;
          if (typeof options === "string") {
            try {
              return JSON.parse(options);
            } catch (e) {
              return options.split(",").map((opt) => opt.trim());
            }
          }
          return ["In-house"];
        };

        setBusinessData({
          id: businessInfo.id,
          name: businessInfo.name || "",
          description: businessInfo.description || "",
          businessType: businessInfo.businessType || "",
          contactNumber: businessInfo.contactNumber || "",
          website: businessInfo.website || "",
          address: businessInfo.address || "",
          city: businessInfo.city || "",
          state: businessInfo.state || "",
          localGovernment: businessInfo.localGovernment || "",
          latitude:
            businessInfo.latitude !== undefined
              ? Number(businessInfo.latitude)
              : null,
          longitude:
            businessInfo.longitude !== undefined
              ? Number(businessInfo.longitude)
              : null,
          openingTime: formatTime(businessInfo.openingTime) || "08:00",
          closingTime: formatTime(businessInfo.closingTime) || "18:00",
          businessDays: businessInfo.businessDays || "Monday - Friday",
          deliveryOptions: parseDeliveryOptions(businessInfo.deliveryOptions),
          accountNumber: businessInfo.accountNumber || "",
          bankName: businessInfo.bankName || "",
          bankCode: businessInfo.bankCode || "",
          accountName: businessInfo.accountName || "",
        });

        setAddressInput(businessInfo.address || "");
      } catch (error) {
        console.error("Error fetching business data:", error);
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Failed to fetch business data",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchBusinessData();
  }, [vendor, setAddressInput]);

  // Fetch business types
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"
          }/api/groups?isActive=true`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch business types: ${response.status}`);
        }

        const data = await response.json();
        const types = data.groups?.map((item: any) => item.name) || [];
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

  // Fetch banks
  useEffect(() => {
    const fetchBanks = async () => {
      setIsFetchingBanks(true);
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"
          }/api/banks`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch banks");
        }

        const data = await response.json();
        setBanks(data.data);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          bankName: "Failed to load banks. Please try again.",
        }));
      } finally {
        setIsFetchingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  // Handle account resolution on blur
  const handleResolveAccount = async () => {
    if (
      businessData.accountNumber.length !== 10 ||
      !businessData.bankCode ||
      isResolvingAccount
    ) {
      return;
    }

    setIsResolvingAccount(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"
        }/api/banks/resolve-account?account_number=${
          businessData.accountNumber
        }&bank_code=${businessData.bankCode}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve account");
      }

      const data = await response.json();
      setBusinessData((prev) => ({
        ...prev,
        accountName: data.data.account_name,
      }));
      setErrors((prev) => ({ ...prev, accountNumber: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        accountNumber: "Invalid account number or bank code",
      }));
      setBusinessData((prev) => ({ ...prev, accountName: "" }));
    } finally {
      setIsResolvingAccount(false);
    }
  };

  // Sync address input
  useEffect(() => {
    if (businessData.address !== addressInput) {
      setAddressInput(businessData.address);
    }
  }, [businessData.address, addressInput, setAddressInput]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply suggested description
  useEffect(() => {
    if (fetchSuggestion && suggestedDescription && !suggestionLoading) {
      setBusinessData((prev) => ({
        ...prev,
        description: suggestedDescription,
      }));
      setFetchSuggestion(false);
    }
  }, [suggestedDescription, suggestionLoading, fetchSuggestion]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setBusinessData((prev) => ({ ...prev, [name]: value }));
    if (name === "address") {
      setAddressInput(value);
      setShowSuggestions(value.trim().length > 0);
      setActiveSuggestionIndex(-1);
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle bank selection
  const handleBankChange = (value: string) => {
    const selectedBank = banks.find((bank) => bank.name === value);
    setBusinessData((prev) => ({
      ...prev,
      bankName: value,
      bankCode: selectedBank ? selectedBank.code : "",
      accountName: "", // Reset account name when bank changes
    }));
    if (errors.bankName) {
      setErrors((prev) => ({ ...prev, bankName: "" }));
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle delivery options
  const handleDeliveryOptionsChange = (option: string) => {
    setBusinessData((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(option)
        ? prev.deliveryOptions.filter((o) => o !== option)
        : [...prev.deliveryOptions, option],
    }));
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle address suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    const formatLocalGovernment = (localGov: string) => {
      if (!localGov) return "";
      return localGov.replace(/\/|\s+/g, "-");
    };

    setBusinessData((prev) => ({
      ...prev,
      address: suggestion.description,
      city: formatLocalGovernment(suggestion.details?.localGovernment) || "",
      state: suggestion.details?.state || "",
      localGovernment:
        formatLocalGovernment(suggestion.details?.localGovernment) || "",
      latitude:
        suggestion.details?.latitude !== undefined
          ? Number(suggestion.details.latitude)
          : null,
      longitude:
        suggestion.details?.longitude !== undefined
          ? Number(suggestion.details.longitude)
          : null,
    }));
    setAddressInput(suggestion.description);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          handleSuggestionSelect(suggestions[activeSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle description suggestion
  const handleDescriptionSuggestion = () => {
    if (!businessData.businessType) {
      setSuggestionError("Please select a business type");
      return;
    }
    setSuggestionError(null);
    setFetchSuggestion(true);
  };

  // Validate form
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
    if (
      businessData.latitude === null ||
      businessData.longitude === null ||
      isNaN(businessData.latitude) ||
      isNaN(businessData.longitude)
    ) {
      newErrors.address =
        "Please select a valid address from the dropdown to set coordinates";
    }
    // Optional bank details validation
    if (
      businessData.accountNumber &&
      businessData.accountNumber.length !== 10
    ) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }
    if (businessData.accountNumber && !businessData.bankCode) {
      newErrors.bankName = "Please select a bank";
    }
    if (businessData.accountNumber && !businessData.accountName) {
      newErrors.accountNumber = "Please resolve account name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    const payload = {
      ...businessData,
      openingTime: businessData.openingTime
        ? `${businessData.openingTime}:00`
        : undefined,
      closingTime: businessData.closingTime
        ? `${businessData.closingTime}:00`
        : undefined,
      businessDays: businessData.businessDays || undefined,
      accountNumber: businessData.accountNumber || undefined,
      bankName: businessData.bankName || undefined,
      bankCode: businessData.bankCode || undefined,
      accountName: businessData.accountName || undefined,
      isActive: true,
    };

    try {
      const session = getSession();
      if (!session?.token || !vendor) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "https://betapadi.onrender.com"
        }/businesses/${businessData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update business: ${response.status}`
        );
      }

      const updatedBusiness = await response.json();

      setBusinessData({
        ...businessData,
        ...updatedBusiness,
      });

      setSuccessMessage("Business information updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update business";
      setErrors({ general: errorMessage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-2xl mx-auto mb-24">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Business Settings
            </h1>
            <p className="text-gray-600 text-sm">
              Update your business information
            </p>
          </div>
          <div className="w-16"></div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.name ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your business name"
                  required
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
                className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                  errors.businessType ? "border-red-300" : ""
                }`}
                disabled={isLoading || businessTypes.length === 0}
                required
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Business Description *
                </label>
                <button
                  type="button"
                  onClick={handleDescriptionSuggestion}
                  disabled={suggestionLoading || !businessData.businessType}
                  className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                    suggestionLoading || !businessData.businessType
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  {suggestionLoading ? "Loading..." : "Suggest Description"}
                </button>
              </div>
              {suggestionError && (
                <p className="text-red-600 text-sm mt-1">{suggestionError}</p>
              )}
              <textarea
                id="description"
                name="description"
                value={businessData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                  errors.description ? "border-red-300" : ""
                }`}
                placeholder="Describe your business and what you offer"
                required
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
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.contactNumber ? "border-red-300" : ""
                  }`}
                  placeholder="Business phone number"
                  required
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors"
                placeholder="https://your-website.com"
              />
            </div>

            <div className="relative" ref={addressInputRef}>
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
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.address ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your business address"
                  required
                />
                {(addressLoading || debouncing) && showSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    {debouncing && !addressLoading && (
                      <span className="text-xs text-gray-400 mr-2">
                        Typing...
                      </span>
                    )}
                    {addressLoading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-600"></div>
                    )}
                  </div>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                  {suggestions.map((suggestion: any, index: number) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                        index === activeSuggestionIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      {suggestion.description}
                      {!suggestion.details && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Details unavailable)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
              {addressError && (
                <p className="text-red-600 text-sm mt-1">{addressError}</p>
              )}
              {businessData.latitude !== null &&
                businessData.longitude !== null && (
                  <p className="text-sm text-gray-600 mt-1">
                    Coordinates: Lat {businessData.latitude.toFixed(6)}, Long{" "}
                    {businessData.longitude.toFixed(6)}
                  </p>
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
                  className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.city ? "border-red-300" : ""
                  }`}
                  placeholder="City"
                  required
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
                  className={`w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.state ? "border-red-300" : ""
                  }`}
                  placeholder="State"
                  required
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors"
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
                    className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                      errors.openingTime ? "border-red-300" : ""
                    }`}
                    required
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
                    className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                      errors.closingTime ? "border-red-300" : ""
                    }`}
                    required
                  />
                </div>
                {errors.closingTime && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.closingTime}
                  </p>
                )}
              </div>
            </div>

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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors"
                placeholder="e.g., Monday - Friday"
              />
            </div>

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
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
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
                  <div className="relative">
                    <Select
                      id="bankName"
                      value={businessData.bankName || undefined}
                      onChange={handleBankChange}
                      disabled={isFetchingBanks || isLoading}
                      showSearch
                      placeholder="Search and select a bank"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      className={`w-full ${
                        errors.bankName ? "border-red-300" : ""
                      }`}
                      suffixIcon={
                        isFetchingBanks ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-600"></div>
                        ) : null
                      }
                    >
                      {banks.map((bank) => (
                        <Option key={bank.code} value={bank.name}>
                          {bank.name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                  {errors.bankName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.bankName}
                    </p>
                  )}
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
                      onBlur={handleResolveAccount}
                      className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                        errors.accountNumber ? "border-red-300" : ""
                      }`}
                      placeholder="Enter 10-digit account number"
                    />
                    {isResolvingAccount && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-600"></div>
                      </div>
                    )}
                  </div>
                  {errors.accountNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.accountNumber}
                    </p>
                  )}
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
                    readOnly
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Account name will appear here"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isResolvingAccount}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Save Changes
                  <Save className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
