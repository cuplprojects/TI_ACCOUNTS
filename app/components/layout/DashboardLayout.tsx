"use client";

import React, { useState } from "react";
import Header from "./Header";
import { cn } from "@/app/lib/utils";
import { useRequireAuth } from "@/app/providers/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  className,
}: DashboardLayoutProps) {
  const { isAuthenticated } = useRequireAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main content area with scrollable content */}
      <main className={cn("px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-2 xs:py-3 sm:py-4 flex-1 overflow-y-auto", className)}>
        {children}
      </main>
    </div>
  );
}
