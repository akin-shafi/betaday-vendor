"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  setSession,
  clearSession,
  updateSessionUser,
  getSessionToken,
  updateLastActivity,
  shouldRefreshSession,
  checkInactivity,
  type Vendor,
} from "@/lib/session";

interface VendorSignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface VendorLoginData {
  identifier: string;
  password?: string;
  rememberMe?: boolean;
}

interface ProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bank_name?: string;
  profileImage?: File;
}

interface AuthContextType {
  vendor: Vendor | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (data: VendorSignupData) => Promise<void>;
  login: (data: VendorLoginData) => Promise<void>;
  verifyOTP: (
    phoneNumber: string,
    otp: string,
    source: "login" | "signup"
  ) => Promise<{ success: boolean; data?: Vendor }>;
  resendOTP: (
    phoneNumber: string,
    source: "login" | "signup"
  ) => Promise<{ success: boolean }>;
  forgotPassword: (identifier: string) => Promise<void>;
  resetPassword: (
    identifier: string,
    otp: string,
    newPassword: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (
    profileData: ProfileData
  ) => Promise<{ success: boolean; data: Vendor }>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean }>;
  deleteAccount: () => Promise<{ success: boolean }>;
  refreshVendor: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Set session timeout to 1 hour to match backend token
const SESSION_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hour
// Set inactivity timeout to 10 seconds for testing (30 minutes in production - 30 * 60 * 1000)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 10 seconds for testing

export function AuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Use the provided API URL
  const baseUrl = "https://betapadi.onrender.com";

  const handleSessionTimeout = useCallback(() => {
    clearSession();
    // setVendor(null);
    router.push("/auth/login?message=Session expired. Please login again.");
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    setVendor(null);
    router.push("/auth/login?message=logout succesfully");
  }, [router]);

  // Update the refreshVendor function to better handle business data
  const refreshVendor = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getSessionToken();
      if (!token) throw new Error("No auth token found");

      // Get existing session to preserve business data
      const existingSession = getSession();
      const rememberMe = existingSession?.rememberMe || false;

