// Utility functions

// Type definitions
export type UserRole = "admin" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  permissions: string[];
}

// Check if code is running in browser
export const isBrowser = () => typeof window !== "undefined";

// Local storage utilities
export const getLocalStorage = <T>(key: string): T | null => {
  if (!isBrowser()) return null;

  try {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return null;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const removeLocalStorage = (key: string): void => {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

// Authentication utilities
export const USER_STORAGE_KEY = "ezmart_user";

export const getCurrentUser = (): User | null => {
  return getLocalStorage<User>(USER_STORAGE_KEY);
};

export const setCurrentUser = (user: User): void => {
  setLocalStorage<User>(USER_STORAGE_KEY, user);
};

export const removeCurrentUser = (): void => {
  removeLocalStorage(USER_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const getUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const isAdmin = (): boolean => {
  return getUserRole() === "admin";
};

export const isSeller = (): boolean => {
  return getUserRole() === "seller";
};

// Path utilities
export const getBasePath = (): string => {
  const role = getUserRole();
  return role ? `/(dashboard)/${role}` : "/(auth)/login";
};

// Route protection configuration
interface RouteConfig {
  path: string;
  is_protected: boolean;
}

let routeConfigs: RouteConfig[] = [
  { path: "/", is_protected: false },
  { path: "/login", is_protected: false },
  { path: "/register", is_protected: false },
  { path: "/seller/forgot-password", is_protected: false },
  { path: "/seller/change-password", is_protected: false },
  // All other routes are protected by default
];

export const isAuthRoute = (pathname: string): boolean => {
  // First check specific route configurations
  const routeConfig = routeConfigs.find((config) => {
    if (config.path === "/") {
      return pathname === "/";
    }
    return pathname.includes(config.path);
  });

  if (routeConfig) {
    return !routeConfig.is_protected;
  }

  // Default: if route includes /(auth) it's not protected, otherwise it is protected
  return pathname.includes("/(auth)");
};

export const isProtectedRoute = (pathname: string): boolean => {
  return !isAuthRoute(pathname);
};

export const requiresAuthentication = (pathname: string): boolean => {
  return isProtectedRoute(pathname);
};

// Helper function to add new unprotected routes
export const addUnprotectedRoute = (path: string): void => {
  const existingIndex = routeConfigs.findIndex(
    (config) => config.path === path
  );
  if (existingIndex >= 0) {
    routeConfigs[existingIndex].is_protected = false;
  } else {
    routeConfigs.push({ path, is_protected: false });
  }
};

// Helper function to check if a specific route is protected
export const isRouteProtected = (pathname: string): boolean => {
  const routeConfig = routeConfigs.find((config) => {
    if (config.path === "/") {
      return pathname === "/";
    }
    return pathname.includes(config.path);
  });

  if (routeConfig) {
    return routeConfig.is_protected;
  }

  // Default: routes not in /(auth) are protected
  return !pathname.includes("/(auth)");
};

// Class name utilities
export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};
