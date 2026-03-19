"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import sidebarConfig from "@/constants/sidebar.json";

// Helper function to check if an icon name is a predefined icon or an image path
const isImagePath = (iconName: string): boolean => {
  return (
    iconName.includes("/") ||
    iconName.endsWith(".png") ||
    iconName.endsWith(".jpg") ||
    iconName.endsWith(".jpeg") ||
    iconName.endsWith(".svg") ||
    iconName.endsWith(".webp")
  );
};

// Renders either an SVG icon from the predefined set or an image from a path
const renderIcon = (iconName: string, isActive: boolean): React.ReactNode => {
  if (isImagePath(iconName)) {
    const activeFilter =
      "brightness(0) saturate(100%) invert(100%) sepia(19%) saturate(305%) hue-rotate(314deg) brightness(102%) contrast(101%)";
    const inactiveFilter =
      "brightness(0) saturate(100%) invert(42%) sepia(9%) saturate(111%) hue-rotate(169deg) brightness(94%) contrast(87%)";

    return (
      <div className="flex items-center justify-center overflow-hidden">
        <Image
          src={iconName}
          alt="Menu icon"
          width={16}
          height={16}
          className="object-contain"
          style={{
            filter: isActive ? activeFilter : inactiveFilter,
            transition: "filter 0.2s ease-in-out",
          }}
        />
      </div>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isActive ? "#FFF7F0" : "#6B6B6A"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
};

interface SidebarProps {
  className?: string;
  onNavClick?: () => void;
}

export default function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname();

  const navItems = sidebarConfig.navigation;

  return (
    <aside
      className={cn(
        "flex flex-col w-[200px] bg-white min-h-screen border-r border-gray-200",
        className
      )}
    >
      <div className="p-3 xs:p-4">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/images/common/logo.png"
            alt="Totally Indian"
            width={100}
            height={100}
          />
        </Link>
      </div>

      <nav className="flex-1 py-2 px-2 xs:px-3">
        <ul className="space-y-2">
          {/* Top Level Navigation */}
          {navItems.map((item, index) => {
            const fullPath = item.path;
            const isActive =
              pathname === fullPath || pathname.startsWith(`${fullPath}/`);

            return (
              <li key={`top-${index}`}>
                {item.topLevel === true && (
                  <Link
                    href={fullPath}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center px-3 xs:px-4 py-3 rounded-lg text-xs xs:text-sm font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-blue-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 xs:mr-3 flex-shrink-0">
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </Link>
                )}
              </li>
            );
          })}

          {/* break line */}
          <li className="py-3 xs:py-4">
            <div className="w-full h-[1px] bg-gray-200"></div>
          </li>

          {/* Bottom Level Navigation */}
          {navItems.map((item, index) => {
            const fullPath = item.path;
            const isActive =
              pathname === fullPath || pathname.startsWith(`${fullPath}/`);

            return (
              <li key={`bottom-${index}`}>
                {item.topLevel === false && (
                  <Link
                    href={fullPath}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center px-3 xs:px-4 py-3 rounded-lg text-xs xs:text-sm font-medium transition-all whitespace-nowrap",
                      isActive
                        ? "bg-blue-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 xs:mr-3 flex-shrink-0">
                      {renderIcon(item.icon, isActive)}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
