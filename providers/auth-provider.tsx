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

interface Vendor {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  dateOfBirth?: string | null;
  wallet_no?: string | null;
  wallet_balance?: number | null;
  bank_name?: string | null;
  onboardingStep: number;
  isOnboardingComplete: boolean;
  profileImage?: string | null;
}

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
  password: string;
}

interface ProfileData {
  fullName: string;
  email?: string;
  phoneNumber: string;
  profileImage?: File;
}

interface Session {
  user: Vendor;
  token: string;
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

// Session storage utilities
export const getSession = (): Session | null => {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("session");
  return session ? JSON.parse(session) : null;
};

export const setSession = (session: Session) => {
  localStorage.setItem("session", JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem("session");
  localStorage.removeItem("lastActivity");
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const handleSessionTimeout = useCallback(() => {
    clearSession();
    setVendor(null);
    router.push("/auth/login?message=Session expired. Please login again.");
  }, [router]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    };

    const handleActivity = () => {
      if (vendor) {
        localStorage.setItem("lastActivity", new Date().getTime().toString());
        resetTimeout();
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

    if (vendor) {
      events.forEach((event) =>
        document.addEventListener(event, handleActivity, { passive: true })
      );
      resetTimeout();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity)
      );
    };
  }, [vendor, handleSessionTimeout]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const session = getSession();
        if (session?.user && session?.token) {
          await validateToken(session.token);
        } else {
          setVendor(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearSession();
        setVendor(null);
      } finally {
        setIsLoading(false);
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
        throw new Error("Unauthorized: Invalid or expired token");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to validate token`);
      }

      const vendorData: Vendor = await response.json();
      if (!vendorData?.id) {
        throw new Error("Invalid vendor data received");
      }

      setVendor(vendorData);
      setSession({ user: vendorData, token });
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

      setSession({ user: vendorData, token: "" }); // Store user data temporarily without token
      setVendor(vendorData);

      await router.push(
        `/auth/verify-otp?phone=${encodeURIComponent(data.phone.trim())}`
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
      const response = await fetch(`${baseUrl}/users/login`, {
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

      const session: Session = { user: vendorData, token };
      setSession(session);
      setVendor(vendorData);
      localStorage.setItem("lastActivity", new Date().getTime().toString());

      await router.push("/dashboard");
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

      const session: Session = { user: vendorData, token };
      setSession(session);
      setVendor(vendorData);
      localStorage.setItem("lastActivity", new Date().getTime().toString());

      if (source === "signup") {
        router.push("/onboarding/business");
      }

      return { success: true, data: vendorData };
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

  const logout = useCallback(() => {
    clearSession();
    setVendor(null);
    router.push("/auth/login");
  }, [router]);

  const updateProfile = async (profileData: ProfileData) => {
    try {
      setIsLoading(true);
      const session = getSession();
      if (!session?.token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("fullName", profileData.fullName);
      if (profileData.email) formData.append("email", profileData.email);
      formData.append("phoneNumber", profileData.phoneNumber);
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

      const updatedSession: Session = { ...session, user: updatedVendor };
      setSession(updatedSession);
      setVendor(updatedVendor);

      return { success: true, data: updatedVendor };
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
      const session = getSession();
      if (!session?.token) {
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
          Authorization: `Bearer ${session.token}`,
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
      const session = getSession();
      if (!session?.token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${baseUrl}/users/account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      clearSession();
      setVendor(null);
      await router.push("/auth/login");

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVendor = async () => {
    setIsLoading(true);
    try {
      const session = getSession();
      if (!session?.token) throw new Error("No auth token found");

      await validateToken(session.token);
    } catch (error) {
      console.error("Failed to refresh vendor data:", error);
      logout();
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
