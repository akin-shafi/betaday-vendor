"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: "Abiola",
    lastName: "Badmus",
    email: "help.betaday@gmail.com",
    phone: "09163359982",
    password: "vendor@123",
    confirmPassword: "vendor@123",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePersonalInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!personalInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!personalInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!personalInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!personalInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    if (!personalInfo.password) {
      newErrors.password = "Password is required";
    } else if (personalInfo.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (personalInfo.password !== personalInfo.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePersonalInfo()) return;

    try {
      // Use the auth provider's signup function
      await signup({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        password: personalInfo.password,
        confirmPassword: personalInfo.confirmPassword,
      });

      // const baseUrl =
      //   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

      // const response = await fetch(`${baseUrl}/users/register`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
      //     email: personalInfo.email,
      //     phoneNumber: personalInfo.phone,
      //     password: personalInfo.password,
      //     role: "vendor",
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Signup failed");
      // }

      // localStorage.setItem("vendor_token", "mock_token");
      // localStorage.setItem("vendor_onboarding_complete", "false");

      // router.push("/onboarding/business");
      // The auth provider will handle the redirect to /onboarding/business
    } catch (error: any) {
      setErrors({
        general: error.message || "Signup failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-brandmain rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-2xl font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                true ? "bg-brandmain text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-custom-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Personal Information
              </h2>
              <p className="text-gray-600 mt-1">Tell us about yourself</p>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.firstName ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.lastName ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.email ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.phone ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
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
                  value={personalInfo.password}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.password ? "border-red-300" : ""
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={personalInfo.confirmPassword}
                  onChange={handlePersonalInfoChange}
                  className={`w-full px-3 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain transition-colors ${
                    errors.confirmPassword ? "border-red-300" : ""
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-brandmain text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Or Divider */}
          <div className="or-divider my-6">
            <div className="or-line"></div>
            <span className="or-text">OR</span>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-brandmain hover:text-orange-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
