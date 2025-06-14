/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";

const InstallAppPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Guard check to ensure window is defined
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent;
    const isAndroid = /Android/.test(userAgent);
    const isStandalone =
      "standalone" in navigator &&
      (navigator.standalone ||
        window.matchMedia("(display-mode: standalone)").matches);

    // Handle Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isAndroid && !isStandalone) {
        setShowPrompt(true);
      }
    };

    // Show prompt only for Android if not in standalone mode
    if (isAndroid && !isStandalone) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // Auto-hide after 60 seconds
      const hidePromptTimeout = setTimeout(() => {
        setShowPrompt(false);
      }, 60000);

      // Cleanup
      return () => {
        clearTimeout(hidePromptTimeout);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger the deferred prompt for Android
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 bg-black text-white p-4 rounded-lg shadow-lg z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-md mx-auto">
          <p className="text-sm md:text-base font-medium">
            Install this app: click the button to add it to your home screen.
          </p>
          <button
            className="bg-orange-500 text-black px-4 py-2 rounded-md font-medium text-sm hover:bg-orange-600 transition-colors w-full sm:w-auto"
            onClick={handleInstallClick}
          >
            Add to Home Screen
          </button>
        </div>
      )}
    </>
  );
};

export default InstallAppPrompt;
