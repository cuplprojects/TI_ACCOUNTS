"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  UserRole,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  isAuthRoute,
} from "@/lib/utils";
import { getAuthToken, removeAuthTokens } from "@/lib/config/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userType: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if auth token exists in localStorage
        const authToken = getAuthToken();
        
        if (authToken) {
          // Token exists, user is authenticated
          const storedUser = getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
          setLoading(false);
        } else {
          // No token, user is not authenticated
          removeCurrentUser();
          setUser(null);
          setLoading(false);

          // Check if we're on an auth route (login, register, etc.)
          const isAuth = isAuthRoute(pathname);
          console.log(
            `Checking auth for pathname: ${pathname}, isAuthRoute: ${isAuth}`
          );
          if (!isAuth) {
            console.log("User not authenticated, redirecting to login");
            router.replace("/auth/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        removeAuthTokens();
        removeCurrentUser();
        setUser(null);
        setLoading(false);
        
        const isAuth = isAuthRoute(pathname);
        if (!isAuth) {
          router.replace("/auth/login");
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Also check authentication whenever pathname changes
  useEffect(() => {
    if (!loading) {
      const authToken = getAuthToken();
      
      if (!authToken) {
        // No token, user is not authenticated
        removeCurrentUser();
        setUser(null);
        
        const isAuth = isAuthRoute(pathname);
        console.log(
          `Route change - pathname: ${pathname}, isAuthRoute: ${isAuth}`
        );
        if (!isAuth) {
          console.log(
            "User not authenticated on route change, redirecting to login"
          );
          router.replace("/auth/login");
        }
      }
    }
  }, [pathname, loading, router]);

  const login = (userType: UserRole) => {
    // This would be called after successful API login
    // The token would already be set by the login API call
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      const dashboardRoute = userType === "admin" ? "/pages/admin" : "/pages/dashboard";
      router.replace(dashboardRoute);
    }
  };

  const logout = () => {
    setUser(null);
    removeCurrentUser();
    removeAuthTokens();
    router.replace("/auth/login");
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated and we're on a protected route
  const authToken = getAuthToken();
  if (!authToken) {
    const isAuth = isAuthRoute(pathname);
    console.log(`Render check - pathname: ${pathname}, isAuthRoute: ${isAuth}`);
    if (!isAuth) {
      return null; // Return null while redirecting
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const authToken = getAuthToken();
      
      if (!authToken) {
        if (!isAuthRoute(pathname)) {
          router.replace("/login");
        }
      }
    }
  }, [user, loading, router, pathname]);

  const authToken = getAuthToken();
  return { user, loading, isAuthenticated: !!authToken };
};
