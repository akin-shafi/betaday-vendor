"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

interface OTPFormValues {
  otp: string;
}

export default function VerifyOTPPage() {
  const { verifyOTP, resendOTP, isLoading } = useAuth();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sanitize and normalize phone number
  const rawPhoneNumber = searchParams.get("phone") || "";
  const sanitizedPhoneNumber = rawPhoneNumber.trim().replace(/\s+/g, "");
  const phoneNumber = sanitizedPhoneNumber.startsWith("+")
    ? sanitizedPhoneNumber
    : `+${sanitizedPhoneNumber}`;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormValues>({
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    if (!/^\d*$/.test(value)) {
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) {
      return;
    }
    const digits = pastedData.slice(0, 4).split("");
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 4) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);
    const lastFilledIndex = Math.min(digits.length - 1, 3);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const onSubmit = async () => {
    if (!phoneNumber || phoneNumber === "+") {
      setError("Phone number is missing. Please try signing up again.");
      return;
    }

    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    try {
      setError(null);
      setResendSuccess(null);
      await verifyOTP(phoneNumber, otpValue, "signup");
      // Redirect to /onboarding/business handled by verifyOTP in AuthProvider
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to verify OTP. Please try again."
      );
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber || phoneNumber === "+") {
      setError("Phone number is missing. Please try signing up again.");
      return;
    }

    if (resendCountdown > 0 || isResending) {
      return;
    }

    try {
      setError(null);
      setResendSuccess(null);
      setIsResending(true);
      await resendOTP(phoneNumber, "signup");
      setResendSuccess("OTP resent successfully. Check your phone or email.");
      setResendCountdown(60);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
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
            <h1 className="text-xl font-bold text-gray-900">Verify OTP</h1>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              OTP Verification
            </h2>
            <p className="text-gray-600 mt-1">
              Enter the 4-digit OTP sent to your phone number{" "}
              {phoneNumber || "and email"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-600 text-sm">{resendSuccess}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-14 h-14 text-center text-2xl font-bold border rounded-lg ${
                    errors.otp || error ? "border-red-300" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-brandmain focus:border-brandmain`}
                  maxLength={1}
                  autoFocus={index === 0}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-brandmain text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Didn’t receive the code?{" "}
              {resendCountdown > 0 ? (
                <span>Resend in {resendCountdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-brandmain font-semibold hover:underline disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isResending || isLoading}
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Back to{" "}
            <Link href="/auth/signup" className="text-brandmain font-semibold">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
