"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Footer from "@/components/footer";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import { ReactNode } from "react";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const { vendor } = useAuth();
  const pathname = usePathname();
  const isAuthenticated = !!vendor;
  const isAuthRoute = pathname.startsWith("/auth");

  // Only show Footer and InstallAppPrompt on authenticated, non-auth routes
  const showLayoutComponents = isAuthenticated && !isAuthRoute;

  return (
    <>
      {children}
      {showLayoutComponents && (
        <>
          <InstallAppPrompt />
          <Footer />
        </>
      )}
    </>
  );
}
