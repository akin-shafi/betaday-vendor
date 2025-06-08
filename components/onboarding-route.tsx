"use client";

import type React from "react";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface OnboardingRouteProps {
  children: React.ReactNode;
}

export default function OnboardingRoute({ children }: OnboardingRouteProps) {
  const { vendor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!vendor) {
        router.push("/auth/login");
      } else if (vendor.isOnboardingComplete) {
        router.push("/dashboard");
      }
    }
  }, [vendor, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandmain mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  if (vendor.isOnboardingComplete) {
    return null;
  }

  return <>{children}</>;
}
