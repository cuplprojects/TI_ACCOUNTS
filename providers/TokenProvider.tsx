"use client";

import React, { useEffect } from "react";
import { startTokenManager, stopTokenManager } from "@/lib/utils/tokenManager";
import { getAuthToken } from "@/lib/config/auth";

interface TokenProviderProps {
  children: React.ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  useEffect(() => {
    // Only start token manager if user is authenticated
    const token = getAuthToken();
    if (token) {
      startTokenManager();
    }

    // Cleanup on unmount
    return () => {
      stopTokenManager();
    };
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        if (e.newValue) {
          // Token was set, start manager
          startTokenManager();
        } else {
          // Token was removed, stop manager
          stopTokenManager();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <>{children}</>;
};