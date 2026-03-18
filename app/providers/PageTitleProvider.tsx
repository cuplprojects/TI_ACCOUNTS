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
    // Extract the main path segment
    const mainPath = pathname?.split("/").filter(Boolean)[1] || "";
    const matchPath = `/${mainPath}`;

    // Find matching sidebar item
    const matchingItem = sidebarData.navigation.find(
      (item) => item.path === matchPath
    );

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
