"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import sidebarData from "@/app/data/sidebar.json";

type PageTitleContextType = {
  title: string;
  setTitle: (title: string) => void;
};

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined
);

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
};

type PageTitleProviderProps = {
  children: ReactNode;
  defaultTitle?: string;
};

export default function PageTitleProvider({
  children,
  defaultTitle = "Dashboard",
}: PageTitleProviderProps) {
  const [title, setTitle] = useState<string>(defaultTitle);
  const pathname = usePathname();

  // Set title based on current route and sidebar.json
  useEffect(() => {
    // Extract all path segments
    const segments = pathname?.split("/").filter(Boolean) || [];
    
    // Try to find a matching path - check from the last segment backwards
    let matchingItem = null;
    
    // First check if the full path matches (e.g., /dashboard/accounts/sales)
    for (let i = segments.length; i > 0; i--) {
      const testPath = "/" + segments.slice(0, i).join("/");
      
      // Check navigation
      matchingItem = sidebarData.navigation.find(
        (item) => item.path === testPath
      );
      
      // If not found, check accountsTabs
      if (!matchingItem) {
        matchingItem = sidebarData.accountsTabs.find(
          (item) => item.path === testPath
        );
      }
      
      if (matchingItem) break;
    }

    if (matchingItem) {
      setTitle(matchingItem.title);
    }
  }, [pathname]);

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}
