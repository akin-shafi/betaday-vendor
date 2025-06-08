"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface SignupFormValues {
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
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormValues>({
    defaultValues: {
      firstName: "Abiola",
      lastName: "Badmus",
      email: "betadayfinance@gmail.com",
      phone: "+2349163359982",
      password: "Vendor@123",
      confirmPassword: "Vendor@123",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setGeneralError(null);
      await signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      // Redirect handled by AuthProvider
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again."
      );
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
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Personal Information
              </h2>
              <p className="text-gray-600 mt-1">Tell us about yourself</p>
            </div>

            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{generalError}</p>
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
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <input
                      id="firstName"
                      type="text"
                      {...field}
                      className={`w-full px-3 py-3 pl-10 border rounded-lg ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                      placeholder="Enter your first name"
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.firstName.message}
                </p>
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
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <input
                      id="lastName"
                      type="text"
                      {...field}
                      className={`w-full px-3 py-3 pl-10 border rounded-lg ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                      placeholder="Enter your last name"
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.lastName.message}
                </p>
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
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      id="email"
                      type="email"
                      {...field}
                      className={`w-full px-3 py-3 pl-10 border rounded-lg ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.email.message}
                </p>
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
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <div className="pl-10">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        defaultCountry="NG"
                        international
                        countryCallingCodeEditable={false}
                        className={`w-full rounded-lg border px-3 py-3 ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone.message}
                </p>
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
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className={`w-full px-3 py-3 pl-10 pr-10 border rounded-lg ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                      placeholder="Enter password"
                      disabled={isLoading}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                <p className="text-red-600 text-sm mt-1">
                  {errors.password.message}
                </p>
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
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  }}
                  render={({ field }) => (
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className={`w-full px-3 py-3 pl-10 pr-10 border rounded-lg ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-brandmain`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
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
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{generalError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-brandmain text-white font-semibold rounded-lg hover:bg-orange-600 transition"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brandmain font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
