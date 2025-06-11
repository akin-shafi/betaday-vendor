"use client";

import type React from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Phone,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [isPhone, setIsPhone] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "betadayfinance@gmail.com",
    password: "Vendor@123",
    // identifier: "",
    // password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Handle different input formats
    if (digits.startsWith("234")) {
      return `+${digits}`;
    } else if (digits.startsWith("0")) {
      return `+234${digits.slice(1)}`;
    } else if (digits.length <= 10) {
      return `+234${digits}`;
    }
    return value;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier) {
      newErrors.identifier = isPhone
        ? "Phone number is required"
        : "Email is required";
    } else if (isPhone) {
      const phoneRegex = /^\+234\d{10}$|^0\d{10}$/;
      if (!phoneRegex.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid Nigerian phone number";
      }
    } else {
      if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid email";
      }
    }

    if (!isPhone && !formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let identifier = formData.identifier;

      // Format phone number if needed
      if (isPhone) {
        identifier = formatPhoneNumber(identifier);
      }

      const result = await login({
        identifier,
        password: isPhone ? undefined : formData.password,
        rememberMe: formData.rememberMe,
      });
      console.log("result", result);

      // if(result  ){

      // }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? "Invalid Credentials. Please try again"
            : "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BetaDay Vendor</h1>
          <p className="text-gray-600 mt-2">Sign in to your vendor account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Login Method Toggle */}
          <div className="flex space-x-2 mb-6">
            <button
              type="button"
              onClick={() => setIsPhone(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isPhone
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setIsPhone(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isPhone
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session timeout message */}
            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-blue-800 text-sm">{message}</p>
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Identifier (Email or Phone) */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {isPhone ? "Phone Number" : "Email Address"}
              </label>
              <div className="relative">
                {isPhone ? (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={isPhone ? "tel" : "email"}
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.identifier ? "border-red-300 focus:ring-red-500" : ""
                  }`}
                  placeholder={
                    isPhone ? "Enter your phone number" : "Enter your email"
                  }
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-600 text-sm mt-1">{errors.identifier}</p>
              )}
              {isPhone && (
                <p className="text-xs text-gray-500 mt-1">
                  Format: +234XXXXXXXXXX or 0XXXXXXXXXX
                </p>
              )}
            </div>

            {/* Password (only for email login) */}
            {!isPhone && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                      errors.password ? "border-red-300 focus:ring-red-500" : ""
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password (only for email login) */}
            {!isPhone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me for 7 days
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Login Method Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                {isPhone
                  ? "📱 We'll send you an OTP to verify your phone number"
                  : formData.rememberMe
                  ? "✓ Stay signed in for 7 days"
                  : "⏰ Session expires after 24 hours"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isPhone ? "Send OTP" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Or Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
