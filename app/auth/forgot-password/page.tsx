"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    identifier: "",
    isPhone: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMethodToggle = (isPhone: boolean) => {
    setFormData((prev) => ({ ...prev, isPhone, identifier: "" }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.identifier) {
      newErrors.identifier = formData.isPhone
        ? "Phone number is required"
        : "Email is required";
    } else if (formData.isPhone) {
      // Nigerian phone number validation
      if (!/^(\+234|0)[789]\d{9}$/.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid Nigerian phone number";
      }
    } else {
      // Email validation
      if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await forgotPassword(formData.identifier);
      setSuccess(true);
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(
          `/auth/reset-password?identifier=${encodeURIComponent(
            formData.identifier
          )}`
        );
      }, 2000);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to send reset code. Please try again.",
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Reset Code Sent!
            </h1>
            <p className="text-gray-600 mb-4">
              We've sent a reset code to your{" "}
              {formData.isPhone ? "phone number" : "email address"}. Please
              check and enter the code on the next page.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email or phone to receive a reset code
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Method Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to receive the reset code?
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleMethodToggle(false)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                    !formData.isPhone
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  disabled={isLoading}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleMethodToggle(true)}
                  className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                    formData.isPhone
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  disabled={isLoading}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </button>
              </div>
            </div>

            {/* Identifier Input */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {formData.isPhone ? "Phone Number" : "Email Address"}
              </label>
              <div className="relative">
                {formData.isPhone ? (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={formData.isPhone ? "tel" : "email"}
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors ${
                    errors.identifier ? "border-red-300 focus:ring-red-500" : ""
                  }`}
                  placeholder={
                    formData.isPhone
                      ? "Enter your phone number"
                      : "Enter your email address"
                  }
                  disabled={isLoading}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-600 text-sm mt-1">{errors.identifier}</p>
              )}
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
                  Send Reset Code
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