      // Call API to get fresh user data
      const response = await fetch(`${baseUrl}/auth/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to refresh user data`);
      }

      const vendorData: Vendor = await response.json();

      // If we have business data in the existing session but not in the API response,
      // use the business data from the session
      if (existingSession?.user?.business && !vendorData.business) {
        vendorData.business = existingSession.user.business;
      }

      // Update session and state
      setVendor(vendorData);
      setSession({
        user: vendorData,
        token,
        rememberMe,
      });
    } catch (error) {
      console.error("Failed to refresh vendor data:", error);
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Session timeout and inactivity management
  useEffect(() => {
    let sessionTimeoutId: NodeJS.Timeout | null = null;
    let inactivityTimeoutId: NodeJS.Timeout | null = null;
    let refreshCheckId: NodeJS.Timeout | null = null;

    const resetTimeouts = () => {
      if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
      if (inactivityTimeoutId) clearTimeout(inactivityTimeoutId);

      sessionTimeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
      inactivityTimeoutId = setTimeout(() => {
        if (checkInactivity(INACTIVITY_TIMEOUT)) {
          handleSessionTimeout();
        }
      }, INACTIVITY_TIMEOUT);
    };

    const checkAndRefreshSession = async () => {
      if (vendor && shouldRefreshSession()) {
        try {
          await refreshVendor();
          console.log("Session refreshed automatically");
        } catch (error) {
          console.error("Failed to auto-refresh session:", error);
        }
      }
    };

    const handleActivity = () => {
      if (vendor) {
        updateLastActivity();
        resetTimeouts();
      }
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    if (vendor && isInitialized) {
      events.forEach((event) =>
        document.addEventListener(event, handleActivity, { passive: true })
      );
      resetTimeouts();

      // Check for session refresh every 15 minutes
      refreshCheckId = setInterval(checkAndRefreshSession, 15 * 60 * 1000);
    }

    return () => {
      if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
      if (inactivityTimeoutId) clearTimeout(inactivityTimeoutId);
      if (refreshCheckId) clearInterval(refreshCheckId);
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity)
      );
    };
  }, [vendor, handleSessionTimeout, isInitialized, refreshVendor]);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const session = getSession();
        if (session?.user && session?.token) {
          // Validate token with real API
          await validateToken(session.token);
        } else {
          setVendor(null);
          // router.push("/auth/login");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearSession();
        setVendor(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/auth/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Unauthorized: Invalid or expired token");
        router.push("/auth/login");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to validate token`);
      }

      const vendorData: Vendor = await response.json();
      if (!vendorData?.id) {
        throw new Error("Invalid vendor data received");
      }

      // Ensure business data is properly structured
      const completeVendorData: Vendor = {
        ...vendorData,
        business: vendorData.business || null,
      };

      // Get existing session to preserve any data not returned by the API
      const existingSession = getSession();
      const rememberMe = existingSession?.rememberMe || false;

      setVendor(completeVendorData);
      setSession({
        user: completeVendorData,
        token,
        rememberMe,
      });
    } catch (error) {
      console.error("Token validation error:", error);
      clearSession();
      setVendor(null);
      throw error;
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const signup = async (data: VendorSignupData) => {
    setIsLoading(true);
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const passwordError = validatePassword(data.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const apiPayload = {
        fullName: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phone.trim(),
        password: data.password,
        role: "vendor",
      };

      const response = await fetch(`${baseUrl}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP ${response.status}: Signup failed`
        );
      }

      const responseData = await response.json();
      const vendorData: Vendor = responseData.user;

      if (!vendorData?.id) {
        throw new Error("Invalid response from server");
      }

      setSession({
        user: vendorData,
        token: "",
        rememberMe: false,
      });
      setVendor(vendorData);

      await router.push(
        `/auth/verify-otp?phone=${encodeURIComponent(
          data.phone.trim()
        )}&source=signup`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: VendorLoginData) => {
    setIsLoading(true);
    try {
      const isPhoneNumber = /^\+?234\d{10}$|^0\d{10}$/.test(
        data.identifier.trim()
      );

      let response;
      if (isPhoneNumber) {
        console.log("Attempting phone login for:", data.identifier);
        response = await fetch(`${baseUrl}/users/login/phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: data.identifier.trim() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP ${response.status}: Failed to send OTP`
          );
        }

        console.log("Phone login successful, OTP sent");
        router.push(
          `/auth/verify-otp?phone=${encodeURIComponent(
            data.identifier.trim()
          )}&source=login`
        );
        return;
      } else {
        if (!data.password) {
          throw new Error("Password is required for email login");
        }

        console.log("Attempting email/password login for:", data.identifier);
        response = await fetch(`${baseUrl}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: data.identifier.trim().toLowerCase(),
            password: data.password,
          }),
        });

        if (response.status === 401) {
          throw new Error("Invalid credentials");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP ${response.status}: Login failed`
          );
        }

        const responseData = await response.json();
        const token = responseData.token;
        const vendorData: Vendor = responseData.user;

        if (!token || !vendorData?.id) {
          throw new Error("Invalid response from server");
        }

        // console.log("Login response data:", responseData);
        // console.log("Business data from login:", vendorData.business);

        const completeVendorData: Vendor = {
          ...vendorData,
          business: vendorData.business || null,
        };

        setSession({
          user: completeVendorData,
          token,
          rememberMe: data.rememberMe || false,
        });
        setVendor(completeVendorData);
        updateLastActivity();

        router.push("/dashboard");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (
    phoneNumber: string,
    otp: string,
    source: "login" | "signup"
  ) => {
    try {
      setIsLoading(true);
      const endpoint =
        source === "login"
          ? `${baseUrl}/users/login/phone`
          : `${baseUrl}/users/verify-signup-otp`;

      console.log("Verifying OTP for:", phoneNumber, "Source:", source);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp, source }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid OTP");
      }

      const data = await response.json();
      const token = data.token;
      const vendorData: Vendor = data.user;

      const completeVendorData: Vendor = {
        ...vendorData,
        business: vendorData.business || null,
      };

      setSession({
        user: completeVendorData,
        token,
        rememberMe: false,
      });
      setVendor(completeVendorData);
      updateLastActivity();

      if (source === "signup") {
        router.push("/onboarding/business");
      } else {
        router.push("/dashboard");
      }

      return { success: true, data: completeVendorData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "OTP verification failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (phoneNumber: string, source: "login" | "signup") => {
    try {
      setIsLoading(true);
      const endpoint =
        source === "login"
          ? `${baseUrl}/users/login/phone`
          : `${baseUrl}/users/resend-otp`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, source }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend OTP");
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (identifier: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to send reset link`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset link";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    identifier: string,
    otp: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    try {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const response = await fetch(`${baseUrl}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim().toLowerCase(),
          otp,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to reset password`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileData) => {
    try {
      setIsLoading(true);
      const session = getSession();
      if (!session?.token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      if (profileData.fullName)
        formData.append("fullName", profileData.fullName);
      if (profileData.email) formData.append("email", profileData.email);
      if (profileData.phoneNumber)
        formData.append("phoneNumber", profileData.phoneNumber);
      if (profileData.dateOfBirth)
        formData.append("dateOfBirth", profileData.dateOfBirth);
      if (profileData.bank_name)
        formData.append("bank_name", profileData.bank_name);
      if (profileData.profileImage)
        formData.append("profileImage", profileData.profileImage);

      const response = await fetch(`${baseUrl}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      const updatedVendor: Vendor = data.user;

      // Preserve existing business data if not returned from API
      const completeUpdatedVendor: Vendor = {
        ...updatedVendor,
        business: updatedVendor.business || session.user.business || null,
      };

      updateSessionUser(completeUpdatedVendor);
      setVendor(completeUpdatedVendor);

      return { success: true, data: completeUpdatedVendor };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setIsLoading(true);
      const token = getSessionToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const response = await fetch(`${baseUrl}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update password";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      const token = getSessionToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${baseUrl}/users/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      clearSession();
      setVendor(null);
      router.push("/auth/login");

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    vendor,
    isLoading,
    isAuthenticated: !!vendor,
    signup,
    login,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    refreshVendor,
  };

  if (!isInitialized) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
